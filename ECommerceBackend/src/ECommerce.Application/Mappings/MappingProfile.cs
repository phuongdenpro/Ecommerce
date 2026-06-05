using AutoMapper;
using ECommerce.Application.DTOs.Addresses;
using ECommerce.Application.DTOs.Brands;
using ECommerce.Application.DTOs.Categories;
using ECommerce.Application.DTOs.Coupons;
using ECommerce.Application.DTOs.Products;
using ECommerce.Application.DTOs.Reviews;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Brand, BrandDto>().ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));
        CreateMap<Category, CategoryDto>().ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()));
        CreateMap<ProductImage, ProductImageDto>();
        CreateMap<Address, AddressDto>();
        CreateMap<Coupon, CouponDto>()
            .ForMember(d => d.DiscountType, o => o.MapFrom(s => s.DiscountType.ToString()));
        CreateMap<Review, ReviewDto>();
    }
}
