import '../entities/product_entity.dart';
import '../repositories/product_repository.dart';

class GetProductDetailUseCase {
  final ProductRepository _repository;

  GetProductDetailUseCase(this._repository);

  Future<ProductEntity> call(int id) => _repository.getProductById(id);
}
