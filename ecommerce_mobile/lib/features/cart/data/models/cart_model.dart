import 'package:flutter_restapi/core/network/api_response_parser.dart';

import 'cart_item_model.dart';

class CartModel {
  final String id;
  final List<CartItemModel> items;
  final double subTotal;
  final int totalItems;

  const CartModel({
    required this.id,
    required this.items,
    required this.subTotal,
    required this.totalItems,
  });

  factory CartModel.fromJson(Map<String, dynamic> json) {
    final itemsList = (json['items'] as List<dynamic>?)
            ?.map((item) => CartItemModel.fromJson(item as Map<String, dynamic>))
            .toList() ??
        [];

    return CartModel(
      id: ApiResponseParser.parseId(json['id']),
      items: itemsList,
      subTotal: ApiResponseParser.parseMoney(json['subTotal'] ?? json['totalAmount']),
      totalItems: ApiResponseParser.parseInt(json['totalItems']),
    );
  }
}
