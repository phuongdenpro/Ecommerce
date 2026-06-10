import 'package:dio/dio.dart';
import 'package:flutter_restapi/core/errors/exception_mapper.dart';
import 'package:flutter_restapi/core/network/api_client.dart';
import 'package:flutter_restapi/core/network/api_response_parser.dart';

import '../models/cart_model.dart';

class CartRemoteDataSource {
  final ApiClient _client;

  CartRemoteDataSource(this._client);

  Future<CartModel> getCart() async {
    try {
      final response = await _client.dio.get('/cart');
      return CartModel.fromJson(
        ApiResponseParser.extractMap(response.data),
      );
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<CartModel> addToCart({
    required String productId,
    required int quantity,
  }) async {
    try {
      final response = await _client.dio.post(
        '/cart/items',
        data: {
          'productId': productId,
          'quantity': quantity,
        },
      );
      return CartModel.fromJson(
        ApiResponseParser.extractMap(response.data),
      );
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<CartModel> updateCartItem({
    required String itemId,
    required int quantity,
  }) async {
    try {
      final response = await _client.dio.put(
        '/cart/items/$itemId',
        data: {'quantity': quantity},
      );
      return CartModel.fromJson(
        ApiResponseParser.extractMap(response.data),
      );
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<CartModel> removeFromCart(String itemId) async {
    try {
      final response = await _client.dio.delete('/cart/items/$itemId');
      return CartModel.fromJson(
        ApiResponseParser.extractMap(response.data),
      );
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }
}
