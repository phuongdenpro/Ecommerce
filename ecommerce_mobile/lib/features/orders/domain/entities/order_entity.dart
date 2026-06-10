enum OrderStatus {
  pending,
  confirmed,
  processing,
  shipping,
  delivered,
  cancelled,
}

typedef OrderItem = ({
  String productId,
  String productName,
  double unitPrice,
  int quantity,
  String? imageUrl,
  double subTotal,
});

class OrderEntity {
  final String id;
  final String orderCode;
  final double totalAmount;
  final double shippingFee;
  final double discountAmount;
  final double finalAmount;
  final OrderStatus status;
  final String? paymentMethod;
  final String? paymentStatus;
  final String shippingAddress;
  final String? note;
  final DateTime createdAt;
  final List<OrderItem> items;

  const OrderEntity({
    required this.id,
    required this.orderCode,
    required this.totalAmount,
    required this.shippingFee,
    required this.discountAmount,
    required this.finalAmount,
    required this.status,
    this.paymentMethod,
    this.paymentStatus,
    required this.shippingAddress,
    this.note,
    required this.createdAt,
    required this.items,
  });

  String get statusLabel => switch (status) {
        OrderStatus.pending => 'Chờ xác nhận',
        OrderStatus.confirmed => 'Đã xác nhận',
        OrderStatus.processing => 'Đang xử lý',
        OrderStatus.shipping => 'Đang giao',
        OrderStatus.delivered => 'Đã giao',
        OrderStatus.cancelled => 'Đã hủy',
      };

  String get paymentStatusLabel => switch (paymentStatus?.toLowerCase()) {
        'paid' => 'Đã thanh toán',
        'pending' => 'Chờ thanh toán',
        'failed' => 'Thanh toán thất bại',
        'refunded' => 'Đã hoàn tiền',
        _ => paymentStatus ?? 'Không rõ',
      };

  String get paymentMethodLabel => switch (paymentMethod?.toLowerCase()) {
        'cod' => 'Thanh toán khi nhận hàng (COD)',
        'banktransfer' => 'Chuyển khoản ngân hàng',
        'onlinepayment' => 'Thanh toán online',
        _ => paymentMethod ?? 'Không rõ',
      };

  int get totalItems => items.fold<int>(0, (sum, item) => sum + item.quantity);

  bool get canCancel => status == OrderStatus.pending;
}
