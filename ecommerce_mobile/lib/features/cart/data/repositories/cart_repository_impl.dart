import '../../domain/entities/cart_entity.dart';
import '../../domain/entities/cart_item_entity.dart';
import '../../domain/repositories/cart_repository.dart';
import '../datasources/cart_remote_datasource.dart';
import '../models/cart_model.dart';

class CartRepositoryImpl implements CartRepository {
  final CartRemoteDataSource _remote;

  CartRepositoryImpl(this._remote);

  CartEntity _mapCart(CartModel model) => CartEntity(
        id: model.id,
        items: model.items
            .map((item) => CartItemEntity(
                  id: item.id,
                  productId: item.productId,
                  productName: item.productName,
                  unitPrice: item.unitPrice,
                  quantity: item.quantity,
                  stockQuantity: item.stockQuantity,
                  isInStock: item.isInStock,
                  imageUrl: item.imageUrl,
                ))
            .toList(),
        subTotal: model.subTotal,
        totalItems: model.totalItems,
      );

  @override
  Future<CartEntity> getCart() async {
    final model = await _remote.getCart();
    return _mapCart(model);
  }

  @override
  Future<CartEntity> addToCart({
    required String productId,
    required int quantity,
  }) async {
    final model = await _remote.addToCart(productId: productId, quantity: quantity);
    return _mapCart(model);
  }

  @override
  Future<CartEntity> updateCartItem({
    required String itemId,
    required int quantity,
  }) async {
    final model = await _remote.updateCartItem(itemId: itemId, quantity: quantity);
    return _mapCart(model);
  }

  @override
  Future<CartEntity> removeFromCart(String itemId) async {
    final model = await _remote.removeFromCart(itemId);
    return _mapCart(model);
  }

  @override
  Future<void> clearCart() async {
    final cart = await getCart();
    for (final item in cart.items) {
      await _remote.removeFromCart(item.id);
    }
  }
}
