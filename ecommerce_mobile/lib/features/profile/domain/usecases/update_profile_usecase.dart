import 'package:flutter_restapi/features/auth/domain/entities/user_entity.dart';
import '../repositories/profile_repository.dart';

class UpdateProfileParams {
  final String fullName;
  final String phoneNumber;

  const UpdateProfileParams({
    required this.fullName,
    required this.phoneNumber,
  });
}

class UpdateProfileUseCase {
  final ProfileRepository _repository;

  UpdateProfileUseCase(this._repository);

  Future<UserEntity> call(UpdateProfileParams params) {
    return _repository.updateProfile(
      fullName: params.fullName,
      phoneNumber: params.phoneNumber,
    );
  }
}
