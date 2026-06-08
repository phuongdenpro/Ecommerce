import 'package:flutter/foundation.dart';

import '../models/cart_item.dart';
import 'package:flutter_restapi/features/product/domain/entities/product_entity.dart';

class CartService {
  CartService._internal();

  static final CartService _instance = CartService._internal();

  factory CartService() => _instance;

  final Map<int, CartItem> _items = {};
  final ValueNotifier<int> itemCountNotifier = ValueNotifier<int>(0);

  List<CartItem> get items => _items.values.toList();

  double get totalPrice => _items.values.fold(0, (sum, item) => sum + item.totalPrice);

  void addToCart(ProductEntity product, int quantity) {
    if (quantity <= 0) return;
    final available = product.quantity;
    final addedQuantity = quantity.clamp(1, available);
    final existing = _items[product.id];
    if (existing != null) {
      existing.quantity = (existing.quantity + addedQuantity).clamp(1, available);
    } else {
      _items[product.id] = CartItem(product: product, quantity: addedQuantity);
    }
    itemCountNotifier.value = _items.values.fold(0, (sum, item) => sum + item.quantity);
  }

  void removeFromCart(int productId) {
    _items.remove(productId);
    itemCountNotifier.value = _items.values.fold(0, (sum, item) => sum + item.quantity);
  }

  void clearCart() {
    _items.clear();
    itemCountNotifier.value = 0;
  }
}
