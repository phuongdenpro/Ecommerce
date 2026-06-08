import 'package:flutter/material.dart';

import 'package:flutter_restapi/core/theme/app_colors.dart';
import 'custom_button.dart';

class AppErrorWidget extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;

  const AppErrorWidget({super.key, required this.message, this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppColors.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(Icons.cloud_off_outlined, size: 36, color: AppColors.error),
            ),
            const SizedBox(height: 16),
            Text(
              'Đã xảy ra lỗi',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontSize: 18),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 24),
              SizedBox(
                width: 160,
                child: CustomButton(label: 'Thử lại', onPressed: onRetry!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
