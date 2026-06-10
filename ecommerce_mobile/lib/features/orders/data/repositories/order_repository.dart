import '../../domain/entities/order_entity.dart';
import '../../domain/repositories/order_repository.dart';
import '../datasources/order_remote_datasource.dart';

class OrderRepositoryImpl implements OrderRepository {
  final OrderRemoteDataSource _remote;

  OrderRepositoryImpl(this._remote);

  @override
  Future<List<OrderEntity>> getOrders({
    required int page,
    required int pageSize,
  }) async {
    final models = await _remote.getOrders(page: page, pageSize: pageSize);
    return models.map((m) => m.toEntity()).toList();
  }

  @override
  Future<OrderEntity> getOrderById(int id) async {
    final model = await _remote.getOrderById(id);
    return model.toEntity();
  }

  @override
  Future<OrderEntity> createOrder({
    required List<({int productId, int quantity})> items,
    required String recipientName,
    required String recipientPhone,
    required String shippingAddress,
    required String paymentMethod,
    String? notes,
  }) async {
    final model = await _remote.createOrder(
      items: items,
      recipientName: recipientName,
      recipientPhone: recipientPhone,
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
      notes: notes,
    );
    return model.toEntity();
  }

  @override
  Future<void> cancelOrder(int orderId) => _remote.cancelOrder(orderId);

  @override
  Future<void> updateOrderStatus(int orderId, String status) =>
      _remote.updateOrderStatus(orderId, status);
}
