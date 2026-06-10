import '../../domain/repositories/order_repository.dart';

class CancelOrderUseCase {
  final OrderRepository _repository;

  CancelOrderUseCase(this._repository);

  Future<void> call(String orderId) => _repository.cancelOrder(orderId);
}
