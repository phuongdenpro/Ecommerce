import 'package:flutter_restapi/core/network/api_response_parser.dart';

class CartItemModel {
  final String id;
  final String productId;
  final String productName;
  final double unitPrice;
  final int quantity;
  final int stockQuantity;
  final bool isInStock;
  final String? imageUrl;

  const CartItemModel({
    required this.id,
    required this.productId,
    required this.productName,
    required this.unitPrice,
    required this.quantity,
    required this.stockQuantity,
    required this.isInStock,
    this.imageUrl,
  });

  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    return CartItemModel(
      id: ApiResponseParser.parseId(json['id']),
      productId: ApiResponseParser.parseId(json['productId']),
      productName: json['productName']?.toString() ?? '',
      unitPrice: ApiResponseParser.parseMoney(json['unitPrice'] ?? json['price']),
      quantity: ApiResponseParser.parseInt(json['quantity']),
      stockQuantity: ApiResponseParser.parseInt(json['stockQuantity']),
      isInStock: json['isInStock'] as bool? ?? true,
      imageUrl: json['productImageUrl'] as String? ?? json['imageUrl'] as String?,
    );
  }
}
