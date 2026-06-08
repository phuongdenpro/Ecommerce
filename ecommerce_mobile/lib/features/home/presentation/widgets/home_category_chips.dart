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
            avatar: Icon(icon, size: 18, color: isFirst ? AppColors.primary : AppColors.textSecondary),
            label: Text(label),
            labelStyle: TextStyle(
              fontWeight: isFirst ? FontWeight.w600 : FontWeight.w500,
              color: isFirst ? AppColors.primary : AppColors.textPrimary,
            ),
            selectedColor: AppColors.primary.withValues(alpha: 0.1),
            backgroundColor: AppColors.card,
            side: BorderSide(color: isFirst ? AppColors.primary.withValues(alpha: 0.3) : AppColors.border),
            onSelected: (_) => onCategorySelected?.call(label),
          );
        },
      ),
    );
  }
}
