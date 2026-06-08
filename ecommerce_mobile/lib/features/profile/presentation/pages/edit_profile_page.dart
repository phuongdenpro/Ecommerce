import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:flutter_restapi/app/router/route_paths.dart';
import 'package:flutter_restapi/features/profile/presentation/providers/profile_controller.dart';
import 'package:flutter_restapi/core/widgets/custom_button.dart';
import 'package:flutter_restapi/core/widgets/custom_text_field.dart';
import 'package:flutter_restapi/core/widgets/error_widget.dart';
import 'package:flutter_restapi/core/widgets/loading_widget.dart';

class EditProfilePage extends ConsumerStatefulWidget {
  const EditProfilePage({super.key});

  @override
  ConsumerState<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends ConsumerState<EditProfilePage> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _phoneNumberController = TextEditingController();
  String? _errorMessage;
  bool _initialized = false;

  @override
  void dispose() {
    _fullNameController.dispose();
    _phoneNumberController.dispose();
    super.dispose();
  }

  void _initFields() {
    if (_initialized) return;
    final user = ref.read(currentUserProvider).valueOrNull;
    print(user);
    if (user == null) return;
    _fullNameController.text = user.fullName;
    _phoneNumberController.text = user.phoneNumber ?? '';
    _initialized = true;
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _errorMessage = null);

    final user = ref.read(currentUserProvider).valueOrNull;
    final error = await ref
        .read(editProfileControllerProvider.notifier)
        .save(
          fullName: _fullNameController.text.trim(),
          phoneNumber: _phoneNumberController.text.trim(),
        );

    ref.invalidate(currentUserProvider);
    // hoặc nếu currentUserProvider là StateProvider thì:

    if (!mounted) return;

    if (error == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cập nhật thông tin thành công')),
      );
      context.pop(true);
    } else {
      setState(() => _errorMessage = error);
    }
  }

  @override
  Widget build(BuildContext context) {
    final userAsync = ref.watch(currentUserProvider);
    final isLoading = ref.watch(editProfileControllerProvider).isLoading;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cập nhật hồ sơ'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go(RoutePaths.account);
            }
          },
        ),
      ),
      body: userAsync.when(
        loading: () => const LoadingWidget(message: 'Đang tải hồ sơ...'),
        error: (error, _) => AppErrorWidget(
          message: error.toString(),
          onRetry: () => ref.read(currentUserProvider.notifier).refresh(),
        ),
        data: (user) {
          if (user == null) {
            return const AppErrorWidget(message: 'Không tải được hồ sơ');
          }

          _initFields();

          return Padding(
            padding: const EdgeInsets.all(24),
            child: SingleChildScrollView(
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    CustomTextField(
                      label: 'Họ và tên',
                      hintText: 'Nhập họ tên',
                      controller: _fullNameController,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Họ tên không được để trống';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    CustomTextField(
                      label: 'Số điện thoại',
                      hintText: 'Nhập số điện thoại',
                      controller: _phoneNumberController,
                      keyboardType: TextInputType.phone,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Số điện thoại không được để trống';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),
                    if (_errorMessage != null) ...[
                      Text(
                        _errorMessage!,
                        style: const TextStyle(color: Colors.redAccent),
                      ),
                      const SizedBox(height: 12),
                    ],
                    CustomButton(
                      label: 'Lưu lại',
                      isLoading: isLoading,
                      onPressed: _saveProfile,
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
