import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flutter_restapi/features/settings/domain/usecases/change_password_usecase.dart';
import 'settings_providers.dart';

class ChangePasswordController extends Notifier<AsyncValue<void>> {
  @override
  AsyncValue<void> build() => const AsyncData(null);

  Future<String?> submit({
    required String currentPassword,
    required String newPassword,
    required String confirmPassword,
  }) async {
    state = const AsyncLoading();
    try {
      await ref.read(changePasswordUseCaseProvider).call(
            ChangePasswordParams(
              currentPassword: currentPassword,
              newPassword: newPassword,
              confirmPassword: confirmPassword,
            ),
          );
      state = const AsyncData(null);
      return null;
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
      return error.toString();
    }
  }
}

final changePasswordControllerProvider =
    NotifierProvider<ChangePasswordController, AsyncValue<void>>(ChangePasswordController.new);
