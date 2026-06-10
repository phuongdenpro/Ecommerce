import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_restapi/core/errors/exception_mapper.dart';
import 'package:flutter_restapi/core/network/api_client.dart';
import 'package:flutter_restapi/core/network/api_response_parser.dart';

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
        queryParameters: {
          'pageNumber': page,
          'pageSize': pageSize,
        },
      );
      return ApiResponseParser.parseList(
        response.data,
        ProductModel.fromJson,
      );
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<ProductModel> getProductById(String id) async {
    try {
      final response = await _client.dio.get('/products/$id');
      return ProductModel.fromJson(
        ApiResponseParser.extractMap(response.data),
      );
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
      return ProductModel.fromJson(
        ApiResponseParser.extractMap(response.data),
      );
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<ProductModel> updateProduct({
    required String id,
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
      return ProductModel.fromJson(
        ApiResponseParser.extractMap(response.data),
      );
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<void> deleteProduct(String id) async {
    try {
      await _client.dio.delete('/products/$id');
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<void> uploadProductImage({
    required String productId,
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
