import 'package:dio/dio.dart';
import 'package:flutter_restapi/core/errors/exception_mapper.dart';
import 'package:flutter_restapi/core/network/api_client.dart';
import 'package:flutter_restapi/core/network/api_response_parser.dart';

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
        '/orders/my-orders',
        queryParameters: {
          'pageNumber': page,
          'pageSize': pageSize,
        },
      );
      return ApiResponseParser.parseList(
        response.data,
        OrderModel.fromJson,
      );
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<OrderModel> getOrderById(String id) async {
    try {
      final response = await _client.dio.get('/orders/my-orders/$id');
      return OrderModel.fromJson(
        ApiResponseParser.extractMap(response.data),
      );
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<OrderModel> createOrder({
    required String shippingAddress,
    String? note,
    double shippingFee = 0,
    String? couponCode,
  }) async {
    try {
      final response = await _client.dio.post(
        '/orders',
        data: {
          'shippingAddress': shippingAddress,
          'note': note,
          'shippingFee': shippingFee,
          if (couponCode != null) 'couponCode': couponCode,
        },
      );
      return OrderModel.fromJson(
        ApiResponseParser.extractMap(response.data),
      );
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<void> cancelOrder(String orderId) async {
    try {
      await _client.dio.post('/orders/$orderId/cancel');
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }
}
