import '../repositories/product_repository.dart';

class DeleteProductUseCase {
  final ProductRepository _repository;

  DeleteProductUseCase(this._repository);

  Future<void> call(int id) => _repository.deleteProduct(id);
}
