import '../entities/cart_entity.dart';

abstract class CartRepository {
  Future<CartEntity> getCart();

  Future<CartEntity> addToCart({
    required String productId,
    required int quantity,
  });

  Future<CartEntity> updateCartItem({
    required String itemId,
    required int quantity,
  });

  Future<CartEntity> removeFromCart(String itemId);

  Future<void> clearCart();
}
