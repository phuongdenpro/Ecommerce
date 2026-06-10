import '../../domain/entities/cart_entity.dart';
import '../../domain/repositories/cart_repository.dart';

class AddToCartUseCase {
  final CartRepository _repository;

  AddToCartUseCase(this._repository);

  Future<CartEntity> call({
    required String productId,
    required int quantity,
  }) =>
      _repository.addToCart(productId: productId, quantity: quantity);
}
