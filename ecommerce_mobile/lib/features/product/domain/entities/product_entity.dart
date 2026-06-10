class ProductEntity {
  final String id;
  final String name;
  final String description;
  final double price;
  final double? discountPrice;
  final int stockQuantity;
  final String? imageUrl;

  const ProductEntity({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.discountPrice,
    required this.stockQuantity,
    this.imageUrl,
  });

  double get displayPrice => discountPrice ?? price;

  bool get hasDiscount =>
      discountPrice != null && discountPrice! > 0 && discountPrice! < price;

  bool get inStock => stockQuantity > 0;
}
