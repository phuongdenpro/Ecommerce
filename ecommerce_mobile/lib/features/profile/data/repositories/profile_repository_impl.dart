import 'package:flutter_restapi/features/auth/domain/entities/user_entity.dart';
import '../../domain/repositories/profile_repository.dart';
import '../datasources/profile_remote_datasource.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  final ProfileRemoteDataSource _remote;

  ProfileRepositoryImpl(this._remote);

  @override
  Future<UserEntity> getProfile() async {
    final model = await _remote.getProfile();
    return model.toEntity();
  }

  @override
  Future<UserEntity> updateProfile({
    required String fullName,
    required String phoneNumber,
  }) async {
    final model = await _remote.updateProfile(
      fullName: fullName,
      phoneNumber: phoneNumber,
    );
    return model.toEntity();
  }
}
