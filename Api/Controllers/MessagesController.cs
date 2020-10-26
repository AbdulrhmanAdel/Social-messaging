using System;
using System.Collections.Generic;
using System.Runtime.InteropServices.ComTypes;
using System.Security.Claims;
using System.Threading.Tasks;
using Api.Controllers.Dtos;
using Api.Helpers;
using Api.Models;
using AutoMapper;
using DatingApp.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Linq;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DatingApp.Api.Controllers.Dtos;
using DatingApp.Api.Helpers;
using DatingApp.Api.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
namespace Api.Controllers
{
    [ServiceFilter(typeof(LogUserActivity))]
    [Authorize]
    [Route("api/users/{userId}/[controller]")]
    public class MessagesController : Controller
    {
        private readonly IDatingRepository datingRepo;
        private readonly IMapper mapper;
        public MessagesController(IDatingRepository datingRepo, IMapper mapper)
        {
            this.mapper = mapper;
            this.datingRepo = datingRepo;
        }

        [HttpGet("{id}", Name = "GetMessage")]
        public async Task<IActionResult> GetMessage(int id, int userId)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var message = await datingRepo.GetMessage(id);

            if (message == null)
                return NotFound();

            return Ok(message);
        }

        [HttpGet]
        public async Task<IActionResult> GetMessages(int userId, MessageParams messageParams)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var messages = await datingRepo.GetMessagesForUser(messageParams);

            var messageToReturn = mapper.Map<IEnumerable<MessageToReturnDto>>(messages);

            Response.AddPagination(messages.CurrentPage, messages.PageSize, messages.TotalCount, messages.TotalPages);
         
            return Ok(messageToReturn);
        }

        [HttpGet("thread/{id}")]
        public async Task<IActionResult> GetMessagesThread(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var messages = await datingRepo.GetMessagesThread(userId, id);

            var messagesThread = mapper.Map<IEnumerable<MessageToReturnDto>>(messages);

            return Ok(messagesThread);
        }

        [HttpPost]
        public async Task<IActionResult> CreateMessage(int userId, [FromBody] MessageForCreationDto messageForCreationDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            
            messageForCreationDto.SenderId = userId;

            var recipient = await datingRepo.GetUser(messageForCreationDto.RecipientId);

            if (recipient == null)
                return BadRequest("Could not find user");

            var message = mapper.Map<Message>(messageForCreationDto);

            datingRepo.Add(message);
            
            var messageToReturn = mapper.Map<MessageForCreationDto>(message);
            if (await datingRepo.SaveAll())
                return CreatedAtRoute("GetMessage", new { id = message.Id, userId = userId }, messageToReturn);

            return BadRequest("Creating message failed on save");
        }

        [HttpPost("{id}")]
        public async Task<IActionResult> DeleteMessage(int id, int userId)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var message = await datingRepo.GetMessage(id);

            if (message.SenderId == userId)
                message.SenderDeleted = true;
            if (message.RecipientId == userId)
                message.RecipientDeleted = true;
            if (message.RecipientDeleted && message.SenderDeleted)
                datingRepo.Delete(message);
            
            if (await datingRepo.SaveAll())
                return NoContent();

            throw new Exception("Error deleting the message");
        }

        [HttpPost("{id}/read")]
        public async Task<IActionResult> MarkMessageRead(int id, int userId)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var message = await datingRepo.GetMessage(id);

            if (message.RecipientId != userId)
                BadRequest("failed to mark message as read");
            
            message.IsRead = true;

            message.DateRead = DateTime.Now;

            await datingRepo.SaveAll();

            return NoContent();           
        }

    }
}