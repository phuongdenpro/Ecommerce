import '../../domain/entities/order_entity.dart';
import '../../domain/repositories/order_repository.dart';

class CreateOrderUseCase {
  final OrderRepository _repository;

  CreateOrderUseCase(this._repository);

  Future<OrderEntity> call({
    required List<({int productId, int quantity})> items,
    required String recipientName,
    required String recipientPhone,
    required String shippingAddress,
    required String paymentMethod,
    String? notes,
  }) =>
      _repository.createOrder(
        items: items,
        recipientName: recipientName,
        recipientPhone: recipientPhone,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        notes: notes,
      );
}
