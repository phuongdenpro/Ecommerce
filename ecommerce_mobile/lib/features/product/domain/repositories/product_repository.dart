import '../entities/product_entity.dart';

abstract class ProductRepository {
  Future<List<ProductEntity>> getProducts({required int page, required int pageSize});

  Future<ProductEntity> getProductById(String id);

  Future<ProductEntity> createProduct({
    required String name,
    required String description,
    required int price,
  });

  Future<ProductEntity> updateProduct({
    required String id,
    required String name,
    required String description,
    required int price,
  });

  Future<void> deleteProduct(String id);

  Future<void> uploadProductImage({required String productId, required String imagePath});
}
