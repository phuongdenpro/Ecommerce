import 'package:flutter/material.dart';

import 'package:flutter_restapi/core/theme/app_colors.dart';
import 'package:flutter_restapi/core/utils/formatters.dart';
import 'package:flutter_restapi/features/product/domain/entities/product_entity.dart';

class ProductCard extends StatelessWidget {
  final ProductEntity product;
  final VoidCallback onTap;

  const ProductCard({
    super.key,
    required this.product,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final inStock = product.quantity > 0;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Ink(
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Stack(
                  children: [
                    ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
                      child: _ProductImage(imageUrl: product.imageUrl),
                    ),
                    if (!inStock)
                      Positioned(
                        top: 8,
                        left: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.error.withValues(alpha: 0.9),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            'Hết hàng',
                            style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      product.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 12),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Text(
                          formatCurrency(product.price),
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            color: AppColors.primary,
                            fontSize: 15,
                          ),
                        ),
                        const Spacer(),
                        Icon(
                          Icons.inventory_2_outlined,
                          size: 14,
                          color: inStock ? AppColors.success : AppColors.textSecondary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${product.quantity}',
                          style: TextStyle(
                            fontSize: 12,
                            color: inStock ? AppColors.textSecondary : AppColors.error,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
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

class _ProductImage extends StatelessWidget {
  final String? imageUrl;

  const _ProductImage({this.imageUrl});

  @override
  Widget build(BuildContext context) {
    if (imageUrl != null && imageUrl!.isNotEmpty) {
      return Image.network(
        imageUrl!,
        fit: BoxFit.cover,
        width: double.infinity,
        height: double.infinity,
        errorBuilder: (_, __, ___) => const _PlaceholderImage(),
      );
    }
    return const _PlaceholderImage();
  }
}

class _PlaceholderImage extends StatelessWidget {
  const _PlaceholderImage();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      color: AppColors.border.withValues(alpha: 0.5),
      child: const Center(
        child: Icon(Icons.image_outlined, size: 40, color: AppColors.textSecondary),
      ),
    );
  }
}
