import '../../domain/entities/cart_entity.dart';
import '../../domain/repositories/cart_repository.dart';

class GetCartUseCase {
  final CartRepository _repository;

  GetCartUseCase(this._repository);

  Future<CartEntity> call() => _repository.getCart();
}
