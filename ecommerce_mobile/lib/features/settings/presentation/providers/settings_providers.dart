import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flutter_restapi/core/providers/core_providers.dart';
import '../../data/datasources/settings_remote_datasource.dart';
import '../../data/repositories/settings_repository_impl.dart';
import '../../domain/repositories/settings_repository.dart';
import '../../domain/usecases/change_password_usecase.dart';

final settingsRemoteDataSourceProvider = Provider<SettingsRemoteDataSource>((ref) {
  return SettingsRemoteDataSource(ref.watch(apiClientProvider));
});

final settingsRepositoryProvider = Provider<SettingsRepository>((ref) {
  return SettingsRepositoryImpl(ref.watch(settingsRemoteDataSourceProvider));
});

final changePasswordUseCaseProvider = Provider<ChangePasswordUseCase>((ref) {
  return ChangePasswordUseCase(ref.watch(settingsRepositoryProvider));
});
