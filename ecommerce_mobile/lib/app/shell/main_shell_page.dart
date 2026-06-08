import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/features/cart/services/cart_service.dart';
import 'widgets/app_bottom_navigation.dart';

class MainShellPage extends StatefulWidget {
  final StatefulNavigationShell navigationShell;

  const MainShellPage({super.key, required this.navigationShell});

  @override
  State<MainShellPage> createState() => _MainShellPageState();
}

class _MainShellPageState extends State<MainShellPage> {
  final CartService _cartService = CartService();

  @override
  void initState() {
    super.initState();
    _cartService.itemCountNotifier.addListener(_onCartChanged);
  }

  @override
  void dispose() {
    _cartService.itemCountNotifier.removeListener(_onCartChanged);
    super.dispose();
  }

  void _onCartChanged() {
    if (mounted) setState(() {});
  }

  void _onTabTapped(int index) {
    widget.navigationShell.goBranch(
      index,
      initialLocation: index == widget.navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.navigationShell,
      bottomNavigationBar: AppBottomNavigation(
        currentIndex: widget.navigationShell.currentIndex,
        onTap: _onTabTapped,
        cartBadge: _cartService.itemCountNotifier.value,
      ),
    );
  }
}
