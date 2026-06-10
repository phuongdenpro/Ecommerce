import '../../domain/entities/cart_entity.dart';
import '../../domain/repositories/cart_repository.dart';

class UpdateCartItemUseCase {
  final CartRepository _repository;

  UpdateCartItemUseCase(this._repository);

  Future<CartEntity> call({
    required String itemId,
    required int quantity,
  }) =>
      _repository.updateCartItem(itemId: itemId, quantity: quantity);
}
