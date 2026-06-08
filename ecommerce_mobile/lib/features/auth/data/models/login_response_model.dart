import 'user_model.dart';

class LoginResponseModel {
  final String accessToken;
  final String? refreshToken;
  final UserModel? user;

  const LoginResponseModel({
    required this.accessToken,
    this.refreshToken,
    this.user,
  });

  factory LoginResponseModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>;
    return LoginResponseModel(
      accessToken: data['accessToken'] as String,
      refreshToken: data['refreshToken'] as String?,
      user: data['user'] != null
          ? UserModel.fromJson(data['user'] as Map<String, dynamic>)
          : null,
    );
  }
}
