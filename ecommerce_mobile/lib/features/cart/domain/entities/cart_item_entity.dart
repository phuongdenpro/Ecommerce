class CartItemEntity {
  final int productId;
  final String productName;
  final int price;
  final int quantity;
  final String? imageUrl;

  const CartItemEntity({
    required this.productId,
    required this.productName,
    required this.price,
    required this.quantity,
    this.imageUrl,
  });

  int get totalPrice => price * quantity;
}
