import 'dart:io';

import 'package:dio/dio.dart';

import 'package:flutter_restapi/core/errors/exception_mapper.dart';
import 'package:flutter_restapi/core/network/api_client.dart';
import '../models/product_model.dart';

class ProductRemoteDataSource {
  final ApiClient _client;

  ProductRemoteDataSource(this._client);

  Future<List<ProductModel>> getProducts({
    required int page,
    required int pageSize,
  }) async {
    try {
      final response = await _client.dio.get(
        '/products',
        queryParameters: {'page': page, 'pageSize': pageSize},
      );
      final responseData = response.data;

      List<dynamic> items = [];
      if (responseData is List) {
        items = responseData;
      } else if (responseData is Map<String, dynamic> && responseData['data'] is List) {
        items = responseData['data'] as List<dynamic>;
      }

      return items
          .map((item) => ProductModel.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<ProductModel> getProductById(int id) async {
    try {
      final response = await _client.dio.get('/admin/products/$id');
      return ProductModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<ProductModel> createProduct({
    required String name,
    required String description,
    required int price,
  }) async {
    try {
      final response = await _client.dio.post(
        '/products',
        data: {
          'name': name,
          'description': description,
          'price': price,
          'quantity': 1,
        },
      );
      return ProductModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<ProductModel> updateProduct({
    required int id,
    required String name,
    required String description,
    required int price,
  }) async {
    try {
      final response = await _client.dio.put(
        '/products/$id',
        data: {
          'name': name,
          'description': description,
          'price': price,
          'quantity': 1,
        },
      );
      return ProductModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<void> deleteProduct(int id) async {
    try {
      await _client.dio.delete('/products/$id');
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<void> uploadProductImage({
    required int productId,
    required String imagePath,
  }) async {
    try {
      final fileName = imagePath.split(Platform.pathSeparator).last;
      final formData = FormData.fromMap({
        'image': await MultipartFile.fromFile(imagePath, filename: fileName),
      });
      await _client.dio.post('/products/$productId/upload-image', data: formData);
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }
}
