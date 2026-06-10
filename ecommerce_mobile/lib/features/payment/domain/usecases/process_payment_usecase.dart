import '../entities/payment_entity.dart';
import '../repositories/payment_repository.dart';

class ProcessPaymentUseCase {
  final PaymentRepository _repository;

  ProcessPaymentUseCase(this._repository);

  Future<PaymentEntity> call({
    required String orderId,
    required PaymentMethodType method,
  }) =>
      _repository.processPayment(orderId: orderId, method: method);
}
