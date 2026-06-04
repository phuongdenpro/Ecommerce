using ECommerce.Domain.Entities;

namespace ECommerce.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IGenericRepository<User> Users { get; }
    IGenericRepository<RefreshToken> RefreshTokens { get; }
    IGenericRepository<Category> Categories { get; }
    IGenericRepository<Brand> Brands { get; }
    IGenericRepository<Product> Products { get; }
    IGenericRepository<ProductImage> ProductImages { get; }
    IGenericRepository<Cart> Carts { get; }
    IGenericRepository<CartItem> CartItems { get; }
    IGenericRepository<Order> Orders { get; }
    IGenericRepository<OrderItem> OrderItems { get; }
    IGenericRepository<Payment> Payments { get; }
    IGenericRepository<Review> Reviews { get; }
    IGenericRepository<Wishlist> Wishlists { get; }
    IGenericRepository<Address> Addresses { get; }
    IGenericRepository<Coupon> Coupons { get; }
    IGenericRepository<CouponUsage> CouponUsages { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
