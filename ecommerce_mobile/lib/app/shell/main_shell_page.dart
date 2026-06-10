import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/features/cart/presentation/providers/cart_providers.dart';
import 'widgets/app_bottom_navigation.dart';

class MainShellPage extends ConsumerStatefulWidget {
  final StatefulNavigationShell navigationShell;

  const MainShellPage({super.key, required this.navigationShell});

  @override
  ConsumerState<MainShellPage> createState() => _MainShellPageState();
}

class _MainShellPageState extends ConsumerState<MainShellPage> {
  void _onTabTapped(int index) {
    widget.navigationShell.goBranch(
      index,
      initialLocation: index == widget.navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    final cartBadge = ref.watch(cartItemCountProvider);

    return Scaffold(
      body: widget.navigationShell,
      bottomNavigationBar: AppBottomNavigation(
        currentIndex: widget.navigationShell.currentIndex,
        onTap: _onTabTapped,
        cartBadge: cartBadge,
      ),
    );
  }
}
