import 'package:dio/dio.dart';

import 'package:flutter_restapi/core/errors/exception_mapper.dart';
import 'package:flutter_restapi/core/network/api_client.dart';
import 'package:flutter_restapi/features/auth/data/models/user_model.dart';

class ProfileRemoteDataSource {
  final ApiClient _client;

  ProfileRemoteDataSource(this._client);

  Future<UserModel> getProfile() async {
    try {
      final response = await _client.dio.get('/users/profile');
      print('Profile response data: ${response.data}');
      final data = response.data is Map && response.data.containsKey('data')
          ? response.data['data']
          : response.data;
      return UserModel.fromJson(data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }

  Future<UserModel> updateProfile({
    required String fullName,
    required String phoneNumber,
  }) async {
    try {
      final response = await _client.dio.put(
        '/users/profile',
        data: {
          'fullName': fullName,
          'phoneNumber': phoneNumber,
        },
      );
      final data = response.data is Map && response.data.containsKey('data')
          ? response.data['data']
          : response.data;
      return UserModel.fromJson(data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }
}
