import '../../domain/entities/order_entity.dart';
import '../../domain/repositories/order_repository.dart';

class CreateOrderUseCase {
  final OrderRepository _repository;

  CreateOrderUseCase(this._repository);

  Future<OrderEntity> call({
    required String shippingAddress,
    String? note,
    double shippingFee = 0,
    String? couponCode,
  }) =>
      _repository.createOrder(
        shippingAddress: shippingAddress,
        note: note,
        shippingFee: shippingFee,
        couponCode: couponCode,
      );
}
