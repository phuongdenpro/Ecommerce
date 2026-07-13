import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/app/router/route_paths.dart';
import 'package:flutter_restapi/core/constants/payment_constants.dart';
import 'package:flutter_restapi/core/theme/app_colors.dart';
import 'package:flutter_restapi/core/utils/formatters.dart';
import 'package:flutter_restapi/core/widgets/custom_button.dart';
import 'package:flutter_restapi/core/widgets/custom_text_field.dart';
import 'package:flutter_restapi/core/widgets/loading_widget.dart';
import 'package:flutter_restapi/features/cart/domain/entities/cart_entity.dart';
import 'package:flutter_restapi/features/cart/presentation/providers/cart_providers.dart';
import 'package:flutter_restapi/features/checkout/checkout_args.dart';
import 'package:flutter_restapi/features/orders/presentation/providers/order_providers.dart';
import 'package:flutter_restapi/features/payment/domain/entities/payment_entity.dart';
import 'package:flutter_restapi/features/payment/presentation/providers/payment_providers.dart';

class CheckoutPage extends ConsumerStatefulWidget {
  const CheckoutPage({super.key});

  @override
  ConsumerState<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends ConsumerState<CheckoutPage> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _addressController;
  late TextEditingController _notesController;
  PaymentMethodType _selectedPaymentMethod = PaymentMethodType.cod;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _phoneController = TextEditingController();
    _addressController = TextEditingController();
    _notesController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  String? _validateName(String? value) {
    if (value == null || value.isEmpty) return 'Vui lòng nhập họ tên';
    if (value.length < 3) return 'Họ tên phải có ít nhất 3 ký tự';
    return null;
  }

  String? _validatePhone(String? value) {
    if (value == null || value.isEmpty) return 'Vui lòng nhập số điện thoại';
    if (!RegExp(r'^0\d{9}$').hasMatch(value)) {
      return 'Số điện thoại không hợp lệ (phải là 10 số bắt đầu bằng 0)';
    }
    return null;
  }

  String? _validateAddress(String? value) {
    if (value == null || value.isEmpty) return 'Vui lòng nhập địa chỉ';
    if (value.length < 5) return 'Địa chỉ phải có ít nhất 5 ký tự';
    return null;
  }

  String _buildShippingAddress() {
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();
    final address = _addressController.text.trim();
    return '$name, $phone, $address';
  }

  Future<void> _submitOrder() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      final cart = await ref.read(cartProvider.future);
      if (cart.items.isEmpty) {
        _showError('Giỏ hàng trống. Vui lòng thêm sản phẩm trước');
        return;
      }

      final order = await ref.read(createOrderControllerProvider.notifier).createOrder(
            shippingAddress: _buildShippingAddress(),
            note: _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
            shippingFee: PaymentConstants.defaultShippingFee,
          );

      if (order == null) return;

      await ref.read(paymentControllerProvider.notifier).processPayment(
            orderId: order.id,
            method: _selectedPaymentMethod,
          );

      if (!mounted) return;

      switch (_selectedPaymentMethod) {
        case PaymentMethodType.bankTransfer:
          context.go(
            RoutePaths.bankTransfer,
            extra: BankTransferArgs(
              orderId: order.id,
              orderCode: order.orderCode,
              amount: order.finalAmount,
            ),
          );
        case PaymentMethodType.cod:
        case PaymentMethodType.onlinePayment:
          context.go(
            RoutePaths.orderSuccess,
            extra: OrderSuccessArgs(
              orderId: order.id,
              orderCode: order.orderCode,
            ),
          );
      }
    } catch (e) {
      if (!mounted) return;
      _showError(e.toString());
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: AppColors.error),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cartAsync = ref.watch(cartProvider);

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('Thanh toán'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: cartAsync.when(
        loading: () => const LoadingWidget(message: 'Đang tải giỏ hàng...'),
        error: (_, __) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: AppColors.error),
              const SizedBox(height: 16),
              const Text('Không thể tải giỏ hàng'),
              const SizedBox(height: 16),
              CustomButton(label: 'Quay lại', onPressed: () => context.pop()),
            ],
          ),
        ),
        data: (cart) => cart.items.isEmpty
            ? _buildEmptyCart()
            : SingleChildScrollView(
                child: Column(
                  children: [
                    _buildOrderSummary(cart),
                    const SizedBox(height: 20),
                    _buildDeliveryForm(),
                    const SizedBox(height: 20),
                    _buildPaymentMethodSection(),
                    const SizedBox(height: 24),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: CustomButton(
                        label: _isSubmitting ? 'Đang xử lý...' : 'Đặt hàng',
                        enabled: !_isSubmitting,
                        onPressed: _submitOrder,
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildEmptyCart() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.shopping_cart_outlined, size: 64, color: AppColors.textSecondary),
          const SizedBox(height: 16),
          const Text('Giỏ hàng trống'),
          const SizedBox(height: 16),
          CustomButton(
            label: 'Tiếp tục mua sắm',
            onPressed: () => context.go(RoutePaths.catalog),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderSummary(CartEntity cart) {
    final totalWithShipping = cart.subTotal + PaymentConstants.defaultShippingFee;

    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: AppColors.cardGradient,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border, width: 0.5),
        boxShadow: const [AppColors.softShadow],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Thông tin đơn hàng', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),
          ...cart.items.map((item) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item.productName, maxLines: 1, overflow: TextOverflow.ellipsis),
                        Text('x${item.quantity}', style: Theme.of(context).textTheme.bodySmall),
                      ],
                    ),
                  ),
                  Text(formatCurrency(item.subTotal), style: Theme.of(context).textTheme.titleSmall),
                ],
              ),
            );
          }),
          const Divider(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Phí vận chuyển', style: Theme.of(context).textTheme.bodyMedium),
              Text(formatCurrency(PaymentConstants.defaultShippingFee)),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Tổng cộng', style: Theme.of(context).textTheme.titleMedium),
              Text(
                formatCurrency(totalWithShipping),
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryForm() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: AppColors.cardGradient,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border, width: 0.5),
        boxShadow: const [AppColors.softShadow],
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Thông tin giao hàng', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 16),
            CustomTextField(
              label: 'Họ và tên',
              controller: _nameController,
              hintText: 'Nhập họ và tên',
              validator: _validateName,
              prefixIcon: Icons.person_outline,
            ),
            const SizedBox(height: 12),
            CustomTextField(
              label: 'Số điện thoại',
              controller: _phoneController,
              hintText: '0xxxxxxxxx',
              validator: _validatePhone,
              prefixIcon: Icons.phone_outlined,
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 12),
            CustomTextField(
              label: 'Địa chỉ giao hàng',
              controller: _addressController,
              hintText: 'Nhập địa chỉ đầy đủ',
              validator: _validateAddress,
              prefixIcon: Icons.location_on_outlined,
            ),
            const SizedBox(height: 12),
            CustomTextField(
              label: 'Ghi chú (tuỳ chọn)',
              controller: _notesController,
              hintText: 'Thêm ghi chú cho đơn hàng',
              prefixIcon: Icons.note_outlined,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethodSection() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: AppColors.cardGradient,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border, width: 0.5),
        boxShadow: const [AppColors.softShadow],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Phương thức thanh toán', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),
          _buildPaymentOption(
            PaymentMethodType.cod,
            PaymentMethodType.cod.label,
            'Bạn sẽ thanh toán tiền khi nhận được đơn hàng',
          ),
          const SizedBox(height: 12),
          _buildPaymentOption(
            PaymentMethodType.bankTransfer,
            PaymentMethodType.bankTransfer.label,
            'Chuyển khoản trước, chúng tôi sẽ xác nhận và giao hàng',
          ),
          const SizedBox(height: 12),
          _buildPaymentOption(
            PaymentMethodType.onlinePayment,
            PaymentMethodType.onlinePayment.label,
            'Thanh toán online (mock gateway — tự động xác nhận)',
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentOption(PaymentMethodType method, String title, String subtitle) {
    return InkWell(
      onTap: () => setState(() => _selectedPaymentMethod = method),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: _selectedPaymentMethod == method ? AppColors.primary.withValues(alpha: 0.05) : AppColors.card,
          border: Border.all(
            color: _selectedPaymentMethod == method ? AppColors.primary : AppColors.border,
            width: _selectedPaymentMethod == method ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Radio<PaymentMethodType>(
              value: method,
              groupValue: _selectedPaymentMethod,
              onChanged: (value) {
                if (value != null) setState(() => _selectedPaymentMethod = value);
              },
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: Theme.of(context).textTheme.titleSmall),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodySmall,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
