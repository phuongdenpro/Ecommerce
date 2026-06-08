import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/usecases/login_usecase.dart';
import 'auth_providers.dart';

class LoginController extends Notifier<AsyncValue<void>> {
  @override
  AsyncValue<void> build() => const AsyncData(null);

  Future<String?> login({required String email, required String password}) async {
    state = const AsyncLoading();
    try {
      await ref.read(loginUseCaseProvider).call(
            LoginParams(email: email, password: password),
          );
      state = const AsyncData(null);
      return null;
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
      return error.toString();
    }
  }
}

final loginControllerProvider =
    NotifierProvider<LoginController, AsyncValue<void>>(LoginController.new);
