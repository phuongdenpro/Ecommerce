import '../repositories/product_repository.dart';

class UploadProductImageParams {
  final int productId;
  final String imagePath;

  const UploadProductImageParams({required this.productId, required this.imagePath});
}

class UploadProductImageUseCase {
  final ProductRepository _repository;

  UploadProductImageUseCase(this._repository);

  Future<void> call(UploadProductImageParams params) {
    return _repository.uploadProductImage(
      productId: params.productId,
      imagePath: params.imagePath,
    );
  }
}
