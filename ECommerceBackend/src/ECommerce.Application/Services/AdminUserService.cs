using ECommerce.Application.DTOs.Admin;
using ECommerce.Application.DTOs.Wishlist;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Exceptions;
using ECommerce.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Services;

public class AdminUserService : IAdminUserService
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IWishlistService _wishlistService;
    private readonly IReviewService _reviewService;

    public AdminUserService(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IWishlistService wishlistService,
        IReviewService reviewService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _wishlistService = wishlistService;
        _reviewService = reviewService;
    }

    public async Task<PagedResult<AdminUserListDto>> GetUsersAsync(AdminUserQueryDto query, CancellationToken cancellationToken = default)
    {
        var q = _context.Users.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Role) && Enum.TryParse<UserRole>(query.Role, true, out var role))
            q = q.Where(u => u.Role == role);

        if (query.IsActive.HasValue)
            q = q.Where(u => u.IsActive == query.IsActive.Value);

        if (query.CreatedFrom.HasValue)
            q = q.Where(u => u.CreatedAt >= query.CreatedFrom.Value);

        if (query.CreatedTo.HasValue)
            q = q.Where(u => u.CreatedAt <= query.CreatedTo.Value);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var s = query.Search.Trim();
            q = q.Where(u =>
                u.FullName.Contains(s) ||
                u.Email.Contains(s) ||
                (u.PhoneNumber != null && u.PhoneNumber.Contains(s)));
        }

        q = query.SortDescending ? q.OrderByDescending(u => u.CreatedAt) : q.OrderBy(u => u.CreatedAt);
        var total = await q.CountAsync(cancellationToken);
        var users = await q.Skip((query.PageNumber - 1) * query.PageSize).Take(query.PageSize).ToListAsync(cancellationToken);

        var items = new List<AdminUserListDto>();
        foreach (var u in users)
        {
            var orders = _context.Orders.AsNoTracking().Where(o => o.UserId == u.Id);
            items.Add(new AdminUserListDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                AvatarUrl = u.AvatarUrl,
                Role = u.Role.ToString(),
                IsActive = u.IsActive,
                TotalOrders = await orders.CountAsync(cancellationToken),
                TotalSpent = await orders
                    .Where(o => o.PaymentStatus == PaymentStatus.Paid && o.Status != OrderStatus.Cancelled)
                    .SumAsync(o => o.FinalAmount, cancellationToken),
                CreatedAt = u.CreatedAt
            });
        }

        return PagedResult<AdminUserListDto>.Create(items, query.PageNumber, query.PageSize, total);
    }

    public async Task<AdminUserDetailDto> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.AsNoTracking()
            .Include(u => u.Addresses)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken)
            ?? throw new NotFoundException("User not found.");

        var orders = _context.Orders.AsNoTracking().Where(o => o.UserId == id);

        return new AdminUserDetailDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            AvatarUrl = user.AvatarUrl,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            TotalOrders = await orders.CountAsync(cancellationToken),
            TotalSpent = await orders
                .Where(o => o.PaymentStatus == PaymentStatus.Paid && o.Status != OrderStatus.Cancelled)
                .SumAsync(o => o.FinalAmount, cancellationToken),
            AdminNotes = user.AdminNotes,
            Addresses = user.Addresses.Select(a => new AddressBriefDto
            {
                Id = a.Id,
                FullName = a.FullName,
                PhoneNumber = a.PhoneNumber,
                AddressLine = a.AddressLine,
                City = a.City,
                IsDefault = a.IsDefault
            }).ToList()
        };
    }

    public async Task SetUserActiveAsync(Guid id, bool isActive, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync([id], cancellationToken)
            ?? throw new NotFoundException("User not found.");
        user.IsActive = isActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task SetUserRoleAsync(Guid id, string role, CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<UserRole>(role, true, out var parsed))
            throw new BadRequestException("Invalid role.");

        var user = await _context.Users.FindAsync([id], cancellationToken)
            ?? throw new NotFoundException("User not found.");
        user.Role = parsed;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<AdminUserDetailDto> CreateUserAsync(CreateAdminUserRequestDto request, CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
            throw new BadRequestException("Invalid role.");

        var email = request.Email.Trim().ToLowerInvariant();
        if (await _context.Users.AnyAsync(u => u.Email == email, cancellationToken))
            throw new ConflictException("Email is already registered.");

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PhoneNumber = request.PhoneNumber?.Trim(),
            PasswordHash = _passwordHasher.Hash(request.Password),
            Role = role,
            IsActive = true
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        if (role == UserRole.Customer)
        {
            _context.Carts.Add(new Cart { UserId = user.Id });
            await _context.SaveChangesAsync(cancellationToken);
        }

        return await GetUserByIdAsync(user.Id, cancellationToken);
    }

    public async Task<AdminUserDetailDto> UpdateUserAsync(Guid id, UpdateAdminUserRequestDto request, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync([id], cancellationToken)
            ?? throw new NotFoundException("User not found.");

        user.FullName = request.FullName.Trim();
        user.PhoneNumber = request.PhoneNumber?.Trim();
        user.AvatarUrl = request.AvatarUrl?.Trim();
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return await GetUserByIdAsync(id, cancellationToken);
    }

    public async Task<UserAdminNotesDto> GetUserNotesAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.AsNoTracking()
            .Where(u => u.Id == id)
            .Select(u => new { u.Id, u.AdminNotes })
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("User not found.");

        return new UserAdminNotesDto { UserId = user.Id, AdminNotes = user.AdminNotes };
    }

    public async Task<UserAdminNotesDto> SetUserNotesAsync(Guid id, UpdateUserAdminNotesRequestDto request, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync([id], cancellationToken)
            ?? throw new NotFoundException("User not found.");

        user.AdminNotes = request.AdminNotes?.Trim();
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return new UserAdminNotesDto { UserId = user.Id, AdminNotes = user.AdminNotes };
    }

    public Task<IReadOnlyList<WishlistItemDto>> GetUserWishlistAsync(Guid id, CancellationToken cancellationToken = default) =>
        _wishlistService.GetWishlistAsync(id, cancellationToken);

    public Task<PagedResult<AdminReviewListDto>> GetUserReviewsAsync(Guid id, PaginationQuery query, CancellationToken cancellationToken = default) =>
        _reviewService.GetByUserIdForAdminAsync(id, query, cancellationToken);
}
