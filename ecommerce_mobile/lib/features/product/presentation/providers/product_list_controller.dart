import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flutter_restapi/core/constants/app_constants.dart';
import '../../domain/entities/product_entity.dart';
import '../../domain/usecases/create_product_usecase.dart';
import '../../domain/usecases/get_products_usecase.dart';
import '../../domain/usecases/update_product_usecase.dart';
import '../../domain/usecases/upload_product_image_usecase.dart';
import 'product_providers.dart';

class PaginatedProductsState {
  final List<ProductEntity> items;
  final int nextPage;
  final bool hasMore;
  final bool isLoadingMore;
  final bool isRefreshing;

  const PaginatedProductsState({
    this.items = const [],
    this.nextPage = 1,
    this.hasMore = true,
    this.isLoadingMore = false,
    this.isRefreshing = false,
  });

  PaginatedProductsState copyWith({
    List<ProductEntity>? items,
    int? nextPage,
    bool? hasMore,
    bool? isLoadingMore,
    bool? isRefreshing,
  }) {
    return PaginatedProductsState(
      items: items ?? this.items,
      nextPage: nextPage ?? this.nextPage,
      hasMore: hasMore ?? this.hasMore,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      isRefreshing: isRefreshing ?? this.isRefreshing,
    );
  }
}

class PaginatedProductsNotifier extends AsyncNotifier<PaginatedProductsState> {
  GetProductsUseCase get _getProducts => ref.read(getProductsUseCaseProvider);

  @override
  Future<PaginatedProductsState> build() => _loadFirstPage();

  Future<PaginatedProductsState> _loadFirstPage() async {
    final items = await _getProducts.call(
      const GetProductsParams(page: 1, pageSize: AppConstants.defaultPageSize),
    );
    return PaginatedProductsState(
      items: items,
      nextPage: 2,
      hasMore: items.length == AppConstants.defaultPageSize,
    );
  }

  Future<void> refresh() async {
    final current = state.valueOrNull;
    state = AsyncData(current?.copyWith(isRefreshing: true) ?? const PaginatedProductsState(isRefreshing: true));
    state = await AsyncValue.guard(_loadFirstPage);
  }

  Future<void> loadMore() async {
    final current = state.valueOrNull;
    if (current == null || !current.hasMore || current.isLoadingMore) return;

    state = AsyncData(current.copyWith(isLoadingMore: true));

    try {
      final newItems = await _getProducts.call(
        GetProductsParams(page: current.nextPage, pageSize: AppConstants.defaultPageSize),
      );
      state = AsyncData(
        current.copyWith(
          items: [...current.items, ...newItems],
          nextPage: current.nextPage + 1,
          hasMore: newItems.length == AppConstants.defaultPageSize,
          isLoadingMore: false,
        ),
      );
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
    }
  }
}

final paginatedProductsProvider =
    AsyncNotifierProvider<PaginatedProductsNotifier, PaginatedProductsState>(
  PaginatedProductsNotifier.new,
);

final homeProductsProvider = paginatedProductsProvider;

final catalogProductsProvider =
    AsyncNotifierProvider<PaginatedProductsNotifier, PaginatedProductsState>(
  PaginatedProductsNotifier.new,
);

class ProductFormController extends Notifier<AsyncValue<void>> {
  @override
  AsyncValue<void> build() => const AsyncData(null);

  Future<String?> submit({
    int? productId,
    required String name,
    required String description,
    required int price,
    String? imagePath,
  }) async {
    state = const AsyncLoading();
    try {
      final entity = productId == null
          ? await ref.read(createProductUseCaseProvider).call(
                CreateProductParams(name: name, description: description, price: price),
              )
          : await ref.read(updateProductUseCaseProvider).call(
                UpdateProductParams(
                  id: productId,
                  name: name,
                  description: description,
                  price: price,
                ),
              );

      if (imagePath != null) {
        await ref.read(uploadProductImageUseCaseProvider).call(
              UploadProductImageParams(productId: entity.id, imagePath: imagePath),
            );
      }

      ref.invalidate(paginatedProductsProvider);
      ref.invalidate(homeProductsProvider);
      ref.invalidate(catalogProductsProvider);
      state = const AsyncData(null);
      return null;
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
      return error.toString();
    }
  }
}

final productFormControllerProvider =
    NotifierProvider<ProductFormController, AsyncValue<void>>(ProductFormController.new);

class ProductManagementController extends AsyncNotifier<PaginatedProductsState> {
  @override
  Future<PaginatedProductsState> build() => _loadFirstPage();

  Future<PaginatedProductsState> _loadFirstPage() async {
    final items = await ref.read(getProductsUseCaseProvider).call(
          const GetProductsParams(page: 1, pageSize: AppConstants.defaultPageSize),
        );
    return PaginatedProductsState(
      items: items,
      nextPage: 2,
      hasMore: items.length == AppConstants.defaultPageSize,
    );
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_loadFirstPage);
  }

  Future<void> loadMore() async {
    final current = state.valueOrNull;
    if (current == null || !current.hasMore || current.isLoadingMore) return;

    state = AsyncData(current.copyWith(isLoadingMore: true));

    try {
      final newItems = await ref.read(getProductsUseCaseProvider).call(
            GetProductsParams(page: current.nextPage, pageSize: AppConstants.defaultPageSize),
          );
      state = AsyncData(
        current.copyWith(
          items: [...current.items, ...newItems],
          nextPage: current.nextPage + 1,
          hasMore: newItems.length == AppConstants.defaultPageSize,
          isLoadingMore: false,
        ),
      );
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
    }
  }

  Future<String?> deleteProduct(int id) async {
    try {
      await ref.read(deleteProductUseCaseProvider).call(id);
      await refresh();
      ref.invalidate(homeProductsProvider);
      ref.invalidate(catalogProductsProvider);
      return null;
    } catch (error) {
      return error.toString();
    }
  }
}

final productManagementControllerProvider =
    AsyncNotifierProvider<ProductManagementController, PaginatedProductsState>(
  ProductManagementController.new,
);
