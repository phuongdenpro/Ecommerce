import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/app/router/route_paths.dart';
import 'package:flutter_restapi/core/theme/app_colors.dart';

class HomeQuickActions extends StatelessWidget {
  final bool isAdmin;
  final int cartCount;

  const HomeQuickActions({
    super.key,
    required this.isAdmin,
    required this.cartCount,
  });

  @override
  Widget build(BuildContext context) {
    final actions = <_QuickAction>[
      _QuickAction('Danh mục', Icons.grid_view_rounded, AppColors.primary, RoutePaths.catalog),
      _QuickAction('Giỏ hàng', Icons.shopping_bag_outlined, const Color(0xFF8B5CF6), RoutePaths.cart, badge: cartCount),
      _QuickAction('Đơn hàng', Icons.receipt_long_outlined, const Color(0xFF059669), RoutePaths.orders),
      if (isAdmin)
        _QuickAction('Quản lý', Icons.admin_panel_settings_outlined, const Color(0xFFD97706), RoutePaths.manage),
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: actions.map((action) {
          return Expanded(
            child: Padding(
              padding: EdgeInsets.only(right: action == actions.last ? 0 : 10),
              child: _QuickActionTile(action: action),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _QuickActionTile extends StatelessWidget {
  final _QuickAction action;

  const _QuickActionTile({required this.action});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.card,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: () {
          if (action.path == RoutePaths.manage) {
            context.push(action.path);
          } else {
            context.go(action.path);
          }
        },
        borderRadius: BorderRadius.circular(16),
        child: Ink(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: action.color.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(action.icon, color: action.color, size: 24),
                  ),
                  if (action.badge != null && action.badge! > 0)
                    Positioned(
                      right: -4,
                      top: -4,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                        decoration: const BoxDecoration(color: AppColors.error, shape: BoxShape.circle),
                        child: Text(
                          '${action.badge}',
                          style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w700),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                action.label,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickAction {
  final String label;
  final IconData icon;
  final Color color;
  final String path;
  final int? badge;

  const _QuickAction(this.label, this.icon, this.color, this.path, {this.badge});
}
