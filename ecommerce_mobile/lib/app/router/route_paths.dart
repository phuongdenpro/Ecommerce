abstract final class RoutePaths {
  static const login = '/login';
  static const register = '/register';

  static const home = '/home';
  static const catalog = '/catalog';
  static const products = '/products';
  static const cart = '/cart';
  static const checkout = '/checkout';
  static const orderSuccess = '/order-success';
  static const bankTransfer = '/payment/bank-transfer';
  static const orders = '/orders';
  static const account = '/account';

  static const productDetail = '/product/:id';
  static const productsDetail = '/products/:id';
  static const manage = '/manage';
  static const manageForm = '/manage-form';
  static const manageFormEdit = '/manage-form/:id';
  static const profileEdit = '/profile/edit';
  static const changePassword = '/profile/change-password';

  static String product(String id) => '/product/$id';
  static String productsDetailPath(String id) => '/products/$id';
  static String orderDetail(String id) => '/orders/$id';
}
