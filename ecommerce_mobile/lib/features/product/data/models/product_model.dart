import '../../domain/entities/product_entity.dart';

class ProductModel {
  final int id;
  final String name;
  final String description;
  final int price;
  final int quantity;
  final String? imageUrl;

  const ProductModel({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.quantity,
    this.imageUrl,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] as int,
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      price: (json['price'] as num?)?.toInt() ?? 0,
      quantity: (json['quantity'] as num?)?.toInt() ?? 0,
      imageUrl: json['imageUrl'] as String?,
    );
  }

  ProductEntity toEntity() => ProductEntity(
        id: id,
        name: name,
        description: description,
        price: price,
        quantity: quantity,
        imageUrl: imageUrl,
      );
}
