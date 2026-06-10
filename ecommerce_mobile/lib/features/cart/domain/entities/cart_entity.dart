import 'cart_item_entity.dart';

class CartEntity {
  final String id;
  final List<CartItemEntity> items;
  final double subTotal;
  final int totalItems;

  const CartEntity({
    required this.id,
    required this.items,
    required this.subTotal,
    required this.totalItems,
  });

  double get totalAmount => subTotal;
}
