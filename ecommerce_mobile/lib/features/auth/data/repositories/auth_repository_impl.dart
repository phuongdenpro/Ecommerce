import 'package:flutter_restapi/core/storage/token_storage.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remote;
  final TokenStorage _tokenStorage;

  AuthRepositoryImpl(this._remote, this._tokenStorage);

  @override
  Future<UserEntity> login({required String email, required String password}) async {
    final response = await _remote.login(email: email, password: password);
    await _tokenStorage.saveToken(response.accessToken);
    if (response.refreshToken != null && response.refreshToken!.isNotEmpty) {
      await _tokenStorage.saveRefreshToken(response.refreshToken!);
    }
    return response.user?.toEntity() ??
        UserEntity(id: '0', fullName: '', email: email, role: 'User');
  }

  @override
  Future<void> register({
    required String fullName,
    required String email,
    required String password,
  }) {
    return _remote.register(fullName: fullName, email: email, password: password);
  }

  @override
  Future<void> logout() => _tokenStorage.clearToken();
}
