import 'package:dio/dio.dart';

import 'package:flutter_restapi/core/errors/exception_mapper.dart';
import 'package:flutter_restapi/core/network/api_client.dart';

class SettingsRemoteDataSource {
  final ApiClient _client;

  SettingsRemoteDataSource(this._client);

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      await _client.dio.post(
        '/auth/change-password',
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );
    } on DioException catch (e) {
      throw ExceptionMapper.fromDio(e);
    }
  }
}
