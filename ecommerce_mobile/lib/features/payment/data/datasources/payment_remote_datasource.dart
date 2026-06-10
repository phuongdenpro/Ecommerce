import 'package:dio/dio.dart';
import 'package:flutter_restapi/core/errors/exception_mapper.dart';
import 'package:flutter_restapi/core/network/api_client.dart';
import 'package:flutter_restapi/core/network/api_response_parser.dart';
import 'package:flutter_restapi/features/payment/domain/entities/payment_entity.dart';

import '../models/payment_model.dart';

class PaymentRemoteDataSource {
  final ApiClient _client;

  PaymentRemoteDataSource(this._client);

  Future<PaymentModel> processPayment({
    required String orderId,
    required PaymentMethodType method,
  }) async {
    try {
      final response = await _client.dio.post(
        '/payments/process',
        data: {
          'orderId': orderId,
          'method': method.apiValue,
        },
      );
      return PaymentModel.fromJson(
        ApiResponseParser.extractMap(response.data),
      );
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<PaymentModel> getPaymentByOrderId(String orderId) async {
    try {
      final response = await _client.dio.get('/payments/order/$orderId');
      return PaymentModel.fromJson(
        ApiResponseParser.extractMap(response.data),
      );
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }
}
