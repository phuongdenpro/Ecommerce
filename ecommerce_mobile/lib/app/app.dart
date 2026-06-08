import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/app/router/app_router.dart';
import 'package:flutter_restapi/core/constants/app_constants.dart';
import 'package:flutter_restapi/core/providers/core_providers.dart';
import 'package:flutter_restapi/core/theme/app_theme.dart';

class App extends ConsumerStatefulWidget {
  const App({super.key});

  @override
  ConsumerState<App> createState() => _AppState();
}

class _AppState extends ConsumerState<App> {
  GoRouter? _router;
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    await ref.read(tokenStorageProvider).init();
    _router = AppRouter.createRouter(ref.read(tokenStorageProvider));
    if (mounted) setState(() => _initialized = true);
  }

  @override
  Widget build(BuildContext context) {
    if (!_initialized || _router == null) {
      return MaterialApp(
        theme: AppTheme.light,
        home: const Scaffold(
          body: Center(child: CircularProgressIndicator()),
        ),
      );
    }

    final router = _router!;

    return MaterialApp.router(
      title: AppConstants.appName,
      theme: AppTheme.light,
      debugShowCheckedModeBanner: false,
      routeInformationParser: router.routeInformationParser,
      routerDelegate: router.routerDelegate,
      routeInformationProvider: router.routeInformationProvider,
    );
  }
}
