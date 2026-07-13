import 'package:flutter/material.dart';

import 'package:flutter_restapi/core/theme/app_colors.dart';

class HomeCategoryChips extends StatelessWidget {
  final ValueChanged<String>? onCategorySelected;

  const HomeCategoryChips({super.key, this.onCategorySelected});

  static const _categories = [
    ('Tất cả', Icons.apps_rounded),
    ('Điện tử', Icons.devices_rounded),
    ('Thời trang', Icons.checkroom_rounded),
    ('Gia dụng', Icons.home_outlined),
    ('Làm đẹp', Icons.spa_outlined),
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: _categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, index) {
          final (label, icon) = _categories[index];
          final isFirst = index == 0;

          return FilterChip(
            selected: isFirst,
            showCheckmark: false,
            elevation: isFirst ? 2 : 0,
            pressElevation: 4,
            shadowColor: AppColors.primary.withValues(alpha: 0.2),
            avatar: Icon(icon, size: 18, color: isFirst ? Colors.white : AppColors.textSecondary),
            label: Text(label),
            labelStyle: TextStyle(
              fontWeight: isFirst ? FontWeight.w700 : FontWeight.w500,
              color: isFirst ? Colors.white : AppColors.textPrimary,
              letterSpacing: -0.2,
            ),
            selectedColor: AppColors.primary,
            backgroundColor: AppColors.card,
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(
                color: isFirst ? Colors.transparent : AppColors.border,
                width: 0.5,
              ),
            ),
            onSelected: (_) => onCategorySelected?.call(label),
          );
        },
      ),
    );
  }
}
