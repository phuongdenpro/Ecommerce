using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;

namespace ECommerce.Infrastructure.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
        Users = new GenericRepository<User>(context);
        RefreshTokens = new GenericRepository<RefreshToken>(context);
        Categories = new GenericRepository<Category>(context);
        Brands = new GenericRepository<Brand>(context);
        Products = new GenericRepository<Product>(context);
        ProductImages = new GenericRepository<ProductImage>(context);
        Carts = new GenericRepository<Cart>(context);
        CartItems = new GenericRepository<CartItem>(context);
        Orders = new GenericRepository<Order>(context);
        OrderItems = new GenericRepository<OrderItem>(context);
        Payments = new GenericRepository<Payment>(context);
        Reviews = new GenericRepository<Review>(context);
        Wishlists = new GenericRepository<Wishlist>(context);
        Addresses = new GenericRepository<Address>(context);
        Coupons = new GenericRepository<Coupon>(context);
        CouponUsages = new GenericRepository<CouponUsage>(context);
    }

    public IGenericRepository<User> Users { get; }
    public IGenericRepository<RefreshToken> RefreshTokens { get; }
    public IGenericRepository<Category> Categories { get; }
    public IGenericRepository<Brand> Brands { get; }
    public IGenericRepository<Product> Products { get; }
    public IGenericRepository<ProductImage> ProductImages { get; }
    public IGenericRepository<Cart> Carts { get; }
    public IGenericRepository<CartItem> CartItems { get; }
    public IGenericRepository<Order> Orders { get; }
    public IGenericRepository<OrderItem> OrderItems { get; }
    public IGenericRepository<Payment> Payments { get; }
    public IGenericRepository<Review> Reviews { get; }
    public IGenericRepository<Wishlist> Wishlists { get; }
    public IGenericRepository<Address> Addresses { get; }
    public IGenericRepository<Coupon> Coupons { get; }
    public IGenericRepository<CouponUsage> CouponUsages { get; }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _context.SaveChangesAsync(cancellationToken);

    public void Dispose() => _context.Dispose();
}
