class CartItemEntity {
  final String id;
  final String productId;
  final String productName;
  final double unitPrice;
  final int quantity;
  final int stockQuantity;
  final bool isInStock;
  final String? imageUrl;

  const CartItemEntity({
    required this.id,
    required this.productId,
    required this.productName,
    required this.unitPrice,
    required this.quantity,
    required this.stockQuantity,
    required this.isInStock,
    this.imageUrl,
  });

  double get subTotal => unitPrice * quantity;

  double get totalPrice => subTotal;
}
