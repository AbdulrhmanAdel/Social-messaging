using System.Net;
using System.Security.Claims;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.Api.Controllers.Dtos;
using DatingApp.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System;
using Api.Helpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Api.Models;
using System.IO;
using System.Linq;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DatingApp.Api.Helpers;
using DatingApp.Api.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;

namespace DatingApp.Api.Controllers
{
    [ServiceFilter(typeof(LogUserActivity))]
    [Authorize]
    [Route("api/[controller]")]
    public class UsersController : Controller
    {
        private readonly IDatingRepository datingRepository;
        private readonly IMapper mapper;
        public UsersController(IDatingRepository datingRepository, IMapper mapper)
        {
            this.mapper = mapper;
            this.datingRepository = datingRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers(UserParams userParams)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var userForRepo = await datingRepository.GetUser(currentUserId);
            userParams.UserId = currentUserId;
            if (string.IsNullOrEmpty(userParams.Gender))
            {
                userParams.Gender = userForRepo.Gender == "male" ? "female" : "male";
            }
            var users = await datingRepository.GetUsers(userParams);

            var usersToReturn = mapper.Map<IEnumerable<UsersForListDto>>(users);
            
            Response.AddPagination(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages);

            return Ok(usersToReturn);
        }

        // api/users/1
        [HttpGet("{id}", Name = "GetUser")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await datingRepository.GetUser(id);

            var userToReturn = mapper.Map<UserForDetailsDto>(user);
            return Ok(userToReturn);
        }

        // api/users/1
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody]UserForUpdateDto userForUpdateDto)
        {
            if(!ModelState.IsValid)
                return BadRequest(ModelState);
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var userForRepo = await datingRepository.GetUser(id);

            if(userForRepo == null)
                return NotFound($"Could not find the user with an ID of {id}");
            
            if(userForRepo.Id != currentUserId)
                return Unauthorized();
                
            mapper.Map(userForUpdateDto, userForRepo);
            if(await datingRepository.SaveAll())
                return NoContent();
            
            throw new Exception($"Updating user {id} failed on save");
        }


        [HttpPost("{id}/like/{recipientId}")]
        public async Task<IActionResult> LikeUser(int id, int recipientId)
        {
            if (id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var like = await datingRepository.GetLike(id, recipientId);
            if (like != null)
                return BadRequest("You already like this user");
            
            if (await datingRepository.GetUser(recipientId) == null)
                return NotFound();
            
            like = new Like
            {
                LikerId = id,
                LikeeId = recipientId
            };

            datingRepository.Add(like);
            
            if (await datingRepository.SaveAll())
                return Ok();

            return BadRequest("Failed to add user");
        }

    }
}