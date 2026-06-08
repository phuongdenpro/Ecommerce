import '../entities/product_entity.dart';
import '../repositories/product_repository.dart';

class GetProductsParams {
  final int page;
  final int pageSize;

  const GetProductsParams({required this.page, required this.pageSize});
}

class GetProductsUseCase {
  final ProductRepository _repository;

  GetProductsUseCase(this._repository);

  Future<List<ProductEntity>> call(GetProductsParams params) {
    return _repository.getProducts(page: params.page, pageSize: params.pageSize);
  }
}
