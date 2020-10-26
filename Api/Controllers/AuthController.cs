using System;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using DatingApp.Api.Controllers.Dtos;
using DatingApp.Api.Data;
using DatingApp.Api.Models;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.IdentityModel.Tokens;
using Microsoft.IdentityModel.Tokens;
using AutoMapper;

namespace DatingApp.Api.Controllers
{
    [Route("api/[controller]")]
    public class AuthController : Controller
    {
        private readonly IAuthRepository authRepository;
        private readonly IMapper mapper;
        public AuthController(IAuthRepository authRepository, IMapper mapper)
        {
            this.mapper = mapper;
            this.authRepository = authRepository;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserForRegisterDto userForRegisterDto)
        {
            if (!string.IsNullOrEmpty(userForRegisterDto.UserName))
                userForRegisterDto.UserName = userForRegisterDto.UserName.ToLower();


            if (await authRepository.UserExists(userForRegisterDto.UserName))
                ModelState.AddModelError("username", "username already exists");

            // validate request
            if (!ModelState.IsValid)
                return BadRequest(ModelState);


            var userToCreate = mapper.Map<User>(userForRegisterDto);

            var createdUser = await authRepository.Register(userToCreate, userForRegisterDto.Password);

            var userToReturn = mapper.Map<UserForDetailsDto>(createdUser);
            
            return CreatedAtRoute("GetUser", new {Controller = "Users", id = createdUser.Id}, userToReturn);
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserForLoginDto userForLoginDto)
        {
            var userFromRepository = await authRepository.Login(userForLoginDto.UserName.ToLower(), userForLoginDto.Password);

            if (userFromRepository == null)
                return Unauthorized();

            // generate the JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("super secret key");
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, userFromRepository.Id.ToString()),
                    new Claim(ClaimTypes.Name, userFromRepository.UserName)
                }),
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha512Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            var user = mapper.Map<UsersForListDto>(userFromRepository);
            return Ok(new { tokenString, user });
        }
    }
}