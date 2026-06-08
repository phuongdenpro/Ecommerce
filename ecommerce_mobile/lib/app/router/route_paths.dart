abstract final class RoutePaths {
  static const login = '/login';
  static const register = '/register';

  static const home = '/home';
  static const catalog = '/catalog';
  static const cart = '/cart';
  static const orders = '/orders';
  static const account = '/account';

  static const productDetail = '/product/:id';
  static const manage = '/manage';
  static const manageForm = '/manage-form';
  static const manageFormEdit = '/manage-form/:id';
  static const profileEdit = '/profile/edit';
  static const changePassword = '/profile/change-password';

  static String product(int id) => '/product/$id';
}
