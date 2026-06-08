import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flutter_restapi/features/auth/domain/entities/user_entity.dart';
import '../../domain/usecases/update_profile_usecase.dart';
import 'profile_providers.dart';

final currentUserProvider = AsyncNotifierProvider<CurrentUserNotifier, UserEntity?>(
  CurrentUserNotifier.new,
);

class CurrentUserNotifier extends AsyncNotifier<UserEntity?> {
  @override
  Future<UserEntity?> build() async {
    try {
      return await ref.read(getProfileUseCaseProvider).call();
    } catch (_) {
      return null;
    }
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(getProfileUseCaseProvider).call());
  }
}

class EditProfileController extends Notifier<AsyncValue<void>> {
  @override
  AsyncValue<void> build() => const AsyncData(null);

  Future<String?> save({
    required String fullName,
    required String phoneNumber,
  }) async {
    state = const AsyncLoading();
    try {
      await ref.read(updateProfileUseCaseProvider).call(
            UpdateProfileParams(
              fullName: fullName,
              phoneNumber: phoneNumber,
            ),
          );
      await ref.read(currentUserProvider.notifier).refresh();
      state = const AsyncData(null);
      return null;
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
      return error.toString();
    }
  }
}

final editProfileControllerProvider =
    NotifierProvider<EditProfileController, AsyncValue<void>>(EditProfileController.new);
