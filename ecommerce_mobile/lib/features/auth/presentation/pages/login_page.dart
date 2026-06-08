import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/app/router/route_paths.dart';
import 'package:flutter_restapi/core/theme/app_colors.dart';
import 'package:flutter_restapi/features/auth/presentation/providers/login_controller.dart';
import 'package:flutter_restapi/core/widgets/auth_layout.dart';
import 'package:flutter_restapi/core/widgets/custom_button.dart';
import 'package:flutter_restapi/core/widgets/custom_text_field.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _errorMessage = null);

    final error = await ref.read(loginControllerProvider.notifier).login(
          email: _emailController.text.trim(),
          password: _passwordController.text.trim(),
        );

    if (!mounted) return;

    if (error == null) {
      context.go(RoutePaths.home);
    } else {
      setState(() => _errorMessage = error);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(loginControllerProvider).isLoading;

    return AuthLayout(
      title: 'Đăng nhập',
      subtitle: 'Đăng nhập để quản lý sản phẩm và theo dõi đơn hàng.',
      child: Form(
        key: _formKey,
        child: Column(
          children: [
            CustomTextField(
              label: 'Email',
              hintText: 'Nhập email của bạn',
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              prefixIcon: Icons.email_outlined,
              validator: (value) {
                if (value == null || value.isEmpty) return 'Email không được để trống';
                if (!RegExp(r"^[\w-.]+@([\w-]+\.)+[\w-]{2,4}").hasMatch(value)) {
                  return 'Email không hợp lệ';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            CustomTextField(
              label: 'Mật khẩu',
              hintText: 'Nhập mật khẩu',
              controller: _passwordController,
              obscureText: true,
              prefixIcon: Icons.lock_outline,
              validator: (value) {
                if (value == null || value.isEmpty) return 'Mật khẩu không được để trống';
                if (value.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
                return null;
              },
            ),
            if (_errorMessage != null) ...[
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.error.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: AppColors.error, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: const TextStyle(color: AppColors.error, fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 24),
            CustomButton(label: 'Đăng nhập', isLoading: isLoading, onPressed: _submit),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Chưa có tài khoản?', style: Theme.of(context).textTheme.bodyMedium),
                TextButton(
                  onPressed: () => context.go(RoutePaths.register),
                  child: const Text('Đăng ký ngay'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
