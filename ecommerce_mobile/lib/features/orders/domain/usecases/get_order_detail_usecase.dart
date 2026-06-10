import '../../domain/entities/order_entity.dart';
import '../../domain/repositories/order_repository.dart';

class GetOrderDetailUseCase {
  final OrderRepository _repository;

  GetOrderDetailUseCase(this._repository);

  Future<OrderEntity> call(int id) => _repository.getOrderById(id);
}
