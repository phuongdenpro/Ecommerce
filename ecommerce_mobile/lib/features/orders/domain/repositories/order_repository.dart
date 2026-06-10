import '../../domain/entities/order_entity.dart';

abstract class OrderRepository {
  Future<List<OrderEntity>> getOrders({
    required int page,
    required int pageSize,
  });

  Future<OrderEntity> getOrderById(int id);

  Future<OrderEntity> createOrder({
    required List<({int productId, int quantity})> items,
    required String recipientName,
    required String recipientPhone,
    required String shippingAddress,
    required String paymentMethod,
    String? notes,
  });

  Future<void> cancelOrder(int orderId);

  Future<void> updateOrderStatus(int orderId, String status);
}
