import '../../domain/entities/order_entity.dart';
import '../../domain/repositories/order_repository.dart';

class GetOrdersUseCase {
  final OrderRepository _repository;

  GetOrdersUseCase(this._repository);

  Future<List<OrderEntity>> call({
    required int page,
    required int pageSize,
  }) =>
      _repository.getOrders(page: page, pageSize: pageSize);
}
