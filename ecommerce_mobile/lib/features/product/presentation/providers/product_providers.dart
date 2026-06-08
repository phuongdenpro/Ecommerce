import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flutter_restapi/core/providers/core_providers.dart';
import '../../data/datasources/product_remote_datasource.dart';
import '../../data/repositories/product_repository_impl.dart';
import '../../domain/repositories/product_repository.dart';
import '../../domain/usecases/create_product_usecase.dart';
import '../../domain/usecases/delete_product_usecase.dart';
import '../../domain/usecases/get_product_detail_usecase.dart';
import '../../domain/usecases/get_products_usecase.dart';
import '../../domain/usecases/update_product_usecase.dart';
import '../../domain/usecases/upload_product_image_usecase.dart';

final productRemoteDataSourceProvider = Provider<ProductRemoteDataSource>((ref) {
  return ProductRemoteDataSource(ref.watch(apiClientProvider));
});

final productRepositoryProvider = Provider<ProductRepository>((ref) {
  return ProductRepositoryImpl(ref.watch(productRemoteDataSourceProvider));
});

final getProductsUseCaseProvider = Provider<GetProductsUseCase>((ref) {
  return GetProductsUseCase(ref.watch(productRepositoryProvider));
});

final getProductDetailUseCaseProvider = Provider<GetProductDetailUseCase>((ref) {
  return GetProductDetailUseCase(ref.watch(productRepositoryProvider));
});

final createProductUseCaseProvider = Provider<CreateProductUseCase>((ref) {
  return CreateProductUseCase(ref.watch(productRepositoryProvider));
});

final updateProductUseCaseProvider = Provider<UpdateProductUseCase>((ref) {
  return UpdateProductUseCase(ref.watch(productRepositoryProvider));
});

final deleteProductUseCaseProvider = Provider<DeleteProductUseCase>((ref) {
  return DeleteProductUseCase(ref.watch(productRepositoryProvider));
});

final uploadProductImageUseCaseProvider = Provider<UploadProductImageUseCase>((ref) {
  return UploadProductImageUseCase(ref.watch(productRepositoryProvider));
});

final productDetailProvider = FutureProvider.family.autoDispose(
  (ref, int id) => ref.watch(getProductDetailUseCaseProvider).call(id),
);
