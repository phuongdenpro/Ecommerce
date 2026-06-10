enum OrderStatus { pending, confirmed, shipping, completed, cancelled }

typedef OrderItem = ({
  int productId,
  String productName,
  int price,
  int quantity,
  String? imageUrl,
});

class OrderEntity {
  final int id;
  final String orderCode;
  final int totalAmount;
  final OrderStatus status;
  final String? paymentMethod;
  final String? paymentStatus;
  final String shippingAddress;
  final String recipientName;
  final String recipientPhone;
  final String? notes;
  final DateTime createdAt;
  final List<OrderItem> items;

  const OrderEntity({
    required this.id,
    required this.orderCode,
    required this.totalAmount,
    required this.status,
    this.paymentMethod,
    this.paymentStatus,
    required this.shippingAddress,
    required this.recipientName,
    required this.recipientPhone,
    this.notes,
    required this.createdAt,
    required this.items,
  });

  String get statusLabel => switch (status) {
        OrderStatus.pending => 'Chờ xác nhận',
        OrderStatus.confirmed => 'Đã xác nhận',
        OrderStatus.shipping => 'Đang giao',
        OrderStatus.completed => 'Đã giao',
        OrderStatus.cancelled => 'Đã hủy',
      };

  int get totalItems => items.fold<int>(0, (sum, item) => sum + item.quantity);
}
