enum PaymentMethodType {
  cod,
  bankTransfer,
  onlinePayment,
}

extension PaymentMethodTypeX on PaymentMethodType {
  int get apiValue => switch (this) {
        PaymentMethodType.cod => 0,
        PaymentMethodType.bankTransfer => 1,
        PaymentMethodType.onlinePayment => 2,
      };

  String get label => switch (this) {
        PaymentMethodType.cod => 'Thanh toán khi nhận hàng (COD)',
        PaymentMethodType.bankTransfer => 'Chuyển khoản ngân hàng',
        PaymentMethodType.onlinePayment => 'Thanh toán online',
      };
}

class PaymentEntity {
  final String id;
  final String orderId;
  final String method;
  final String status;
  final double amount;
  final String? transactionId;
  final DateTime? paidAt;

  const PaymentEntity({
    required this.id,
    required this.orderId,
    required this.method,
    required this.status,
    required this.amount,
    this.transactionId,
    this.paidAt,
  });

  bool get isPaid => status.toLowerCase() == 'paid';
}
