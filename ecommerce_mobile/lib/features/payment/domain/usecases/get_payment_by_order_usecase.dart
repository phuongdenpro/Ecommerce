import '../entities/payment_entity.dart';
import '../repositories/payment_repository.dart';

class GetPaymentByOrderUseCase {
  final PaymentRepository _repository;

  GetPaymentByOrderUseCase(this._repository);

  Future<PaymentEntity> call(String orderId) =>
      _repository.getPaymentByOrderId(orderId);
}
