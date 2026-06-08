import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import 'package:flutter_restapi/features/product/presentation/providers/product_list_controller.dart';
import 'package:flutter_restapi/features/product/presentation/providers/product_providers.dart';
import 'package:flutter_restapi/core/widgets/custom_button.dart';
import 'package:flutter_restapi/core/widgets/custom_text_field.dart';
import 'package:flutter_restapi/core/widgets/error_widget.dart';
import 'package:flutter_restapi/core/widgets/loading_widget.dart';

class ProductFormPage extends ConsumerStatefulWidget {
  final int? productId;

  const ProductFormPage({super.key, this.productId});

  @override
  ConsumerState<ProductFormPage> createState() => _ProductFormPageState();
}

class _ProductFormPageState extends ConsumerState<ProductFormPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  String? _errorMessage;
  File? _selectedImage;
  bool _initialized = false;

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  void _initFields() {
    if (_initialized || widget.productId == null) return;
    final product = ref.read(productDetailProvider(widget.productId!)).valueOrNull;
    if (product == null) return;
    _nameController.text = product.name;
    _descriptionController.text = product.description;
    _priceController.text = product.price.toString();
    _initialized = true;
  }

  Future<void> _pickImage() async {
    final result = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 75);
    if (result != null) {
      setState(() => _selectedImage = File(result.path));
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _errorMessage = null);

    final error = await ref.read(productFormControllerProvider.notifier).submit(
          productId: widget.productId,
          name: _nameController.text.trim(),
          description: _descriptionController.text.trim(),
          price: int.tryParse(_priceController.text.trim()) ?? 0,
          imagePath: _selectedImage?.path,
        );

    if (!mounted) return;

    if (error == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            widget.productId != null ? 'Cập nhật sản phẩm thành công' : 'Tạo sản phẩm thành công',
          ),
        ),
      );
      context.pop();
    } else {
      setState(() => _errorMessage = error);
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.productId != null ? 'Sửa sản phẩm' : 'Tạo sản phẩm';
    final isLoading = ref.watch(productFormControllerProvider).isLoading;

    if (widget.productId != null) {
      final productAsync = ref.watch(productDetailProvider(widget.productId!));
      return productAsync.when(
        loading: () => Scaffold(
          appBar: AppBar(title: Text(title)),
          body: const LoadingWidget(message: 'Đang tải dữ liệu...'),
        ),
        error: (error, _) => Scaffold(
          appBar: AppBar(title: Text(title)),
          body: AppErrorWidget(
            message: error.toString(),
            onRetry: () => ref.invalidate(productDetailProvider(widget.productId!)),
          ),
        ),
        data: (product) {
          _initFields();
          return _buildScaffold(title, product.imageUrl, isLoading);
        },
      );
    }

    return _buildScaffold(title, null, isLoading);
  }

  Widget _buildScaffold(String title, String? existingImageUrl, bool isLoading) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              GestureDetector(
                onTap: _pickImage,
                child: Container(
                  height: 190,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(18),
                    color: Colors.grey[100],
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: _selectedImage != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(18),
                          child: Image.file(_selectedImage!, fit: BoxFit.cover, width: double.infinity),
                        )
                      : existingImageUrl != null && existingImageUrl.isNotEmpty
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(18),
                              child: Image.network(
                                existingImageUrl,
                                fit: BoxFit.cover,
                                width: double.infinity,
                                errorBuilder: (_, _, _) => const Center(
                                  child: Icon(Icons.photo_library, size: 48, color: Colors.indigo),
                                ),
                              ),
                            )
                          : const Center(
                              child: Icon(Icons.photo_library, size: 48, color: Colors.indigo),
                            ),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Chạm để chọn ảnh sản phẩm',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.black54),
              ),
              const SizedBox(height: 24),
              Form(
                key: _formKey,
                child: Column(
                  children: [
                    CustomTextField(
                      label: 'Tên sản phẩm',
                      hintText: 'Nhập tên sản phẩm',
                      controller: _nameController,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Tên sản phẩm không được để trống';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    CustomTextField(
                      label: 'Mô tả',
                      hintText: 'Nhập mô tả sản phẩm',
                      controller: _descriptionController,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Mô tả không được để trống';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    CustomTextField(
                      label: 'Giá',
                      hintText: 'Nhập giá sản phẩm',
                      controller: _priceController,
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || value.isEmpty) return 'Giá không được để trống';
                        final price = int.tryParse(value);
                        if (price == null || price <= 0) return 'Giá không hợp lệ';
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),
                    if (_errorMessage != null) ...[
                      Text(_errorMessage!, style: const TextStyle(color: Colors.redAccent)),
                      const SizedBox(height: 12),
                    ],
                    CustomButton(
                      label: widget.productId != null ? 'Cập nhật' : 'Tạo sản phẩm',
                      isLoading: isLoading,
                      onPressed: _submit,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
