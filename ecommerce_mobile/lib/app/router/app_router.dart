import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/app/shell/main_shell_page.dart';
import 'package:flutter_restapi/core/storage/token_storage.dart';
import 'package:flutter_restapi/features/auth/presentation/pages/login_page.dart';
import 'package:flutter_restapi/features/auth/presentation/pages/register_page.dart';
import 'package:flutter_restapi/features/cart/presentation/pages/cart_page.dart';
import 'package:flutter_restapi/features/catalog/presentation/pages/catalog_page.dart';
import 'package:flutter_restapi/features/home/presentation/pages/home_page.dart';
import 'package:flutter_restapi/features/orders/presentation/pages/orders_page.dart';
import 'package:flutter_restapi/features/product/presentation/pages/product_detail_page.dart';
import 'package:flutter_restapi/features/product/presentation/pages/product_form_page.dart';
import 'package:flutter_restapi/features/product/presentation/pages/product_management_page.dart';
import 'package:flutter_restapi/features/profile/presentation/pages/edit_profile_page.dart';
import 'package:flutter_restapi/features/profile/presentation/pages/profile_page.dart';
import 'package:flutter_restapi/features/settings/presentation/pages/change_password_page.dart';
import 'route_paths.dart';

class AppRouter {
  static GoRouter createRouter(TokenStorage tokenStorage) {
    final rootNavigatorKey = GlobalKey<NavigatorState>();

    return GoRouter(
      navigatorKey: rootNavigatorKey,
      initialLocation: RoutePaths.home,
      refreshListenable: tokenStorage.authNotifier,
      debugLogDiagnostics: false,
      redirect: (context, state) {
        final signedIn = tokenStorage.authNotifier.value;
        final location = state.matchedLocation;
        final isAuthRoute = location == RoutePaths.login || location == RoutePaths.register;

        if (!signedIn && !isAuthRoute) {
          return RoutePaths.login;
        }
        if (signedIn && isAuthRoute) {
          return RoutePaths.home;
        }
        return null;
      },
      routes: [
        GoRoute(
          path: RoutePaths.login,
          builder: (context, state) => const LoginPage(),
        ),
        GoRoute(
          path: RoutePaths.register,
          builder: (context, state) => const RegisterPage(),
        ),
        StatefulShellRoute.indexedStack(
          builder: (context, state, navigationShell) {
            return MainShellPage(navigationShell: navigationShell);
          },
          branches: [
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: RoutePaths.home,
                  pageBuilder: (context, state) => const NoTransitionPage(child: HomePage()),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: RoutePaths.catalog,
                  pageBuilder: (context, state) => const NoTransitionPage(child: CatalogPage()),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: RoutePaths.cart,
                  pageBuilder: (context, state) => const NoTransitionPage(child: CartPage()),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: RoutePaths.orders,
                  pageBuilder: (context, state) => const NoTransitionPage(child: OrdersPage()),
                ),
              ],
            ),
            StatefulShellBranch(
              routes: [
                GoRoute(
                  path: RoutePaths.account,
                  pageBuilder: (context, state) => const NoTransitionPage(child: ProfilePage()),
                ),
              ],
            ),
          ],
        ),
        GoRoute(
          path: RoutePaths.productDetail,
          parentNavigatorKey: rootNavigatorKey,
          builder: (context, state) {
            final id = int.tryParse(state.pathParameters['id'] ?? '0') ?? 0;
            return ProductDetailPage(productId: id);
          },
        ),
        GoRoute(
          path: RoutePaths.manage,
          parentNavigatorKey: rootNavigatorKey,
          builder: (context, state) => const ProductManagementPage(),
        ),
        GoRoute(
          path: RoutePaths.manageForm,
          parentNavigatorKey: rootNavigatorKey,
          builder: (context, state) => const ProductFormPage(),
        ),
        GoRoute(
          path: RoutePaths.manageFormEdit,
          parentNavigatorKey: rootNavigatorKey,
          builder: (context, state) {
            final id = int.tryParse(state.pathParameters['id'] ?? '0') ?? 0;
            return ProductFormPage(productId: id);
          },
        ),
        GoRoute(
          path: RoutePaths.profileEdit,
          parentNavigatorKey: rootNavigatorKey,
          builder: (context, state) => const EditProfilePage(),
        ),
        GoRoute(
          path: RoutePaths.changePassword,
          parentNavigatorKey: rootNavigatorKey,
          builder: (context, state) => const ChangePasswordPage(),
        ),
      ],
    );
  }
}
