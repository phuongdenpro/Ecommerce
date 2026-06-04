using ECommerce.Application.Interfaces;
using ECommerce.Domain.Common;
using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Wishlist> Wishlists => Set<Wishlist>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<CouponUsage> CouponUsages => Set<CouponUsage>();
    public DbSet<StoreSettings> StoreSettings => Set<StoreSettings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Email).HasMaxLength(256);
            e.Property(x => x.FullName).HasMaxLength(100);
            e.Property(x => x.AdminNotes).HasMaxLength(2000);
        });

        modelBuilder.Entity<StoreSettings>(e =>
        {
            e.Property(x => x.StoreName).HasMaxLength(200);
            e.Property(x => x.DefaultShippingFee).HasPrecision(18, 2);
            e.Property(x => x.FreeShippingThreshold).HasPrecision(18, 2);
        });

        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.HasIndex(x => x.Token).IsUnique();
            e.HasOne(x => x.User).WithMany(u => u.RefreshTokens).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Category>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.HasQueryFilter(x => !x.IsDeleted);
            e.HasOne(x => x.Parent).WithMany(x => x.Children).HasForeignKey(x => x.ParentId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Brand>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
        });

        modelBuilder.Entity<Product>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.HasIndex(x => x.SKU).IsUnique();
            e.HasQueryFilter(x => !x.IsDeleted);
            e.Property(x => x.Price).HasPrecision(18, 2);
            e.Property(x => x.DiscountPrice).HasPrecision(18, 2);
            e.HasOne(x => x.Category).WithMany(c => c.Products).HasForeignKey(x => x.CategoryId);
            e.HasOne(x => x.Brand).WithMany(b => b.Products).HasForeignKey(x => x.BrandId);
        });

        modelBuilder.Entity<ProductImage>(e =>
        {
            e.HasOne(x => x.Product).WithMany(p => p.Images).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Cart>(e =>
        {
            e.HasIndex(x => x.UserId).IsUnique();
            e.HasOne(x => x.User).WithOne(u => u.Cart).HasForeignKey<Cart>(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CartItem>(e =>
        {
            e.HasIndex(x => new { x.CartId, x.ProductId }).IsUnique();
            e.HasOne(x => x.Cart).WithMany(c => c.Items).HasForeignKey(x => x.CartId);
            e.HasOne(x => x.Product).WithMany(p => p.CartItems).HasForeignKey(x => x.ProductId);
        });

        modelBuilder.Entity<Order>(e =>
        {
            e.HasIndex(x => x.OrderCode).IsUnique();
            e.Property(x => x.TotalAmount).HasPrecision(18, 2);
            e.Property(x => x.ShippingFee).HasPrecision(18, 2);
            e.Property(x => x.DiscountAmount).HasPrecision(18, 2);
            e.Property(x => x.FinalAmount).HasPrecision(18, 2);
            e.HasOne(x => x.User).WithMany(u => u.Orders).HasForeignKey(x => x.UserId);
            e.HasOne(x => x.Coupon).WithMany(c => c.Orders).HasForeignKey(x => x.CouponId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<OrderItem>(e =>
        {
            e.Property(x => x.UnitPrice).HasPrecision(18, 2);
            e.Property(x => x.SubTotal).HasPrecision(18, 2);
            e.HasOne(x => x.Order).WithMany(o => o.Items).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Product).WithMany(p => p.OrderItems).HasForeignKey(x => x.ProductId);
        });

        modelBuilder.Entity<Payment>(e =>
        {
            e.HasIndex(x => x.OrderId).IsUnique();
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.HasOne(x => x.Order).WithOne(o => o.Payment).HasForeignKey<Payment>(x => x.OrderId);
        });

        modelBuilder.Entity<Review>(e =>
        {
            e.HasIndex(x => new { x.UserId, x.ProductId, x.OrderId }).IsUnique();
            e.HasOne(x => x.User).WithMany(u => u.Reviews).HasForeignKey(x => x.UserId);
            e.HasOne(x => x.Product).WithMany(p => p.Reviews).HasForeignKey(x => x.ProductId);
            e.HasOne(x => x.Order).WithMany().HasForeignKey(x => x.OrderId);
        });

        modelBuilder.Entity<Wishlist>(e =>
        {
            e.HasIndex(x => new { x.UserId, x.ProductId }).IsUnique();
            e.HasOne(x => x.User).WithMany(u => u.Wishlists).HasForeignKey(x => x.UserId);
            e.HasOne(x => x.Product).WithMany(p => p.Wishlists).HasForeignKey(x => x.ProductId);
        });

        modelBuilder.Entity<Address>(e =>
        {
            e.HasOne(x => x.User).WithMany(u => u.Addresses).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Coupon>(e =>
        {
            e.HasIndex(x => x.Code).IsUnique();
            e.Property(x => x.DiscountValue).HasPrecision(18, 2);
            e.Property(x => x.MinOrderAmount).HasPrecision(18, 2);
            e.Property(x => x.MaxDiscountAmount).HasPrecision(18, 2);
        });

        modelBuilder.Entity<CouponUsage>(e =>
        {
            e.Property(x => x.DiscountApplied).HasPrecision(18, 2);
            e.HasOne(x => x.Coupon).WithMany(c => c.Usages).HasForeignKey(x => x.CouponId);
            e.HasOne(x => x.User).WithMany(u => u.CouponUsages).HasForeignKey(x => x.UserId);
            e.HasOne(x => x.Order).WithMany().HasForeignKey(x => x.OrderId);
        });

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .Property(nameof(BaseEntity.CreatedAt))
                    .HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
            }
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
