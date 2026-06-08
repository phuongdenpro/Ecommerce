import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/usecases/register_usecase.dart';
import 'auth_providers.dart';

class RegisterController extends Notifier<AsyncValue<void>> {
  @override
  AsyncValue<void> build() => const AsyncData(null);

  Future<String?> register({
    required String fullName,
    required String email,
    required String password,
  }) async {
    state = const AsyncLoading();
    try {
      await ref.read(registerUseCaseProvider).call(
            RegisterParams(fullName: fullName, email: email, password: password),
          );
      state = const AsyncData(null);
      return null;
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
      return error.toString();
    }
  }
}

final registerControllerProvider =
    NotifierProvider<RegisterController, AsyncValue<void>>(RegisterController.new);
