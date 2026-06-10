class OrderSuccessArgs {
  final String orderId;
  final String orderCode;

  const OrderSuccessArgs({required this.orderId, required this.orderCode});
}

class BankTransferArgs {
  final String orderId;
  final String orderCode;
  final double amount;

  const BankTransferArgs({
    required this.orderId,
    required this.orderCode,
    required this.amount,
  });
}
