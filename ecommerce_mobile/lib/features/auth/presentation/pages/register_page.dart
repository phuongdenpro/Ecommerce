import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/app/router/route_paths.dart';
import 'package:flutter_restapi/core/theme/app_colors.dart';
import 'package:flutter_restapi/features/auth/presentation/providers/register_controller.dart';
import 'package:flutter_restapi/core/widgets/auth_layout.dart';
import 'package:flutter_restapi/core/widgets/custom_button.dart';
import 'package:flutter_restapi/core/widgets/custom_text_field.dart';

class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String? _errorMessage;

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _errorMessage = null);

    final error = await ref.read(registerControllerProvider.notifier).register(
          fullName: _fullNameController.text.trim(),
          email: _emailController.text.trim(),
          password: _passwordController.text.trim(),
        );

    if (!mounted) return;

    if (error == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đăng ký thành công. Vui lòng đăng nhập.')),
      );
      context.go(RoutePaths.login);
    } else {
      setState(() => _errorMessage = error);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(registerControllerProvider).isLoading;

    return AuthLayout(
      title: 'Đăng ký',
      subtitle: 'Tạo tài khoản mới để bắt đầu mua sắm và quản lý.',
      child: Form(
        key: _formKey,
        child: Column(
          children: [
            CustomTextField(
              label: 'Họ và tên',
              hintText: 'Nhập họ tên',
              controller: _fullNameController,
              prefixIcon: Icons.person_outline,
              validator: (value) {
                if (value == null || value.isEmpty) return 'Họ tên không được để trống';
                return null;
              },
            ),
            const SizedBox(height: 16),
            CustomTextField(
              label: 'Email',
              hintText: 'Nhập email',
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
              hintText: 'Tạo mật khẩu (tối thiểu 6 ký tự)',
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
            CustomButton(label: 'Đăng ký', isLoading: isLoading, onPressed: _submit),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Bạn đã có tài khoản?', style: Theme.of(context).textTheme.bodyMedium),
                TextButton(
                  onPressed: () => context.go(RoutePaths.login),
                  child: const Text('Đăng nhập'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
