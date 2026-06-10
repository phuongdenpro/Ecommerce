import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/app/router/route_paths.dart';
import 'package:flutter_restapi/core/theme/app_colors.dart';
import 'package:flutter_restapi/core/widgets/custom_button.dart';
import 'package:flutter_restapi/features/checkout/checkout_args.dart';

class OrderSuccessPage extends StatelessWidget {
  final OrderSuccessArgs? args;

  const OrderSuccessPage({super.key, this.args});

  @override
  Widget build(BuildContext context) {
    final orderCode = args?.orderCode;

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 40),
            Container(
              width: 100,
              height: 100,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.success,
              ),
              child: const Icon(
                Icons.check_rounded,
                size: 60,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Đặt hàng thành công!',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            if (orderCode != null) ...[
              const SizedBox(height: 8),
              Text(
                'Mã đơn: $orderCode',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ],
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                'Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đã được tiếp nhận và sẽ được xử lý ngay.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: AppColors.textSecondary,
                      height: 1.6,
                    ),
              ),
            ),
            const SizedBox(height: 40),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                children: [
                  if (args?.orderId != null)
                    CustomButton(
                      label: 'Xem chi tiết đơn hàng',
                      onPressed: () => context.go(RoutePaths.orderDetail(args!.orderId)),
                    ),
                  if (args?.orderId != null) const SizedBox(height: 12),
                  CustomButton(
                    label: 'Xem đơn hàng của tôi',
                    onPressed: () => context.go(RoutePaths.orders),
                  ),
                  const SizedBox(height: 12),
                  CustomButton(
                    label: 'Tiếp tục mua sắm',
                    onPressed: () => context.go(RoutePaths.catalog),
                    outlined: true,
                  ),
                ],
              ),
            ),
            const Spacer(),
          ],
        ),
      ),
    );
  }
}
