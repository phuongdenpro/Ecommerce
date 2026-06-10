import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/app/router/route_paths.dart';
import 'package:flutter_restapi/core/theme/app_colors.dart';
import 'package:flutter_restapi/core/utils/formatters.dart';
import 'package:flutter_restapi/core/widgets/custom_button.dart';
import 'package:flutter_restapi/core/widgets/custom_text_field.dart';
import 'package:flutter_restapi/core/widgets/loading_widget.dart';
import 'package:flutter_restapi/features/cart/presentation/providers/cart_providers.dart';
import 'package:flutter_restapi/features/cart/services/cart_service.dart';
import 'package:flutter_restapi/features/orders/presentation/providers/order_providers.dart';

enum PaymentMethod { cod, bank_transfer }

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
  PaymentMethod _selectedPaymentMethod = PaymentMethod.cod;
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

  Future<void> _submitOrder() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      // Get cart items from local cart service
      final cartService = CartService();
      final cartItems = cartService.items;

      if (cartItems.isEmpty) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Giỏ hàng trống. Vui lòng thêm sản phẩm trước'),
            backgroundColor: AppColors.error,
          ),
        );
        setState(() => _isSubmitting = false);
        return;
      }

      // Prepare order items
      final orderItems = cartItems
          .map((item) => (productId: item.product.id, quantity: item.quantity))
          .toList();

      // Create order
      await ref.read(createOrderControllerProvider.notifier).createOrder(
            items: orderItems,
            recipientName: _nameController.text.trim(),
            recipientPhone: _phoneController.text.trim(),
            shippingAddress: _addressController.text.trim(),
            paymentMethod: _selectedPaymentMethod == PaymentMethod.cod ? 'COD' : 'BankTransfer',
            notes: _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
          );

      // Clear cart after successful order
      cartService.clearCart();

      if (!mounted) return;

      // Navigate to success page
      context.go(RoutePaths.orderSuccess);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Lỗi: ${e.toString()}'),
          backgroundColor: AppColors.error,
        ),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
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
              CustomButton(
                label: 'Quay lại',
                onPressed: () => context.pop(),
              ),
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

  Widget _buildOrderSummary(cart) {
    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Thông tin đơn hàng', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),
          ...cart.items.map<Widget>((item) {
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
                  Text(formatCurrency(item.totalPrice), style: Theme.of(context).textTheme.titleSmall),
                ],
              ),
            );
          }).toList(),
          const Divider(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Tổng cộng', style: Theme.of(context).textTheme.titleMedium),
              Text(
                formatCurrency(cart.totalAmount),
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
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
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
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Phương thức thanh toán', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),
          _buildPaymentOption(
            PaymentMethod.cod,
            'Thanh toán khi nhận hàng (COD)',
            'Bạn sẽ thanh toán tiền khi nhận được đơn hàng',
          ),
          const SizedBox(height: 12),
          _buildPaymentOption(
            PaymentMethod.bank_transfer,
            'Chuyển khoản ngân hàng',
            'Chuyển khoản trước, chúng tôi sẽ xác nhận và giao hàng',
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentOption(PaymentMethod method, String title, String subtitle) {
    return InkWell(
      onTap: () => setState(() => _selectedPaymentMethod = method),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          border: Border.all(
            color: _selectedPaymentMethod == method
                ? AppColors.primary
                : AppColors.border,
            width: _selectedPaymentMethod == method ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(8),
          color: _selectedPaymentMethod == method
              ? AppColors.primary.withValues(alpha: 0.05)
              : null,
        ),
        child: Row(
          children: [
            Radio<PaymentMethod>(
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
