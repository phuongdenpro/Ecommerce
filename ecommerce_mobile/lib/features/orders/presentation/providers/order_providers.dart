import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flutter_restapi/core/constants/app_constants.dart';
import 'package:flutter_restapi/core/providers/core_providers.dart';
import 'package:flutter_restapi/features/cart/presentation/providers/cart_providers.dart';

import '../../data/datasources/order_remote_datasource.dart';
import '../../data/repositories/order_repository.dart';
import '../../domain/entities/order_entity.dart';
import '../../domain/repositories/order_repository.dart' as repo_interface;
import '../../domain/usecases/cancel_order_usecase.dart';
import '../../domain/usecases/create_order_usecase.dart';
import '../../domain/usecases/get_order_detail_usecase.dart';
import '../../domain/usecases/get_orders_usecase.dart';

final orderRemoteDataSourceProvider = Provider<OrderRemoteDataSource>((ref) {
  return OrderRemoteDataSource(ref.watch(apiClientProvider));
});

final orderRepositoryProvider = Provider<repo_interface.OrderRepository>((ref) {
  return OrderRepositoryImpl(ref.watch(orderRemoteDataSourceProvider));
});

final getOrdersUseCaseProvider = Provider<GetOrdersUseCase>((ref) {
  return GetOrdersUseCase(ref.watch(orderRepositoryProvider));
});

final getOrderDetailUseCaseProvider = Provider<GetOrderDetailUseCase>((ref) {
  return GetOrderDetailUseCase(ref.watch(orderRepositoryProvider));
});

final createOrderUseCaseProvider = Provider<CreateOrderUseCase>((ref) {
  return CreateOrderUseCase(ref.watch(orderRepositoryProvider));
});

final cancelOrderUseCaseProvider = Provider<CancelOrderUseCase>((ref) {
  return CancelOrderUseCase(ref.watch(orderRepositoryProvider));
});

class OrderListState {
  final List<OrderEntity> items;
  final int nextPage;
  final bool hasMore;
  final bool isLoadingMore;
  final bool isRefreshing;

  const OrderListState({
    this.items = const [],
    this.nextPage = 1,
    this.hasMore = true,
    this.isLoadingMore = false,
    this.isRefreshing = false,
  });

  OrderListState copyWith({
    List<OrderEntity>? items,
    int? nextPage,
    bool? hasMore,
    bool? isLoadingMore,
    bool? isRefreshing,
  }) {
    return OrderListState(
      items: items ?? this.items,
      nextPage: nextPage ?? this.nextPage,
      hasMore: hasMore ?? this.hasMore,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      isRefreshing: isRefreshing ?? this.isRefreshing,
    );
  }
}

class OrderListNotifier extends AsyncNotifier<OrderListState> {
  GetOrdersUseCase get _getOrders => ref.read(getOrdersUseCaseProvider);
  CancelOrderUseCase get _cancelOrder => ref.read(cancelOrderUseCaseProvider);

  @override
  Future<OrderListState> build() => _loadFirstPage();

  Future<OrderListState> _loadFirstPage() async {
    final items = await _getOrders.call(
      page: 1,
      pageSize: AppConstants.defaultPageSize,
    );
    return OrderListState(
      items: items,
      nextPage: 2,
      hasMore: items.length == AppConstants.defaultPageSize,
    );
  }

  Future<void> refresh() async {
    final current = state.valueOrNull;
    state = AsyncData(
      current?.copyWith(isRefreshing: true) ?? const OrderListState(isRefreshing: true),
    );
    state = await AsyncValue.guard(_loadFirstPage);
  }

  Future<void> loadMore() async {
    final current = state.valueOrNull;
    if (current == null || !current.hasMore || current.isLoadingMore) return;

    state = AsyncData(current.copyWith(isLoadingMore: true));

    try {
      final newItems = await _getOrders.call(
        page: current.nextPage,
        pageSize: AppConstants.defaultPageSize,
      );
      state = AsyncData(
        current.copyWith(
          items: [...current.items, ...newItems],
          nextPage: current.nextPage + 1,
          hasMore: newItems.length == AppConstants.defaultPageSize,
          isLoadingMore: false,
        ),
      );
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
    }
  }

  Future<void> cancelOrder(String orderId) async {
    try {
      await _cancelOrder.call(orderId);
      await refresh();
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
      rethrow;
    }
  }
}

final orderListProvider =
    AsyncNotifierProvider<OrderListNotifier, OrderListState>(
  OrderListNotifier.new,
);

final orderDetailProvider = FutureProvider.family.autoDispose(
  (ref, String orderId) => ref.watch(getOrderDetailUseCaseProvider).call(orderId),
);

class CreateOrderController extends Notifier<AsyncValue<OrderEntity?>> {
  @override
  AsyncValue<OrderEntity?> build() => const AsyncData(null);

  Future<OrderEntity?> createOrder({
    required String shippingAddress,
    String? note,
    double shippingFee = 0,
    String? couponCode,
  }) async {
    state = const AsyncLoading();
    try {
      final order = await ref.read(createOrderUseCaseProvider).call(
            shippingAddress: shippingAddress,
            note: note,
            shippingFee: shippingFee,
            couponCode: couponCode,
          );

      ref.invalidate(orderListProvider);
      ref.invalidate(cartProvider);
      state = AsyncData(order);
      return order;
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
      rethrow;
    }
  }
}

final createOrderControllerProvider =
    NotifierProvider<CreateOrderController, AsyncValue<OrderEntity?>>(
  CreateOrderController.new,
);
