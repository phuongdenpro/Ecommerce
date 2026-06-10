import '../../domain/entities/cart_entity.dart';
import '../../domain/entities/cart_item_entity.dart';
import '../../domain/repositories/cart_repository.dart';
import '../datasources/cart_remote_datasource.dart';

class CartRepositoryImpl implements CartRepository {
  final CartRemoteDataSource _remote;

  CartRepositoryImpl(this._remote);

  @override
  Future<CartEntity> getCart() async {
    final model = await _remote.getCart();
    return CartEntity(
      id: model.id,
      items: model.items
          .map((item) => CartItemEntity(
                productId: item.productId,
                productName: item.productName,
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.imageUrl,
              ))
          .toList(),
      totalAmount: model.totalAmount,
    );
  }

  @override
  Future<void> addToCart({
    required int productId,
    required int quantity,
  }) =>
      _remote.addToCart(productId: productId, quantity: quantity);

  @override
  Future<void> updateCartItem({
    required int productId,
    required int quantity,
  }) =>
      _remote.updateCartItem(productId: productId, quantity: quantity);

  @override
  Future<void> removeFromCart(int productId) => _remote.removeFromCart(productId);

  @override
  Future<void> clearCart() => _remote.clearCart();
}
