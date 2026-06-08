import '../entities/product_entity.dart';

abstract class ProductRepository {
  Future<List<ProductEntity>> getProducts({required int page, required int pageSize});

  Future<ProductEntity> getProductById(int id);

  Future<ProductEntity> createProduct({
    required String name,
    required String description,
    required int price,
  });

  Future<ProductEntity> updateProduct({
    required int id,
    required String name,
    required String description,
    required int price,
  });

  Future<void> deleteProduct(int id);

  Future<void> uploadProductImage({required int productId, required String imagePath});
}
