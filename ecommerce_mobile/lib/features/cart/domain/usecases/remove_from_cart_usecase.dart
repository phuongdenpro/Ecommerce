import '../../domain/repositories/cart_repository.dart';

class RemoveFromCartUseCase {
  final CartRepository _repository;

  RemoveFromCartUseCase(this._repository);

  Future<void> call(int productId) => _repository.removeFromCart(productId);
}
