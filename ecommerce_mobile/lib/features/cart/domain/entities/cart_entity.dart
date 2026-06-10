import 'cart_item_entity.dart';

class CartEntity {
  final int id;
  final List<CartItemEntity> items;
  final int totalAmount;

  const CartEntity({
    required this.id,
    required this.items,
    required this.totalAmount,
  });

  int get totalItems => items.fold<int>(0, (sum, item) => sum + item.quantity);
}
