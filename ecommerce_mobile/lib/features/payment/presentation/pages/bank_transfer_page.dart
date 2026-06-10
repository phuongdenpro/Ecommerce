import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/app/router/route_paths.dart';
import 'package:flutter_restapi/core/constants/payment_constants.dart';
import 'package:flutter_restapi/core/theme/app_colors.dart';
import 'package:flutter_restapi/core/utils/formatters.dart';
import 'package:flutter_restapi/core/widgets/custom_button.dart';
import 'package:flutter_restapi/features/checkout/checkout_args.dart';

class BankTransferPage extends StatelessWidget {
  final BankTransferArgs args;

  const BankTransferPage({super.key, required this.args});

  String get transferContent => args.orderCode;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('Chuyển khoản ngân hàng'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
              ),
              child: Column(
                children: [
                  const Icon(Icons.info_outline, color: AppColors.primary, size: 32),
                  const SizedBox(height: 12),
                  Text(
                    'Vui lòng chuyển khoản theo thông tin bên dưới. Đơn hàng sẽ được xử lý sau khi chúng tôi nhận được thanh toán.',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            _InfoCard(
              title: 'Thông tin chuyển khoản',
              children: [
                _InfoRow(label: 'Ngân hàng', value: PaymentConstants.bankName),
                _InfoRow(label: 'Số tài khoản', value: PaymentConstants.bankAccountNumber, copyable: true),
                _InfoRow(label: 'Chủ tài khoản', value: PaymentConstants.bankAccountName),
                _InfoRow(label: 'Số tiền', value: formatCurrency(args.amount), highlight: true),
                _InfoRow(label: 'Nội dung CK', value: transferContent, copyable: true),
              ],
            ),
            if (PaymentConstants.bankQrImageUrl != null) ...[
              const SizedBox(height: 20),
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(
                  PaymentConstants.bankQrImageUrl!,
                  height: 200,
                  fit: BoxFit.contain,
                  errorBuilder: (_, _, _) => const SizedBox.shrink(),
                ),
              ),
            ],
            const SizedBox(height: 32),
            CustomButton(
              label: 'Đã chuyển khoản — Xem đơn hàng',
              onPressed: () => context.go(
                RoutePaths.orderSuccess,
                extra: OrderSuccessArgs(
                  orderId: args.orderId,
                  orderCode: args.orderCode,
                ),
              ),
            ),
            const SizedBox(height: 12),
            CustomButton(
              label: 'Xem chi tiết đơn hàng',
              outlined: true,
              onPressed: () => context.go(RoutePaths.orderDetail(args.orderId)),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _InfoCard({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final bool copyable;
  final bool highlight;

  const _InfoRow({
    required this.label,
    required this.value,
    this.copyable = false,
    this.highlight = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                color: highlight ? AppColors.primary : AppColors.textSecondary,
                fontWeight: highlight ? FontWeight.w700 : FontWeight.normal,
                fontSize: highlight ? 16 : 14,
              ),
            ),
          ),
          if (copyable)
            IconButton(
              icon: const Icon(Icons.copy, size: 18),
              onPressed: () async {
                await Clipboard.setData(ClipboardData(text: value));
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Đã sao chép')),
                );
              },
            ),
        ],
      ),
    );
  }
}
