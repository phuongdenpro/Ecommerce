import 'package:dio/dio.dart';

import 'failures.dart';

abstract final class ExceptionMapper {
  static Failure fromDio(DioException error) {
    final statusCode = error.response?.statusCode;
    if (error.response?.data is Map<String, dynamic>) {
      final data = error.response!.data as Map<String, dynamic>;
      final message = data['message']?.toString();
      if (message != null && message.isNotEmpty) {
        return Failure(message, statusCode: statusCode);
      }
    }
    if (statusCode == 401) {
      return const Failure('Phiên đăng nhập đã hết hạn', statusCode: 401);
    }
    return Failure(
      error.message ?? 'Lỗi kết nối máy chủ',
      statusCode: statusCode,
    );
  }
}
