import '../entities/order_entity.dart';

abstract class OrderRepository {
  Future<List<OrderEntity>> getOrders({
    required int page,
    required int pageSize,
  });

  Future<OrderEntity> getOrderById(String id);

  Future<OrderEntity> createOrder({
    required String shippingAddress,
    String? note,
    double shippingFee,
    String? couponCode,
  });

  Future<void> cancelOrder(String orderId);
}
