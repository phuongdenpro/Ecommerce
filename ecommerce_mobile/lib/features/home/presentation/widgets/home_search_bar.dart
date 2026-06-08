import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/app/router/route_paths.dart';
import 'package:flutter_restapi/core/theme/app_colors.dart';

class HomeSearchBar extends StatelessWidget {
  const HomeSearchBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.card,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: () => context.go(RoutePaths.catalog),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              Icon(Icons.search_rounded, color: AppColors.textSecondary.withValues(alpha: 0.8)),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Tìm sản phẩm, thương hiệu...',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.tune_rounded, size: 20, color: AppColors.primary),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
