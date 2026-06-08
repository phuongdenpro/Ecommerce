enum OrderStatus { pending, processing, shipped, delivered, cancelled }

class OrderEntity {
  final String id;
  final String productName;
  final int quantity;
  final int totalAmount;
  final DateTime createdAt;
  final OrderStatus status;

  const OrderEntity({
    required this.id,
    required this.productName,
    required this.quantity,
    required this.totalAmount,
    required this.createdAt,
    required this.status,
  });

  String get statusLabel => switch (status) {
        OrderStatus.pending => 'Chờ xử lý',
        OrderStatus.processing => 'Đang xử lý',
        OrderStatus.shipped => 'Đang giao',
        OrderStatus.delivered => 'Đã giao',
        OrderStatus.cancelled => 'Đã hủy',
      };
}
