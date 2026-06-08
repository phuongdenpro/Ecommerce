import '../../domain/repositories/settings_repository.dart';
import '../datasources/settings_remote_datasource.dart';

class SettingsRepositoryImpl implements SettingsRepository {
  final SettingsRemoteDataSource _remote;

  SettingsRepositoryImpl(this._remote);

  @override
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) {
    return _remote.changePassword(
      currentPassword: currentPassword,
      newPassword: newPassword,
    );
  }
}
