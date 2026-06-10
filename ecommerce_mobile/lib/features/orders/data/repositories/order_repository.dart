import '../../domain/entities/order_entity.dart';
import '../../domain/repositories/order_repository.dart' as repo_interface;
import '../datasources/order_remote_datasource.dart';

class OrderRepositoryImpl implements repo_interface.OrderRepository {
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
  Future<OrderEntity> getOrderById(String id) async {
    final model = await _remote.getOrderById(id);
    return model.toEntity();
  }

  @override
  Future<OrderEntity> createOrder({
    required String shippingAddress,
    String? note,
    double shippingFee = 0,
    String? couponCode,
  }) async {
    final model = await _remote.createOrder(
      shippingAddress: shippingAddress,
      note: note,
      shippingFee: shippingFee,
      couponCode: couponCode,
    );
    return model.toEntity();
  }

  @override
  Future<void> cancelOrder(String orderId) => _remote.cancelOrder(orderId);
}
