import 'package:dio/dio.dart';

import 'package:flutter_restapi/core/errors/exception_mapper.dart';
import 'package:flutter_restapi/core/network/api_client.dart';
import '../models/login_response_model.dart';

class AuthRemoteDataSource {
  final ApiClient _client;

  AuthRemoteDataSource(this._client);

  Future<LoginResponseModel> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _client.dio.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );
      return LoginResponseModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<void> register({
    required String fullName,
    required String email,
    required String password,
  }) async {
    try {
      await _client.dio.post(
        '/auth/register',
        data: {'fullName': fullName, 'email': email, 'password': password},
      );
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }
}
