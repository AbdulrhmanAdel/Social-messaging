using System.Linq;
using System.Xml;
using System;
using AutoMapper;
using DatingApp.Api.Controllers.Dtos;
using DatingApp.Api.Models;
using Api.Models;
using Api.Controllers.Dtos;

namespace DatingApp.Api.Helpers
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<User, UserForDetailsDto>()
                .ForMember(dto => dto.PhotoUrl, opt => {
                    opt.MapFrom(src => src.Photos.FirstOrDefault(p => p.IsMain == true).Url);
                })
                .ForMember(dto => dto.Age, opt => {
                    opt.MapFrom(src => src.DateOfBirth.CalculateAge());
                });

            CreateMap<User, UsersForListDto>()
                .ForMember(dto => dto.PhotoUrl, opt => {
                    opt.MapFrom(src => src.Photos.FirstOrDefault(p => p.IsMain == true).Url);
                })
                .ForMember(dto => dto.Age, opt => {
                    opt.MapFrom(src => src.DateOfBirth.CalculateAge());
                });;

            CreateMap<Photo, PhotoForDetailsDto>();
            CreateMap<PhotoForCreationDto, Photo>();
            CreateMap<Photo, PhotoForReturnDto>();
            CreateMap<UserForUpdateDto, User>();
            CreateMap<UserForRegisterDto, User>();
            CreateMap<MessageForCreationDto, Message>().ReverseMap();
            CreateMap<Message, MessageToReturnDto>()
                .ForMember(m => m.SenderPhotoUrl, opt => opt.MapFrom(m => m.Sender.Photos.FirstOrDefault(p => p.IsMain == true).Url))
                .ForMember(m => m.RecipientPhotoUrl, opt => opt.MapFrom(m => m.Recipient.Photos.FirstOrDefault(p => p.IsMain == true).Url));
        }
    }
}