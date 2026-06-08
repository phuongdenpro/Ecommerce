abstract class SettingsRepository {
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  });
}
