import '../entities/cart_entity.dart';

abstract class CartRepository {
  Future<CartEntity> getCart();

  Future<void> addToCart({
    required int productId,
    required int quantity,
  });

  Future<void> updateCartItem({
    required int productId,
    required int quantity,
  });

  Future<void> removeFromCart(int productId);

  Future<void> clearCart();
}
