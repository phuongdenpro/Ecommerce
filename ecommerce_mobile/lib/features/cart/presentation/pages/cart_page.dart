import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/app/router/route_paths.dart';
import 'package:flutter_restapi/core/theme/app_colors.dart';
import 'package:flutter_restapi/core/utils/formatters.dart';
import 'package:flutter_restapi/core/widgets/custom_button.dart';
import 'package:flutter_restapi/core/widgets/empty_state.dart';
import 'package:flutter_restapi/core/widgets/error_widget.dart';
import 'package:flutter_restapi/core/widgets/loading_widget.dart';
import 'package:flutter_restapi/features/cart/domain/entities/cart_item_entity.dart';
import 'package:flutter_restapi/features/cart/presentation/providers/cart_providers.dart';

class CartPage extends ConsumerWidget {
  const CartPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartAsync = ref.watch(cartProvider);

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: cartAsync.when(
          loading: () => const LoadingWidget(message: 'Đang tải giỏ hàng...'),
          error: (error, _) => AppErrorWidget(
            message: error.toString(),
            onRetry: () => ref.invalidate(cartProvider),
          ),
          data: (cart) => Column(
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
                      cart.items.isEmpty
                          ? 'Chưa có sản phẩm'
                          : '${cart.totalItems} sản phẩm',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
              Expanded(
                child: cart.items.isEmpty
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
                            child: RefreshIndicator(
                              onRefresh: () async {
                                ref.invalidate(cartProvider);
                                await ref.read(cartProvider.future);
                              },
                              child: ListView.separated(
                                physics: const AlwaysScrollableScrollPhysics(),
                                padding: const EdgeInsets.all(16),
                                itemCount: cart.items.length,
                                separatorBuilder: (_, __) => const SizedBox(height: 10),
                                itemBuilder: (context, index) {
                                  final item = cart.items[index];
                                  return _CartItemCard(item: item, ref: ref);
                                },
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                            decoration: const BoxDecoration(
                              color: AppColors.card,
                              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                              boxShadow: [
                                BoxShadow(
                                  color: Color(0x0F000000), // 6% opacity black
                                  blurRadius: 24,
                                  offset: Offset(0, -8),
                                ),
                              ],
                            ),
                            child: SafeArea(
                              top: false,
                              child: Column(
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text('Tổng cộng', style: Theme.of(context).textTheme.bodyMedium),
                                      Text(
                                        formatCurrency(cart.subTotal),
                                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                              fontSize: 22,
                                              color: AppColors.primary,
                                              fontWeight: FontWeight.bold,
                                            ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  CustomButton(
                                    label: 'Tiến hành thanh toán',
                                    onPressed: () => context.push(RoutePaths.checkout),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CartItemCard extends StatelessWidget {
  final CartItemEntity item;
  final WidgetRef ref;

  const _CartItemCard({required this.item, required this.ref});

  Future<void> _updateQuantity(int newQuantity) async {
    try {
      if (newQuantity <= 0) {
        await ref.read(cartControllerProvider.notifier).removeFromCart(item.id);
      } else if (newQuantity <= item.stockQuantity) {
        await ref.read(cartControllerProvider.notifier).updateCartItem(item.id, newQuantity);
      }
    } catch (e) {
      // Error shown via snackbar in parent if needed
    }
  }

  @override
  Widget build(BuildContext context) {
    final canIncrease = item.quantity < item.stockQuantity && item.isInStock;

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppColors.border, width: 0.5),
      ),
      child: Container(
        decoration: BoxDecoration(
          gradient: AppColors.cardGradient,
          borderRadius: BorderRadius.circular(16),
          boxShadow: const [AppColors.softShadow],
        ),
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: item.imageUrl != null && item.imageUrl!.isNotEmpty
                  ? Image.network(
                      item.imageUrl!,
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
                    item.productName,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    formatCurrency(item.unitPrice),
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  if (!item.isInStock)
                    const Padding(
                      padding: EdgeInsets.only(top: 4),
                      child: Text(
                        'Không đủ tồn kho',
                        style: TextStyle(color: AppColors.error, fontSize: 12),
                      ),
                    ),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 28,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        InkWell(
                          onTap: item.quantity > 1
                              ? () => _updateQuantity(item.quantity - 1)
                              : null,
                          child: Container(
                            width: 28,
                            decoration: BoxDecoration(
                              border: Border.all(color: AppColors.border),
                              borderRadius: const BorderRadius.only(
                                topLeft: Radius.circular(6),
                                bottomLeft: Radius.circular(6),
                              ),
                            ),
                            child: const Center(child: Icon(Icons.remove, size: 16)),
                          ),
                        ),
                        Container(
                          width: 40,
                          decoration: BoxDecoration(border: Border.all(color: AppColors.border)),
                          child: Center(
                            child: Text(
                              '${item.quantity}',
                              style: const TextStyle(fontWeight: FontWeight.w600),
                            ),
                          ),
                        ),
                        InkWell(
                          onTap: canIncrease
                              ? () => _updateQuantity(item.quantity + 1)
                              : null,
                          child: Container(
                            width: 28,
                            decoration: BoxDecoration(
                              border: Border.all(color: AppColors.border),
                              borderRadius: const BorderRadius.only(
                                topRight: Radius.circular(6),
                                bottomRight: Radius.circular(6),
                              ),
                            ),
                            child: const Center(child: Icon(Icons.add, size: 16)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  formatCurrency(item.subTotal),
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    color: AppColors.primary,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 12),
                IconButton(
                  icon: const Icon(Icons.delete_outline_rounded, color: AppColors.error),
                  onPressed: () => ref.read(cartControllerProvider.notifier).removeFromCart(item.id),
                  iconSize: 20,
                  constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                ),
              ],
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
