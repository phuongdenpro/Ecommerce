import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flutter_restapi/core/providers/core_providers.dart';
import 'package:flutter_restapi/features/payment/data/datasources/payment_remote_datasource.dart';
import 'package:flutter_restapi/features/payment/data/repositories/payment_repository_impl.dart';
import 'package:flutter_restapi/features/payment/domain/entities/payment_entity.dart';
import 'package:flutter_restapi/features/payment/domain/repositories/payment_repository.dart';
import 'package:flutter_restapi/features/payment/domain/usecases/get_payment_by_order_usecase.dart';
import 'package:flutter_restapi/features/payment/domain/usecases/process_payment_usecase.dart';

final paymentRemoteDataSourceProvider = Provider<PaymentRemoteDataSource>((ref) {
  return PaymentRemoteDataSource(ref.watch(apiClientProvider));
});

final paymentRepositoryProvider = Provider<PaymentRepository>((ref) {
  return PaymentRepositoryImpl(ref.watch(paymentRemoteDataSourceProvider));
});

final processPaymentUseCaseProvider = Provider<ProcessPaymentUseCase>((ref) {
  return ProcessPaymentUseCase(ref.watch(paymentRepositoryProvider));
});

final getPaymentByOrderUseCaseProvider = Provider<GetPaymentByOrderUseCase>((ref) {
  return GetPaymentByOrderUseCase(ref.watch(paymentRepositoryProvider));
});

final paymentByOrderProvider = FutureProvider.family.autoDispose(
  (ref, String orderId) =>
      ref.watch(getPaymentByOrderUseCaseProvider).call(orderId),
);

class PaymentController extends Notifier<AsyncValue<PaymentEntity?>> {
  @override
  AsyncValue<PaymentEntity?> build() => const AsyncData(null);

  Future<PaymentEntity> processPayment({
    required String orderId,
    required PaymentMethodType method,
  }) async {
    state = const AsyncLoading();
    try {
      final payment = await ref.read(processPaymentUseCaseProvider).call(
            orderId: orderId,
            method: method,
          );
      state = AsyncData(payment);
      ref.invalidate(paymentByOrderProvider(orderId));
      return payment;
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
      rethrow;
    }
  }
}

final paymentControllerProvider =
    NotifierProvider<PaymentController, AsyncValue<PaymentEntity?>>(
  PaymentController.new,
);
