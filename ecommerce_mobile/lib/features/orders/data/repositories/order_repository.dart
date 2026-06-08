import '../../domain/entities/order_entity.dart';

/// Repository mẫu — thay bằng API thật khi backend sẵn sàng.
class OrderRepository {
  Future<List<OrderEntity>> getOrders() async {
    await Future<void>.delayed(const Duration(milliseconds: 400));
    return [
      OrderEntity(
        id: 'DH-2026-001',
        productName: 'Tai nghe Bluetooth Pro',
        quantity: 1,
        totalAmount: 890000,
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
        status: OrderStatus.processing,
      ),
      OrderEntity(
        id: 'DH-2026-002',
        productName: 'Bàn phím cơ RGB',
        quantity: 2,
        totalAmount: 2400000,
        createdAt: DateTime.now().subtract(const Duration(days: 3)),
        status: OrderStatus.delivered,
      ),
      OrderEntity(
        id: 'DH-2026-003',
        productName: 'Chuột không dây',
        quantity: 1,
        totalAmount: 450000,
        createdAt: DateTime.now().subtract(const Duration(days: 5)),
        status: OrderStatus.shipped,
      ),
    ];
  }
}
