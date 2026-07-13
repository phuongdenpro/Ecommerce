import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/core/theme/app_colors.dart';
import 'package:flutter_restapi/core/utils/formatters.dart';
import 'package:flutter_restapi/app/router/route_paths.dart';
import 'package:flutter_restapi/features/orders/domain/entities/order_entity.dart';
import 'package:flutter_restapi/features/orders/presentation/providers/order_providers.dart';
import 'package:flutter_restapi/features/payment/presentation/providers/payment_providers.dart';
import 'package:flutter_restapi/core/widgets/custom_button.dart';
import 'package:flutter_restapi/core/widgets/error_widget.dart';
import 'package:flutter_restapi/core/widgets/loading_widget.dart';

class OrderDetailPage extends ConsumerStatefulWidget {
  final String orderId;

  const OrderDetailPage({super.key, required this.orderId});

  @override
  ConsumerState<OrderDetailPage> createState() => _OrderDetailPageState();
}

class _OrderDetailPageState extends ConsumerState<OrderDetailPage> {
  bool _isLoadingCancel = false;

  Future<void> _cancelOrder() async {
    final pageContext = context;

    showDialog(
      context: pageContext,
      builder: (context) => AlertDialog(
        title: const Text('Hủy đơn hàng?'),
        content: const Text('Bạn có chắc muốn hủy đơn hàng này? Hành động này không thể hoàn tác.'),
        actions: [
          TextButton(onPressed: () => context.pop(), child: const Text('Không')),
          TextButton(
            onPressed: () async {
              context.pop();
              setState(() => _isLoadingCancel = true);
              try {
                await ref.read(cancelOrderUseCaseProvider).call(widget.orderId);
                if (!mounted) return;
                ScaffoldMessenger.of(pageContext).showSnackBar(
                  const SnackBar(
                    content: Text('Đơn hàng đã được hủy'),
                    backgroundColor: AppColors.success,
                  ),
                );
                ref.invalidate(orderDetailProvider(widget.orderId));
                ref.invalidate(orderListProvider);
                if (pageContext.canPop()) {
                  pageContext.pop();
                }
              } catch (e) {
                if (!mounted) return;
                ScaffoldMessenger.of(pageContext).showSnackBar(
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

  Color _getStatusColor(OrderStatus status) {
    switch (status) {
      case OrderStatus.delivered:
        return AppColors.success;
      case OrderStatus.cancelled:
        return AppColors.error;
      case OrderStatus.shipping:
        return AppColors.accent;
      default:
        return AppColors.primary;
    }
  }

  void _handleBackPressed() {
    if (Navigator.of(context).canPop()) {
      context.pop();
      return;
    }

    context.go(RoutePaths.orders);
  }

  @override
  Widget build(BuildContext context) {
    final orderAsync = ref.watch(orderDetailProvider(widget.orderId));
    final paymentAsync = ref.watch(paymentByOrderProvider(widget.orderId));

    return orderAsync.when(
      loading: () => Scaffold(
        appBar: AppBar(
          title: const Text('Chi tiết đơn hàng'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new, size: 20),
            onPressed: _handleBackPressed,
          ),
        ),
        body: const LoadingWidget(message: 'Đang tải chi tiết...'),
      ),
      error: (error, _) => Scaffold(
        appBar: AppBar(
          title: const Text('Chi tiết đơn hàng'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new, size: 20),
            onPressed: _handleBackPressed,
          ),
        ),
        body: AppErrorWidget(
          message: error.toString(),
          onRetry: () => ref.invalidate(orderDetailProvider(widget.orderId)),
        ),
      ),
      data: (order) {
        final paymentMethod = paymentAsync.valueOrNull?.method ?? order.paymentMethod;
        final paymentStatus = paymentAsync.valueOrNull?.status ?? order.paymentStatus;

        return Scaffold(
          backgroundColor: AppColors.surface,
            appBar: AppBar(
            title: const Text('Chi tiết đơn hàng'),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new, size: 20),
              onPressed: _handleBackPressed,
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
                    gradient: AppColors.cardGradient,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border, width: 0.5),
                    boxShadow: const [AppColors.softShadow],
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
                      _buildInfoRow(
                        'Ngày đặt hàng:',
                        '${order.createdAt.day}/${order.createdAt.month}/${order.createdAt.year}',
                      ),
                      const SizedBox(height: 8),
                      if (paymentMethod != null)
                        _buildInfoRow('Phương thức thanh toán:', _formatPaymentMethod(paymentMethod)),
                      if (paymentStatus != null) ...[
                        const SizedBox(height: 8),
                        _buildInfoRow('Trạng thái thanh toán:', _formatPaymentStatus(paymentStatus)),
                      ],
                    ],
                  ),
                ),
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 20),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: AppColors.cardGradient,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border, width: 0.5),
                    boxShadow: const [AppColors.softShadow],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Sản phẩm', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 12),
                      ...order.items.map((item) {
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
                                      '${formatCurrency(item.unitPrice)} × ${item.quantity}',
                                      style: Theme.of(context).textTheme.bodySmall,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Text(formatCurrency(item.subTotal)),
                            ],
                          ),
                        );
                      }),
                      const Divider(height: 16),
                      if (order.shippingFee > 0)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Phí vận chuyển', style: Theme.of(context).textTheme.bodyMedium),
                            Text(formatCurrency(order.shippingFee)),
                          ],
                        ),
                      if (order.discountAmount > 0) ...[
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Giảm giá', style: Theme.of(context).textTheme.bodyMedium),
                            Text('-${formatCurrency(order.discountAmount)}'),
                          ],
                        ),
                      ],
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Tổng cộng', style: Theme.of(context).textTheme.titleMedium),
                          Text(
                            formatCurrency(order.finalAmount),
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
                    gradient: AppColors.cardGradient,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border, width: 0.5),
                    boxShadow: const [AppColors.softShadow],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Thông tin giao hàng', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 12),
                      _buildInfoRow('Địa chỉ:', order.shippingAddress),
                      if (order.note != null && order.note!.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        _buildInfoRow('Ghi chú:', order.note!),
                      ],
                    ],
                  ),
                ),
                if (order.canCancel) ...[
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
        );
      },
    );
  }

  String _formatPaymentMethod(String method) {
    return switch (method.toLowerCase()) {
      'cod' => 'Thanh toán khi nhận hàng (COD)',
      'banktransfer' => 'Chuyển khoản ngân hàng',
      'onlinepayment' => 'Thanh toán online',
      _ => method,
    };
  }

  String _formatPaymentStatus(String status) {
    return switch (status.toLowerCase()) {
      'paid' => 'Đã thanh toán',
      'pending' => 'Chờ thanh toán',
      'failed' => 'Thanh toán thất bại',
      'refunded' => 'Đã hoàn tiền',
      _ => status,
    };
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 140,
          child: Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
        ),
        Expanded(
          child: Text(value, style: const TextStyle(color: AppColors.textSecondary)),
        ),
      ],
    );
  }
}
