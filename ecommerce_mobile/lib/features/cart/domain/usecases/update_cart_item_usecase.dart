import '../../domain/repositories/cart_repository.dart';

class UpdateCartItemUseCase {
  final CartRepository _repository;

  UpdateCartItemUseCase(this._repository);

  Future<void> call({
    required int productId,
    required int quantity,
  }) =>
      _repository.updateCartItem(productId: productId, quantity: quantity);
}
