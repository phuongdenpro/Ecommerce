import '../repositories/settings_repository.dart';

class ChangePasswordParams {
  final String currentPassword;
  final String newPassword;
  final String confirmPassword;

  const ChangePasswordParams({
    required this.currentPassword,
    required this.newPassword,
    required this.confirmPassword,
  });
}

class ChangePasswordUseCase {
  final SettingsRepository _repository;

  ChangePasswordUseCase(this._repository);

  Future<void> call(ChangePasswordParams params) {
    return _repository.changePassword(
      currentPassword: params.currentPassword,
      newPassword: params.newPassword,
    );
  }
}
