import 'cart_item_model.dart';

class CartModel {
  final int id;
  final List<CartItemModel> items;
  final int totalAmount;

  const CartModel({
    required this.id,
    required this.items,
    required this.totalAmount,
  });

  factory CartModel.fromJson(Map<String, dynamic> json) {
    final itemsList = (json['items'] as List<dynamic>?)
            ?.map((item) => CartItemModel.fromJson(item as Map<String, dynamic>))
            .toList() ??
        [];

    return CartModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      items: itemsList,
      totalAmount: (json['totalAmount'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'items': items.map((item) => item.toJson()).toList(),
        'totalAmount': totalAmount,
      };

  int get totalItems => items.fold<int>(0, (sum, item) => sum + item.quantity);
}
