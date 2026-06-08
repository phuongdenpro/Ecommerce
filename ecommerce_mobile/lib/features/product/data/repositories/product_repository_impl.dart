import '../../domain/entities/product_entity.dart';
import '../../domain/repositories/product_repository.dart';
import '../datasources/product_remote_datasource.dart';

class ProductRepositoryImpl implements ProductRepository {
  final ProductRemoteDataSource _remote;

  ProductRepositoryImpl(this._remote);

  @override
  Future<List<ProductEntity>> getProducts({
    required int page,
    required int pageSize,
  }) async {
    final models = await _remote.getProducts(page: page, pageSize: pageSize);
    return models.map((m) => m.toEntity()).toList();
  }

  @override
  Future<ProductEntity> getProductById(int id) async {
    final model = await _remote.getProductById(id);
    return model.toEntity();
  }

  @override
  Future<ProductEntity> createProduct({
    required String name,
    required String description,
    required int price,
  }) async {
    final model = await _remote.createProduct(
      name: name,
      description: description,
      price: price,
    );
    return model.toEntity();
  }

  @override
  Future<ProductEntity> updateProduct({
    required int id,
    required String name,
    required String description,
    required int price,
  }) async {
    final model = await _remote.updateProduct(
      id: id,
      name: name,
      description: description,
      price: price,
    );
    return model.toEntity();
  }

  @override
  Future<void> deleteProduct(int id) => _remote.deleteProduct(id);

  @override
  Future<void> uploadProductImage({
    required int productId,
    required String imagePath,
  }) {
    return _remote.uploadProductImage(productId: productId, imagePath: imagePath);
  }
}
