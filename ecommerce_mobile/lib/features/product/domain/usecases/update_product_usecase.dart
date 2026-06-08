import '../entities/product_entity.dart';
import '../repositories/product_repository.dart';

class UpdateProductParams {
  final int id;
  final String name;
  final String description;
  final int price;

  const UpdateProductParams({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
  });
}

class UpdateProductUseCase {
  final ProductRepository _repository;

  UpdateProductUseCase(this._repository);

  Future<ProductEntity> call(UpdateProductParams params) {
    return _repository.updateProduct(
      id: params.id,
      name: params.name,
      description: params.description,
      price: params.price,
    );
  }
}
