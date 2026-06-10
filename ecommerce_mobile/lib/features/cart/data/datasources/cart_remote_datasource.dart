import 'package:dio/dio.dart';

import 'package:flutter_restapi/core/errors/exception_mapper.dart';
import 'package:flutter_restapi/core/network/api_client.dart';

import '../models/cart_item_model.dart';
import '../models/cart_model.dart';

class CartRemoteDataSource {
  final ApiClient _client;

  CartRemoteDataSource(this._client);

  Future<CartModel> getCart() async {
    try {
      final response = await _client.dio.get('/api/cart');
      final cartData = response.data is Map<String, dynamic>
          ? (response.data as Map<String, dynamic>)['data'] ?? response.data
          : response.data;
      return CartModel.fromJson(cartData as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<CartItemModel> addToCart({
    required int productId,
    required int quantity,
  }) async {
    try {
      final response = await _client.dio.post(
        '/api/cart/items',
        data: {
          'productId': productId,
          'quantity': quantity,
        },
      );

      final itemData = response.data is Map<String, dynamic>
          ? (response.data as Map<String, dynamic>)['data'] ?? response.data
          : response.data;
      return CartItemModel.fromJson(itemData as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<void> updateCartItem({
    required int productId,
    required int quantity,
  }) async {
    try {
      await _client.dio.put(
        '/api/cart/items/$productId',
        data: {'quantity': quantity},
      );
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<void> removeFromCart(int productId) async {
    try {
      await _client.dio.delete('/api/cart/items/$productId');
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<void> clearCart() async {
    try {
      await _client.dio.delete('/api/cart');
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }
}
