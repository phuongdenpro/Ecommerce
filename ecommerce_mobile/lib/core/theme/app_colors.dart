import 'package:flutter/material.dart';

abstract final class AppColors {
  static const Color primary = Color(0xFF1D4ED8);
  static const Color primaryDark = Color(0xFF1E3A8A);
  static const Color accent = Color(0xFF0EA5E9);
  static const Color surface = Color(0xFFF8FAFC);
  static const Color card = Colors.white;
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color border = Color(0xFFE2E8F0);
  static const Color error = Color(0xFFEF4444);
  static const Color success = Color(0xFF10B981);

  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primary, accent],
  );

  static const LinearGradient authBackground = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFFEFF6FF), surface],
  );
}
