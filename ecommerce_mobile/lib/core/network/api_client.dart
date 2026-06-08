import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../storage/token_storage.dart';
import '../constants/api_constants.dart';

class ApiClient {
  final Dio dio;
  final TokenStorage tokenStorage;
  bool _isRefreshing = false;

  ApiClient(this.tokenStorage)
      : dio = Dio(BaseOptions(
          baseUrl: ApiConstants.baseUrl,
          connectTimeout: const Duration(seconds: 15),
          receiveTimeout: const Duration(seconds: 15),
          headers: {
            'Accept': 'application/json',
          },
        )) {
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await tokenStorage.getToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        final statusCode = error.response?.statusCode;
        // 1. Nếu lỗi 401 thì thử refresh token
          if (statusCode == 401) {
            final success = await _refreshToken();

            if (success) {
              final newToken = await tokenStorage.getToken();

              final requestOptions = error.requestOptions;
              requestOptions.headers['Authorization'] = 'Bearer $newToken';

              final response = await dio.fetch(requestOptions);

              return handler.resolve(response);
            } else {
              await tokenStorage.clearToken();
              return handler.next(error);
            }
          }
          // 2. Nếu lỗi mạng thì retry
          if (_shouldRetry(error)) {
            try {
              final response = await _retry(error.requestOptions);
              return handler.resolve(response);
            } catch (_) {
              return handler.next(error);
            }
          }
        return handler.next(error);
      },
    ));

    dio.interceptors.add(LogInterceptor(
      request: true,
      requestHeader: false,
      requestBody: true,
      responseHeader: false,
      responseBody: true,
      error: true,
      logPrint: (message) {
        if (kDebugMode) {
          print(message.toString());
        }
      },
    ));
  }
   Future<bool> _refreshToken() async {
    if (_isRefreshing) return false;

    _isRefreshing = true;

    try {
      final refreshToken = await tokenStorage.getRefreshToken();

      if (refreshToken == null || refreshToken.isEmpty) {
        return false;
      }

      final response = await dio.post(
        '/auth/refresh-token',
        data: {
          'refreshToken': refreshToken,
        },
      );

      final newAccessToken = response.data['accessToken'];
      final newRefreshToken = response.data['refreshToken'];

      await tokenStorage.saveToken(newAccessToken);
      await tokenStorage.saveRefreshToken(newRefreshToken);

      return true;
    } catch (e) {
      return false;
    } finally {
      _isRefreshing = false;
    }
  }

  bool _shouldRetry(DioException error) {
    return error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.connectionError ||
        error.type == DioExceptionType.unknown;
  }

  Future<Response<dynamic>> _retry(RequestOptions requestOptions) async {
    await Future.delayed(const Duration(seconds: 2));

    return dio.fetch(requestOptions);
  }
}
