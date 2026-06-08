import 'package:flutter/material.dart';

import 'package:flutter_restapi/core/theme/app_colors.dart';

class CustomButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  final bool isLoading;
  final Color? color;
  final bool outlined;
  final bool enabled;

  const CustomButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.color,
    this.outlined = false,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    final bgColor = color ?? AppColors.primary;

    if (outlined) {
      return SizedBox(
        width: double.infinity,
        height: 52,
        child: OutlinedButton(
          onPressed: !enabled || isLoading ? null : onPressed,
          child: _buildChild(context, bgColor),
        ),
      );
    }

    return SizedBox(
      width: double.infinity,
      height: 52,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: bgColor,
          disabledBackgroundColor: bgColor.withValues(alpha: 0.6),
        ),
        onPressed: !enabled || isLoading ? null : onPressed,
        child: _buildChild(context, Colors.white),
      ),
    );
  }

  Widget _buildChild(BuildContext context, Color textColor) {
    if (isLoading) {
      return SizedBox(
        width: 22,
        height: 22,
        child: CircularProgressIndicator(
          strokeWidth: 2.5,
          color: outlined ? AppColors.primary : Colors.white,
        ),
      );
    }
    return Text(
      label,
      style: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: outlined ? AppColors.primary : textColor,
      ),
    );
  }
}
