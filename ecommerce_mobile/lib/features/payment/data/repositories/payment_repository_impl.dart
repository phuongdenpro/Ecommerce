import '../../domain/entities/payment_entity.dart';
import '../../domain/repositories/payment_repository.dart';
import '../datasources/payment_remote_datasource.dart';

class PaymentRepositoryImpl implements PaymentRepository {
  final PaymentRemoteDataSource _remote;

  PaymentRepositoryImpl(this._remote);

  @override
  Future<PaymentEntity> processPayment({
    required String orderId,
    required PaymentMethodType method,
  }) async {
    final model = await _remote.processPayment(orderId: orderId, method: method);
    return model.toEntity();
  }

  @override
  Future<PaymentEntity> getPaymentByOrderId(String orderId) async {
    final model = await _remote.getPaymentByOrderId(orderId);
    return model.toEntity();
  }
}
