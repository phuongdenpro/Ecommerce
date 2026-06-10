import '../entities/payment_entity.dart';

abstract class PaymentRepository {
  Future<PaymentEntity> processPayment({
    required String orderId,
    required PaymentMethodType method,
  });

  Future<PaymentEntity> getPaymentByOrderId(String orderId);
}
