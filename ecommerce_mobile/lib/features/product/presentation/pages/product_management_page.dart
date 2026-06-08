import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/app/router/route_paths.dart';
import 'package:flutter_restapi/features/product/presentation/providers/product_list_controller.dart';
import 'package:flutter_restapi/core/widgets/error_widget.dart';
import 'package:flutter_restapi/core/widgets/loading_widget.dart';

class ProductManagementPage extends ConsumerStatefulWidget {
  const ProductManagementPage({super.key});

  @override
  ConsumerState<ProductManagementPage> createState() => _ProductManagementPageState();
}

class _ProductManagementPageState extends ConsumerState<ProductManagementPage> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 100) {
      ref.read(productManagementControllerProvider.notifier).loadMore();
    }
  }

  Future<void> _deleteProduct(int id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xóa sản phẩm'),
        content: const Text('Bạn có chắc muốn xóa sản phẩm này không?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Hủy')),
          ElevatedButton(onPressed: () => Navigator.pop(context, true), child: const Text('Xóa')),
        ],
      ),
    );

    if (confirmed != true || !mounted) return;

    final error = await ref.read(productManagementControllerProvider.notifier).deleteProduct(id);
    if (!mounted) return;

    if (error == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã xóa sản phẩm thành công')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final stateAsync = ref.watch(productManagementControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Quản lý sản phẩm'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go(RoutePaths.home);
            }
          },
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        icon: const Icon(Icons.add),
        label: const Text('Thêm mới'),
        onPressed: () => context.push(RoutePaths.manageForm).then((_) {
          ref.read(productManagementControllerProvider.notifier).refresh();
        }),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(productManagementControllerProvider.notifier).refresh(),
        child: stateAsync.when(
          loading: () => const LoadingWidget(message: 'Đang tải danh sách quản lý...'),
          error: (error, _) => AppErrorWidget(
            message: error.toString(),
            onRetry: () => ref.read(productManagementControllerProvider.notifier).refresh(),
          ),
          data: (state) {
            if (state.items.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  SizedBox(
                    height: MediaQuery.sizeOf(context).height * 0.5,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text('Chưa có sản phẩm nào.', style: TextStyle(fontSize: 16, color: Colors.black54)),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () => context.push(RoutePaths.manageForm),
                          child: const Text('Tạo sản phẩm mới'),
                        ),
                      ],
                    ),
                  ),
                ],
              );
            }

            return ListView.separated(
              controller: _scrollController,
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
              itemCount: state.items.length + (state.hasMore ? 1 : 0),
              separatorBuilder: (_, _) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                if (index >= state.items.length) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 20),
                    child: Center(child: CircularProgressIndicator()),
                  );
                }

                final product = state.items[index];
                return Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: ListTile(
                    leading: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: product.imageUrl != null && product.imageUrl!.isNotEmpty
                          ? Image.network(
                              product.imageUrl!,
                              width: 60,
                              height: 60,
                              fit: BoxFit.cover,
                              errorBuilder: (_, _, _) => _thumbPlaceholder(),
                            )
                          : _thumbPlaceholder(),
                    ),
                    title: Text(product.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: Text('${product.price} đ'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit, color: Colors.indigo),
                          onPressed: () => context
                              .push('${RoutePaths.manageForm}/${product.id}')
                              .then((_) {
                            ref.read(productManagementControllerProvider.notifier).refresh();
                          }),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete, color: Colors.redAccent),
                          onPressed: () => _deleteProduct(product.id),
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }

  Widget _thumbPlaceholder() {
    return Container(
      width: 60,
      height: 60,
      color: Colors.grey[200],
      child: const Icon(Icons.image_not_supported, color: Colors.black38),
    );
  }
}
