import '../../domain/entities/cart_entity.dart';
import '../../domain/repositories/cart_repository.dart';

class RemoveFromCartUseCase {
  final CartRepository _repository;

  RemoveFromCartUseCase(this._repository);

  Future<CartEntity> call(String itemId) => _repository.removeFromCart(itemId);
}
