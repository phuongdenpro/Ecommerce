import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flutter_restapi/core/providers/core_providers.dart';

import '../../data/datasources/cart_remote_datasource.dart';
import '../../data/repositories/cart_repository_impl.dart';
import '../../domain/entities/cart_entity.dart';
import '../../domain/repositories/cart_repository.dart';
import '../../domain/usecases/add_to_cart_usecase.dart';
import '../../domain/usecases/clear_cart_usecase.dart';
import '../../domain/usecases/get_cart_usecase.dart';
import '../../domain/usecases/remove_from_cart_usecase.dart';
import '../../domain/usecases/update_cart_item_usecase.dart';

final cartRemoteDataSourceProvider = Provider<CartRemoteDataSource>((ref) {
  return CartRemoteDataSource(ref.watch(apiClientProvider));
});

final cartRepositoryProvider = Provider<CartRepository>((ref) {
  return CartRepositoryImpl(ref.watch(cartRemoteDataSourceProvider));
});

final getCartUseCaseProvider = Provider<GetCartUseCase>((ref) {
  return GetCartUseCase(ref.watch(cartRepositoryProvider));
});

final addToCartUseCaseProvider = Provider<AddToCartUseCase>((ref) {
  return AddToCartUseCase(ref.watch(cartRepositoryProvider));
});

final updateCartItemUseCaseProvider = Provider<UpdateCartItemUseCase>((ref) {
  return UpdateCartItemUseCase(ref.watch(cartRepositoryProvider));
});

final removeFromCartUseCaseProvider = Provider<RemoveFromCartUseCase>((ref) {
  return RemoveFromCartUseCase(ref.watch(cartRepositoryProvider));
});

final clearCartUseCaseProvider = Provider<ClearCartUseCase>((ref) {
  return ClearCartUseCase(ref.watch(cartRepositoryProvider));
});

// Cart State Provider
final cartProvider = FutureProvider<CartEntity>((ref) async {
  return ref.watch(getCartUseCaseProvider).call();
});

// Cart Controller for mutations
class CartController extends Notifier<AsyncValue<void>> {
  @override
  AsyncValue<void> build() => const AsyncData(null);

  Future<void> addToCart(int productId, int quantity) async {
    state = const AsyncLoading();
    try {
      await ref.read(addToCartUseCaseProvider).call(
            productId: productId,
            quantity: quantity,
          );
      ref.invalidate(cartProvider);
      state = const AsyncData(null);
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
      rethrow;
    }
  }

  Future<void> updateCartItem(int productId, int quantity) async {
    state = const AsyncLoading();
    try {
      await ref.read(updateCartItemUseCaseProvider).call(
            productId: productId,
            quantity: quantity,
          );
      ref.invalidate(cartProvider);
      state = const AsyncData(null);
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
      rethrow;
    }
  }

  Future<void> removeFromCart(int productId) async {
    state = const AsyncLoading();
    try {
      await ref.read(removeFromCartUseCaseProvider).call(productId);
      ref.invalidate(cartProvider);
      state = const AsyncData(null);
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
      rethrow;
    }
  }

  Future<void> clearCart() async {
    state = const AsyncLoading();
    try {
      await ref.read(clearCartUseCaseProvider).call();
      ref.invalidate(cartProvider);
      state = const AsyncData(null);
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
      rethrow;
    }
  }

  Future<void> refreshCart() async {
    ref.invalidate(cartProvider);
  }
}

final cartControllerProvider = NotifierProvider<CartController, AsyncValue<void>>(
  CartController.new,
);
