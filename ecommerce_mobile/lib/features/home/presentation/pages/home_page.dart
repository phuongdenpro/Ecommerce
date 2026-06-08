import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/app/router/route_paths.dart';
import 'package:flutter_restapi/core/constants/app_constants.dart';
import 'package:flutter_restapi/core/theme/app_colors.dart';
import 'package:flutter_restapi/features/cart/services/cart_service.dart';
import 'package:flutter_restapi/features/home/presentation/widgets/home_category_chips.dart';
import 'package:flutter_restapi/features/home/presentation/widgets/home_promo_banner.dart';
import 'package:flutter_restapi/features/home/presentation/widgets/home_quick_actions.dart';
import 'package:flutter_restapi/features/home/presentation/widgets/home_search_bar.dart';
import 'package:flutter_restapi/features/product/presentation/providers/product_list_controller.dart';
import 'package:flutter_restapi/features/profile/presentation/providers/profile_controller.dart';
import 'package:flutter_restapi/core/widgets/error_widget.dart';
import 'package:flutter_restapi/core/widgets/loading_widget.dart';
import 'package:flutter_restapi/core/widgets/product_card.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  final CartService _cartService = CartService();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    _cartService.itemCountNotifier.addListener(_onCartUpdated);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    _cartService.itemCountNotifier.removeListener(_onCartUpdated);
    super.dispose();
  }

  void _onCartUpdated() {
    if (mounted) setState(() {});
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final position = _scrollController.position;
    if (position.pixels >= position.maxScrollExtent - 200) {
      ref.read(homeProductsProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(homeProductsProvider);
    final userAsync = ref.watch(currentUserProvider);
    final crossAxisCount = MediaQuery.sizeOf(context).width > 700 ? 4 : 2;

    return productsAsync.when(
      loading: () => const Scaffold(
        backgroundColor: AppColors.surface,
        body: LoadingWidget(message: 'Đang tải trang chủ...'),
      ),
      error: (error, _) => Scaffold(
        backgroundColor: AppColors.surface,
        body: AppErrorWidget(
          message: error.toString(),
          onRetry: () => ref.read(homeProductsProvider.notifier).refresh(),
        ),
      ),
      data: (state) {
        final products = state.items;
        final featured = products.take(6).toList();
        final userName = userAsync.valueOrNull?.fullName.split(' ').first;
        final isAdmin = userAsync.valueOrNull?.role.toLowerCase() == 'admin';

        return Scaffold(
          backgroundColor: AppColors.surface,
          body: RefreshIndicator(
            onRefresh: () async {
              await ref.read(homeProductsProvider.notifier).refresh();
              await ref.read(currentUserProvider.notifier).refresh();
            },
            edgeOffset: 120,
            child: CustomScrollView(
              controller: _scrollController,
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                SliverAppBar(
                  expandedHeight: 120,
                  pinned: true,
                  elevation: 0,
                  backgroundColor: AppColors.surface,
                  flexibleSpace: FlexibleSpaceBar(
                    background: Container(
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [Color(0xFFEFF6FF), AppColors.surface],
                        ),
                      ),
                      padding: const EdgeInsets.fromLTRB(20, 56, 20, 0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Xin chào, ${userName ?? 'bạn'} 👋',
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            AppConstants.appName,
                            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.w800,
                                ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(20, 0, 20, 16),
                    child: HomeSearchBar(),
                  ),
                ),
                SliverToBoxAdapter(child: HomePromoBanner(productCount: products.length)),
                const SliverToBoxAdapter(child: SizedBox(height: 20)),
                SliverToBoxAdapter(
                  child: HomeQuickActions(
                    isAdmin: isAdmin,
                    cartCount: _cartService.itemCountNotifier.value,
                  ),
                ),
                const SliverToBoxAdapter(child: SizedBox(height: 20)),
                const SliverToBoxAdapter(child: HomeCategoryChips()),
                const SliverToBoxAdapter(child: SizedBox(height: 24)),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Row(
                      children: [
                        Text(
                          'Nổi bật hôm nay',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(fontSize: 18),
                        ),
                        const Spacer(),
                        TextButton(
                          onPressed: () => context.go(RoutePaths.catalog),
                          child: const Text('Xem tất cả'),
                        ),
                      ],
                    ),
                  ),
                ),
                if (featured.isEmpty)
                  const SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.all(32),
                      child: Center(child: Text('Chưa có sản phẩm nổi bật')),
                    ),
                  )
                else
                  SliverToBoxAdapter(
                    child: SizedBox(
                      height: 260,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        itemCount: featured.length,
                        separatorBuilder: (_, _) => const SizedBox(width: 14),
                        itemBuilder: (context, index) {
                          final product = featured[index];
                          return SizedBox(
                            width: 170,
                            child: ProductCard(
                              product: product,
                              onTap: () => context.push(RoutePaths.product(product.id)),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 28, 20, 12),
                    child: Text(
                      'Tất cả sản phẩm',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(fontSize: 18),
                    ),
                  ),
                ),
                if (products.isEmpty)
                  const SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.all(32),
                      child: Center(child: Text('Chưa có sản phẩm')),
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    sliver: SliverGrid(
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: crossAxisCount,
                        childAspectRatio: 0.72,
                        mainAxisSpacing: 14,
                        crossAxisSpacing: 14,
                      ),
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          if (index >= products.length) {
                            return const Center(
                              child: Padding(
                                padding: EdgeInsets.all(24),
                                child: CircularProgressIndicator(strokeWidth: 2.5),
                              ),
                            );
                          }
                          final product = products[index];
                          return ProductCard(
                            product: product,
                            onTap: () => context.push(RoutePaths.product(product.id)),
                          );
                        },
                        childCount: products.length + (state.hasMore ? 1 : 0),
                      ),
                    ),
                  ),
                const SliverToBoxAdapter(child: SizedBox(height: 32)),
              ],
            ),
          ),
        );
      },
    );
  }
}
