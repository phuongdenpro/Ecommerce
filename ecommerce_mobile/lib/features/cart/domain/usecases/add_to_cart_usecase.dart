import '../../domain/repositories/cart_repository.dart';

class AddToCartUseCase {
  final CartRepository _repository;

  AddToCartUseCase(this._repository);

  Future<void> call({
    required int productId,
    required int quantity,
  }) =>
      _repository.addToCart(productId: productId, quantity: quantity);
}
