import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/app/router/route_paths.dart';
import 'package:flutter_restapi/core/theme/app_colors.dart';
import 'package:flutter_restapi/core/utils/formatters.dart';
import 'package:flutter_restapi/features/cart/services/cart_service.dart';
import 'package:flutter_restapi/features/product/presentation/providers/product_providers.dart';
import 'package:flutter_restapi/core/widgets/custom_button.dart';
import 'package:flutter_restapi/core/widgets/error_widget.dart';
import 'package:flutter_restapi/core/widgets/loading_widget.dart';

class ProductDetailPage extends ConsumerStatefulWidget {
  final int productId;

  const ProductDetailPage({super.key, required this.productId});

  @override
  ConsumerState<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends ConsumerState<ProductDetailPage> {
  int _selectedQuantity = 1;

  void _goBack(BuildContext context) {
    if (context.canPop()) {
      context.pop();
    } else {
      context.go(RoutePaths.home);
    }
  }

  @override
  Widget build(BuildContext context) {
    final productAsync = ref.watch(productDetailProvider(widget.productId));

    return productAsync.when(
      loading: () => Scaffold(
        appBar: AppBar(
          title: const Text('Chi tiết sản phẩm'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new, size: 20),
            onPressed: () => _goBack(context),
          ),
        ),
        body: const LoadingWidget(message: 'Đang tải chi tiết...'),
      ),
      error: (error, _) => Scaffold(
        appBar: AppBar(
          title: const Text('Chi tiết sản phẩm'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new, size: 20),
            onPressed: () => _goBack(context),
          ),
        ),
        body: AppErrorWidget(
          message: error.toString(),
          onRetry: () => ref.invalidate(productDetailProvider(widget.productId)),
        ),
      ),
      data: (product) {
        final inStock = product.quantity > 0;

        return Scaffold(
          appBar: AppBar(
            title: const Text('Chi tiết'),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new, size: 20),
              onPressed: () => _goBack(context),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.ios_share_rounded),
                onPressed: () async {
                  final text =
                      '${product.name}\nGiá: ${formatCurrency(product.price)}\n${product.imageUrl ?? ''}';
                  await Clipboard.setData(ClipboardData(text: text));
                  if (!context.mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Đã sao chép thông tin sản phẩm')),
                  );
                },
              ),
              IconButton(
                icon: const Icon(Icons.shopping_bag_outlined),
                onPressed: () => context.go(RoutePaths.cart),
              ),
            ],
          ),
          body: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: product.imageUrl != null && product.imageUrl!.isNotEmpty
                            ? Image.network(product.imageUrl!, height: 280, fit: BoxFit.cover)
                            : Container(
                                height: 280,
                                color: AppColors.border.withValues(alpha: 0.5),
                                child: const Center(
                                  child: Icon(Icons.image_outlined, size: 64, color: AppColors.textSecondary),
                                ),
                              ),
                      ),
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          if (!inStock)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.error.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text(
                                'Hết hàng',
                                style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w600, fontSize: 12),
                              ),
                            )
                          else
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.success.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'Còn ${product.quantity} sản phẩm',
                                style: const TextStyle(
                                  color: AppColors.success,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(product.name, style: Theme.of(context).textTheme.headlineSmall),
                      const SizedBox(height: 8),
                      Text(
                        formatCurrency(product.price),
                        style: const TextStyle(
                          fontSize: 26,
                          color: AppColors.primary,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 20),
                      Text('Mô tả', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      Text(
                        product.description,
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(height: 1.6),
                      ),
                      const SizedBox(height: 24),
                      Text('Số lượng', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 12),
                      _QuantitySelector(
                        quantity: _selectedQuantity,
                        max: product.quantity,
                        onChanged: (q) => setState(() => _selectedQuantity = q),
                      ),
                    ],
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
                decoration: BoxDecoration(
                  color: AppColors.card,
                  border: const Border(top: BorderSide(color: AppColors.border)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 12,
                      offset: const Offset(0, -4),
                    ),
                  ],
                ),
                child: SafeArea(
                  top: false,
                  child: CustomButton(
                    label: inStock ? 'Thêm vào giỏ hàng' : 'Sản phẩm đã hết',
                    enabled: inStock,
                    onPressed: () {
                      CartService().addToCart(product, _selectedQuantity);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Đã thêm $_selectedQuantity sản phẩm vào giỏ')),
                      );
                    },
                    color: inStock ? AppColors.primary : AppColors.textSecondary,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _QuantitySelector extends StatelessWidget {
  final int quantity;
  final int max;
  final ValueChanged<int> onChanged;

  const _QuantitySelector({required this.quantity, required this.max, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.remove_rounded),
            onPressed: quantity > 1 ? () => onChanged(quantity - 1) : null,
          ),
          SizedBox(
            width: 40,
            child: Text(
              '$quantity',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontSize: 18),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.add_rounded),
            onPressed: quantity < max ? () => onChanged(quantity + 1) : null,
          ),
        ],
      ),
    );
  }
}
