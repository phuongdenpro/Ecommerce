import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/app/router/route_paths.dart';
import 'package:flutter_restapi/core/theme/app_colors.dart';
import 'package:flutter_restapi/core/utils/formatters.dart';
import 'package:flutter_restapi/features/cart/services/cart_service.dart';
import 'package:flutter_restapi/core/widgets/custom_button.dart';
import 'package:flutter_restapi/core/widgets/empty_state.dart';

class CartPage extends StatefulWidget {
  const CartPage({super.key});

  @override
  State<CartPage> createState() => _CartPageState();
}

class _CartPageState extends State<CartPage> {
  final CartService _cartService = CartService();

  @override
  void initState() {
    super.initState();
    _cartService.itemCountNotifier.addListener(_onCartUpdated);
  }

  @override
  void dispose() {
    _cartService.itemCountNotifier.removeListener(_onCartUpdated);
    super.dispose();
  }

  void _onCartUpdated() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final items = _cartService.items;

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Giỏ hàng', style: Theme.of(context).textTheme.headlineSmall),
                  const SizedBox(height: 4),
                  Text(
                    items.isEmpty ? 'Chưa có sản phẩm' : '${items.length} mặt hàng',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
            Expanded(
              child: items.isEmpty
                  ? EmptyState(
                      icon: Icons.shopping_bag_outlined,
                      title: 'Giỏ hàng trống',
                      subtitle: 'Thêm sản phẩm yêu thích để bắt đầu mua sắm.',
                      actionLabel: 'Mua sắm ngay',
                      onAction: () => context.go(RoutePaths.catalog),
                    )
                  : Column(
                      children: [
                        Expanded(
                          child: ListView.separated(
                            padding: const EdgeInsets.all(16),
                            itemCount: items.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 10),
                            itemBuilder: (context, index) {
                              final item = items[index];
                              return Card(
                                child: Padding(
                                  padding: const EdgeInsets.all(12),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      ClipRRect(
                                        borderRadius: BorderRadius.circular(12),
                                        child: item.product.imageUrl != null &&
                                                item.product.imageUrl!.isNotEmpty
                                            ? Image.network(
                                                item.product.imageUrl!,
                                                width: 72,
                                                height: 72,
                                                fit: BoxFit.cover,
                                                errorBuilder: (_, _, _) => _thumbPlaceholder(),
                                              )
                                            : _thumbPlaceholder(),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              item.product.name,
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                              style: Theme.of(context).textTheme.titleMedium,
                                            ),
                                            const SizedBox(height: 6),
                                            Text(
                                              'SL: ${item.quantity} × ${formatCurrency(item.product.price)}',
                                              style: Theme.of(context).textTheme.bodyMedium,
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              formatCurrency(item.totalPrice),
                                              style: const TextStyle(
                                                fontWeight: FontWeight.w800,
                                                color: AppColors.primary,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.delete_outline_rounded, color: AppColors.error),
                                        onPressed: () => _cartService.removeFromCart(item.product.id),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
                          decoration: const BoxDecoration(
                            color: AppColors.card,
                            border: Border(top: BorderSide(color: AppColors.border)),
                          ),
                          child: Column(
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text('Tổng cộng', style: Theme.of(context).textTheme.bodyMedium),
                                  Text(
                                    formatCurrency(_cartService.totalPrice),
                                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                          fontSize: 22,
                                          color: AppColors.primary,
                                        ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              CustomButton(
                                label: 'Thanh toán',
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Tính năng thanh toán đang phát triển')),
                                  );
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _thumbPlaceholder() {
    return Container(
      width: 72,
      height: 72,
      color: AppColors.border.withValues(alpha: 0.5),
      child: const Icon(Icons.image_outlined, color: AppColors.textSecondary),
    );
  }
}
