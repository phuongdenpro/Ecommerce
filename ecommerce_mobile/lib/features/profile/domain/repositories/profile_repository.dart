import 'package:flutter_restapi/features/auth/domain/entities/user_entity.dart';

abstract class ProfileRepository {
  Future<UserEntity> getProfile();

  Future<UserEntity> updateProfile({
    required String fullName,
    required String phoneNumber,
  });
}
