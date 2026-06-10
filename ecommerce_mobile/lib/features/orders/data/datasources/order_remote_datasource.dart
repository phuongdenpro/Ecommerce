import 'package:dio/dio.dart';

import 'package:flutter_restapi/core/errors/exception_mapper.dart';
import 'package:flutter_restapi/core/network/api_client.dart';

import '../models/order_model.dart';

class OrderRemoteDataSource {
  final ApiClient _client;

  OrderRemoteDataSource(this._client);

  Future<List<OrderModel>> getOrders({
    required int page,
    required int pageSize,
  }) async {
    try {
      final response = await _client.dio.get(
        '/api/orders/my-orders',
        queryParameters: {'page': page, 'pageSize': pageSize},
      );

      List<dynamic> items = [];
      if (response.data is List) {
        items = response.data as List<dynamic>;
      } else if (response.data is Map<String, dynamic>) {
        final data = response.data as Map<String, dynamic>;
        if (data['data'] is List) {
          items = data['data'] as List<dynamic>;
        }
      }

      return items
          .map((item) => OrderModel.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<OrderModel> getOrderById(int id) async {
    try {
      final response = await _client.dio.get('/api/orders/$id');
      final orderData = response.data is Map<String, dynamic>
          ? (response.data as Map<String, dynamic>)['data'] ?? response.data
          : response.data;
      return OrderModel.fromJson(orderData as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<OrderModel> createOrder({
    required List<({int productId, int quantity})> items,
    required String recipientName,
    required String recipientPhone,
    required String shippingAddress,
    required String paymentMethod,
    String? notes,
  }) async {
    try {
      final response = await _client.dio.post(
        '/api/orders',
        data: {
          'items': items
              .map((item) => {'productId': item.productId, 'quantity': item.quantity})
              .toList(),
          'recipientName': recipientName,
          'recipientPhone': recipientPhone,
          'shippingAddress': shippingAddress,
          'paymentMethod': paymentMethod,
          'notes': notes,
        },
      );

      final orderData = response.data is Map<String, dynamic>
          ? (response.data as Map<String, dynamic>)['data'] ?? response.data
          : response.data;
      return OrderModel.fromJson(orderData as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<void> cancelOrder(int orderId) async {
    try {
      await _client.dio.post('/api/orders/$orderId/cancel');
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<void> updateOrderStatus(int orderId, String status) async {
    try {
      await _client.dio.put(
        '/api/orders/$orderId/status',
        data: {'status': status},
      );
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }
}
