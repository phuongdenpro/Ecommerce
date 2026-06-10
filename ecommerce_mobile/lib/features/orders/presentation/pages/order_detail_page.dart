import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/core/theme/app_colors.dart';
import 'package:flutter_restapi/core/utils/formatters.dart';
import 'package:flutter_restapi/features/orders/presentation/providers/order_providers.dart';
import 'package:flutter_restapi/core/widgets/custom_button.dart';
import 'package:flutter_restapi/core/widgets/error_widget.dart';
import 'package:flutter_restapi/core/widgets/loading_widget.dart';

class OrderDetailPage extends ConsumerStatefulWidget {
  final int orderId;

  const OrderDetailPage({super.key, required this.orderId});

  @override
  ConsumerState<OrderDetailPage> createState() => _OrderDetailPageState();
}

class _OrderDetailPageState extends ConsumerState<OrderDetailPage> {
  bool _isLoadingCancel = false;

  Future<void> _cancelOrder() async {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hủy đơn hàng?'),
        content: const Text('Bạn có chắc muốn hủy đơn hàng này? Hành động này không thể hoàn tác.'),
        actions: [
          TextButton(
            onPressed: () => context.pop(),
            child: const Text('Không'),
          ),
          TextButton(
            onPressed: () async {
              context.pop();
              setState(() => _isLoadingCancel = true);
              try {
                await ref.read(cancelOrderUseCaseProvider).call(widget.orderId);
                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Đơn hàng đã được hủy'),
                    backgroundColor: AppColors.success,
                  ),
                );
                context.pop();
              } catch (e) {
                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Lỗi: ${e.toString()}'),
                    backgroundColor: AppColors.error,
                  ),
                );
              } finally {
                if (mounted) setState(() => _isLoadingCancel = false);
              }
            },
            child: const Text('Hủy', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final orderAsync = ref.watch(orderDetailProvider(widget.orderId));

    return orderAsync.when(
      loading: () => Scaffold(
        appBar: AppBar(
          title: const Text('Chi tiết đơn hàng'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new, size: 20),
            onPressed: () => context.pop(),
          ),
        ),
        body: const LoadingWidget(message: 'Đang tải chi tiết...'),
      ),
      error: (error, _) => Scaffold(
        appBar: AppBar(
          title: const Text('Chi tiết đơn hàng'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new, size: 20),
            onPressed: () => context.pop(),
          ),
        ),
        body: AppErrorWidget(
          message: error.toString(),
          onRetry: () => ref.invalidate(orderDetailProvider(widget.orderId)),
        ),
      ),
      data: (order) => Scaffold(
        backgroundColor: AppColors.surface,
        appBar: AppBar(
          title: const Text('Chi tiết đơn hàng'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new, size: 20),
            onPressed: () => context.pop(),
          ),
        ),
        body: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                margin: const EdgeInsets.all(20),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.card,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(order.orderCode, style: Theme.of(context).textTheme.titleMedium),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: _getStatusColor(order.status).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            order.statusLabel,
                            style: TextStyle(
                              color: _getStatusColor(order.status),
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _buildInfoRow('Ngày đặt hàng:', '${order.createdAt.day}/${order.createdAt.month}/${order.createdAt.year}'),
                    const SizedBox(height: 8),
                    _buildInfoRow('Phương thức thanh toán:', order.paymentMethod ?? 'Không rõ'),
                    const SizedBox(height: 8),
                    if (order.paymentStatus != null)
                      _buildInfoRow('Trạng thái thanh toán:', order.paymentStatus!),
                  ],
                ),
              ),
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.card,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Sản phẩm', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 12),
                    ...order.items.map<Widget>((item) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(item.productName, maxLines: 2, overflow: TextOverflow.ellipsis),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${formatCurrency(item.price)} × ${item.quantity}',
                                    style: Theme.of(context).textTheme.bodySmall,
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            Text(formatCurrency(item.price * item.quantity)),
                          ],
                        ),
                      );
                    }).toList(),
                    const Divider(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Tổng cộng', style: Theme.of(context).textTheme.titleMedium),
                        Text(
                          formatCurrency(order.totalAmount),
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.card,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Thông tin giao hàng', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 12),
                    _buildInfoRow('Người nhận:', order.recipientName),
                    const SizedBox(height: 8),
                    _buildInfoRow('Số điện thoại:', order.recipientPhone),
                    const SizedBox(height: 8),
                    _buildInfoRow('Địa chỉ:', order.shippingAddress),
                    if (order.notes != null && order.notes!.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      _buildInfoRow('Ghi chú:', order.notes!),
                    ],
                  ],
                ),
              ),
              if (order.status.name == 'pending') ...[
                const SizedBox(height: 24),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: CustomButton(
                    label: _isLoadingCancel ? 'Đang hủy...' : 'Hủy đơn hàng',
                    enabled: !_isLoadingCancel,
                    onPressed: _cancelOrder,
                    color: AppColors.error,
                  ),
                ),
              ],
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 120,
          child: Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
        ),
        Expanded(
          child: Text(value, style: const TextStyle(color: AppColors.textSecondary)),
        ),
      ],
    );
  }

  Color _getStatusColor(status) {
    switch (status.name) {
      case 'completed':
        return AppColors.success;
      case 'cancelled':
        return AppColors.error;
      case 'shipping':
        return AppColors.accent;
      default:
        return AppColors.primary;
    }
  }
}
