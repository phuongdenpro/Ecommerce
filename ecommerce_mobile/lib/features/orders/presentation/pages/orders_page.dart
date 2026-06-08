import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/app/router/route_paths.dart';
import 'package:flutter_restapi/core/theme/app_colors.dart';
import 'package:flutter_restapi/core/utils/formatters.dart';
import 'package:flutter_restapi/features/orders/data/repositories/order_repository.dart';
import 'package:flutter_restapi/features/orders/domain/entities/order_entity.dart';
import 'package:flutter_restapi/core/widgets/empty_state.dart';
import 'package:flutter_restapi/core/widgets/loading_widget.dart';

class OrdersPage extends StatefulWidget {
  const OrdersPage({super.key});

  @override
  State<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends State<OrdersPage> {
  final _repository = OrderRepository();
  late Future<List<OrderEntity>> _futureOrders;

  @override
  void initState() {
    super.initState();
    _futureOrders = _repository.getOrders();
  }

  Future<void> _refresh() async {
    setState(() {
      _futureOrders = _repository.getOrders();
    });
    await _futureOrders;
  }

  Color _statusColor(OrderStatus status) => switch (status) {
        OrderStatus.delivered => AppColors.success,
        OrderStatus.cancelled => AppColors.error,
        OrderStatus.shipped => AppColors.accent,
        _ => AppColors.primary,
      };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Đơn hàng', style: Theme.of(context).textTheme.headlineSmall),
                        const SizedBox(height: 4),
                        Text('Theo dõi trạng thái giao hàng', style: Theme.of(context).textTheme.bodyMedium),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => context.go(RoutePaths.catalog),
                    icon: const Icon(Icons.add_shopping_cart_outlined),
                    style: IconButton.styleFrom(
                      backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: RefreshIndicator(
                onRefresh: _refresh,
                child: FutureBuilder<List<OrderEntity>>(
                  future: _futureOrders,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState != ConnectionState.done) {
                      return const LoadingWidget(message: 'Đang tải đơn hàng...');
                    }

                    final orders = snapshot.data ?? [];
                    if (orders.isEmpty) {
                      return const EmptyState(
                        icon: Icons.receipt_long_outlined,
                        title: 'Chưa có đơn hàng',
                        subtitle: 'Đơn hàng của bạn sẽ hiển thị tại đây.',
                      );
                    }

                    return ListView.separated(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(16),
                      itemCount: orders.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final order = orders[index];
                        final statusColor = _statusColor(order.status);

                        return Card(
                          child: InkWell(
                            borderRadius: BorderRadius.circular(16),
                            onTap: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Chi tiết ${order.id} — sắp ra mắt')),
                              );
                            },
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        order.id,
                                        style: Theme.of(context).textTheme.titleMedium,
                                      ),
                                      const Spacer(),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: statusColor.withValues(alpha: 0.1),
                                          borderRadius: BorderRadius.circular(20),
                                        ),
                                        child: Text(
                                          order.statusLabel,
                                          style: TextStyle(
                                            color: statusColor,
                                            fontSize: 12,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Text(order.productName, style: Theme.of(context).textTheme.bodyLarge),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Text('SL: ${order.quantity}', style: Theme.of(context).textTheme.bodyMedium),
                                      const Spacer(),
                                      Text(
                                        formatCurrency(order.totalAmount),
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w800,
                                          color: AppColors.primary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
