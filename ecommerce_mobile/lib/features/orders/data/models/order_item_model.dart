import 'package:flutter_restapi/core/network/api_response_parser.dart';

class OrderItemModel {
  final String productId;
  final String productName;
  final double unitPrice;
  final int quantity;
  final String? imageUrl;
  final double subTotal;

  const OrderItemModel({
    required this.productId,
    required this.productName,
    required this.unitPrice,
    required this.quantity,
    this.imageUrl,
    required this.subTotal,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    final unitPrice =
        ApiResponseParser.parseMoney(json['unitPrice'] ?? json['price']);
    final quantity = ApiResponseParser.parseInt(json['quantity']);
    final subTotal = json['subTotal'] != null
        ? ApiResponseParser.parseMoney(json['subTotal'])
        : unitPrice * quantity;

    return OrderItemModel(
      productId: ApiResponseParser.parseId(json['productId']),
      productName: json['productName']?.toString() ?? '',
      unitPrice: unitPrice,
      quantity: quantity,
      imageUrl:
          json['productImageUrl'] as String? ?? json['imageUrl'] as String?,
      subTotal: subTotal,
    );
  }
}
