class ProductEntity {
  final int id;
  final String name;
  final String description;
  final int price;
  final int quantity;
  final String? imageUrl;

  const ProductEntity({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.quantity,
    this.imageUrl,
  });
}
