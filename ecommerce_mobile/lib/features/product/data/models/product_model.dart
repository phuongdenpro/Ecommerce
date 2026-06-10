import 'package:flutter_restapi/core/network/api_response_parser.dart';

import '../../domain/entities/product_entity.dart';

class ProductModel {
  final String id;
  final String name;
  final String description;
  final double price;
  final double? discountPrice;
  final int stockQuantity;
  final String? imageUrl;

  const ProductModel({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.discountPrice,
    required this.stockQuantity,
    this.imageUrl,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    String? imageUrl = json['primaryImageUrl'] as String?;
    if (imageUrl == null && json['images'] is List) {
      final images = json['images'] as List;
      if (images.isNotEmpty) {
        final primary = images.cast<Map<String, dynamic>>().where(
              (img) => img['isPrimary'] == true,
            );
        imageUrl = primary.isNotEmpty
            ? primary.first['imageUrl'] as String?
            : images.first['imageUrl'] as String?;
      }
    }
  imageUrl ??= json['imageUrl'] as String?;

    return ProductModel(
      id: ApiResponseParser.parseId(json['id']),
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      price: ApiResponseParser.parseMoney(json['price']),
      discountPrice: json['discountPrice'] != null
          ? ApiResponseParser.parseMoney(json['discountPrice'])
          : null,
      stockQuantity: ApiResponseParser.parseInt(json['stockQuantity'] ?? json['quantity']),
      imageUrl: imageUrl,
    );
  }

  ProductEntity toEntity() => ProductEntity(
        id: id,
        name: name,
        description: description,
        price: price,
        discountPrice: discountPrice,
        stockQuantity: stockQuantity,
        imageUrl: imageUrl,
      );
}
