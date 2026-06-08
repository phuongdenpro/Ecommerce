import '../entities/product_entity.dart';
import '../repositories/product_repository.dart';

class CreateProductParams {
  final String name;
  final String description;
  final int price;

  const CreateProductParams({
    required this.name,
    required this.description,
    required this.price,
  });
}

class CreateProductUseCase {
  final ProductRepository _repository;

  CreateProductUseCase(this._repository);

  Future<ProductEntity> call(CreateProductParams params) {
    return _repository.createProduct(
      name: params.name,
      description: params.description,
      price: params.price,
    );
  }
}
