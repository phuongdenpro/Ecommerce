import '../entities/user_entity.dart';

abstract class AuthRepository {
  Future<UserEntity> login({required String email, required String password});

  Future<void> register({
    required String fullName,
    required String email,
    required String password,
  });

  Future<void> logout();
}
