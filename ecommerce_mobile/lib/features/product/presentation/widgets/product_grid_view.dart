import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import 'package:flutter_restapi/features/product/domain/entities/product_entity.dart';
import 'package:flutter_restapi/core/widgets/empty_state.dart';
import 'package:flutter_restapi/core/widgets/product_card.dart';

typedef ProductPageLoader = Future<List<ProductEntity>> Function({
  required int page,
  required int pageSize,
});

typedef ProductTapCallback = void Function(ProductEntity product);

class ProductGridView extends StatefulWidget {
  final List<ProductEntity> products;
  final ProductTapCallback onTap;
  final ProductPageLoader loadPage;
  final int pageSize;
  final bool shrinkWrap;
  final String? searchQuery;

  const ProductGridView({
    super.key,
    required this.products,
    required this.onTap,
    required this.loadPage,
    this.pageSize = 10,
    this.shrinkWrap = true,
    this.searchQuery,
  });

  @override
  State<ProductGridView> createState() => _ProductGridViewState();
}

class _ProductGridViewState extends State<ProductGridView> {
  late List<ProductEntity> _products;
  late int _page;
  bool _isLoadingMore = false;
  bool _hasMore = true;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _resetProducts();
    _scrollController.addListener(_onScroll);
  }

  @override
  void didUpdateWidget(covariant ProductGridView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!listEquals(widget.products, oldWidget.products) ||
        widget.searchQuery != oldWidget.searchQuery) {
      _resetProducts();
    }
  }

  void _resetProducts() {
    _products = _filter(widget.products);
    _page = widget.products.isEmpty ? 1 : 2;
    _hasMore = widget.products.length == widget.pageSize;
  }

  List<ProductEntity> _filter(List<ProductEntity> source) {
    final query = widget.searchQuery?.trim().toLowerCase();
    if (query == null || query.isEmpty) return List<ProductEntity>.from(source);
    return source
        .where(
          (p) =>
              p.name.toLowerCase().contains(query) ||
              p.description.toLowerCase().contains(query),
        )
        .toList();
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 100) {
      _loadMoreProducts();
    }
  }

  Future<void> _loadMoreProducts() async {
    if (_isLoadingMore || !_hasMore || widget.searchQuery != null) return;

    setState(() => _isLoadingMore = true);

    try {
      final newProducts =
          await widget.loadPage(page: _page, pageSize: widget.pageSize);
      if (!mounted) return;
      setState(() {
        _products.addAll(newProducts);
        _page++;
        _hasMore = newProducts.length == widget.pageSize;
      });
    } catch (_) {
      // giữ danh sách hiện tại
    } finally {
      if (mounted) setState(() => _isLoadingMore = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_products.isEmpty) {
      return const EmptyState(
        icon: Icons.inventory_2_outlined,
        title: 'Không tìm thấy sản phẩm',
        subtitle: 'Thử từ khóa khác hoặc xem danh mục đầy đủ.',
      );
    }

    final crossAxisCount = MediaQuery.sizeOf(context).width > 700 ? 3 : 2;

    return GridView.builder(
      controller: widget.shrinkWrap ? null : _scrollController,
      shrinkWrap: widget.shrinkWrap,
      physics: widget.shrinkWrap
          ? const NeverScrollableScrollPhysics()
          : const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        childAspectRatio: 0.72,
        mainAxisSpacing: 14,
        crossAxisSpacing: 14,
      ),
      itemCount: _products.length + (_hasMore && widget.searchQuery == null ? 1 : 0),
      itemBuilder: (context, index) {
        if (index >= _products.length) {
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: 20),
            child: Center(child: CircularProgressIndicator(strokeWidth: 2.5)),
          );
        }
        final product = _products[index];
        return ProductCard(
          product: product,
          onTap: () => widget.onTap(product),
        );
      },
    );
  }
}
