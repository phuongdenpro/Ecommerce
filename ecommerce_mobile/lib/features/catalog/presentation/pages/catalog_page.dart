import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/app/router/route_paths.dart';
import 'package:flutter_restapi/core/constants/app_constants.dart';
import 'package:flutter_restapi/core/theme/app_colors.dart';
import 'package:flutter_restapi/features/product/domain/usecases/get_products_usecase.dart';
import 'package:flutter_restapi/features/product/presentation/providers/product_list_controller.dart';
import 'package:flutter_restapi/features/product/presentation/providers/product_providers.dart';
import 'package:flutter_restapi/features/product/presentation/widgets/product_grid_view.dart';
import 'package:flutter_restapi/core/widgets/error_widget.dart';
import 'package:flutter_restapi/core/widgets/loading_widget.dart';

class CatalogPage extends ConsumerStatefulWidget {
  const CatalogPage({super.key});

  @override
  ConsumerState<CatalogPage> createState() => _CatalogPageState();
}

class _CatalogPageState extends ConsumerState<CatalogPage> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      setState(() => _searchQuery = _searchController.text);
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(catalogProductsProvider);

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Danh mục', style: Theme.of(context).textTheme.headlineSmall),
                  const SizedBox(height: 4),
                  Text('Khám phá toàn bộ sản phẩm', style: Theme.of(context).textTheme.bodyMedium),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'Tìm theo tên, mô tả...',
                  prefixIcon: const Icon(Icons.search_rounded),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.close_rounded),
                          onPressed: () {
                            _searchController.clear();
                            setState(() => _searchQuery = '');
                          },
                        )
                      : null,
                ),
              ),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: RefreshIndicator(
                onRefresh: () => ref.read(catalogProductsProvider.notifier).refresh(),
                child: productsAsync.when(
                  loading: () => const LoadingWidget(message: 'Đang tải danh mục...'),
                  error: (error, _) => ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                      SizedBox(
                        height: MediaQuery.sizeOf(context).height * 0.5,
                        child: AppErrorWidget(
                          message: error.toString(),
                          onRetry: () => ref.read(catalogProductsProvider.notifier).refresh(),
                        ),
                      ),
                    ],
                  ),
                  data: (state) {
                    return ProductGridView(
                      products: state.items,
                      searchQuery: _searchQuery,
                      onTap: (p) => context.push(RoutePaths.product(p.id)),
                      loadPage: ({required page, required pageSize}) {
                        return ref.read(getProductsUseCaseProvider).call(
                              GetProductsParams(page: page, pageSize: pageSize),
                            );
                      },
                      pageSize: AppConstants.defaultPageSize,
                      shrinkWrap: false,
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
