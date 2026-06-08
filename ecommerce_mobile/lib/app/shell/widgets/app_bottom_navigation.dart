import 'package:flutter/material.dart';

import 'package:flutter_restapi/core/theme/app_colors.dart';

class AppBottomNavigation extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final int cartBadge;

  const AppBottomNavigation({
    super.key,
    required this.currentIndex,
    required this.onTap,
    this.cartBadge = 0,
  });

  static const _items = [
    _NavItem(Icons.home_rounded, Icons.home_outlined, 'Trang chủ'),
    _NavItem(Icons.grid_view_rounded, Icons.grid_view_outlined, 'Danh mục'),
    _NavItem(Icons.shopping_bag_rounded, Icons.shopping_bag_outlined, 'Giỏ hàng'),
    _NavItem(Icons.receipt_long_rounded, Icons.receipt_long_outlined, 'Đơn hàng'),
    _NavItem(Icons.person_rounded, Icons.person_outline, 'Tài khoản'),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        border: const Border(top: BorderSide(color: AppColors.border)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            children: List.generate(_items.length, (index) {
              final item = _items[index];
              final selected = index == currentIndex;
              final showBadge = index == 2 && cartBadge > 0;

              return Expanded(
                child: InkWell(
                  onTap: () => onTap(index),
                  borderRadius: BorderRadius.circular(14),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: selected ? AppColors.primary.withValues(alpha: 0.08) : Colors.transparent,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Stack(
                          clipBehavior: Clip.none,
                          children: [
                            Icon(
                              selected ? item.activeIcon : item.icon,
                              size: 24,
                              color: selected ? AppColors.primary : AppColors.textSecondary,
                            ),
                            if (showBadge)
                              Positioned(
                                right: -8,
                                top: -4,
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                                  decoration: const BoxDecoration(
                                    color: AppColors.error,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Text(
                                    cartBadge > 99 ? '99+' : '$cartBadge',
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 9,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item.label,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                            color: selected ? AppColors.primary : AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData activeIcon;
  final IconData icon;
  final String label;

  const _NavItem(this.activeIcon, this.icon, this.label);
}
