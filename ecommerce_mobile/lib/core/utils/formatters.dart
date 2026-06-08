String formatCurrency(num value) {
  final text = value.toStringAsFixed(0);
  final buffer = StringBuffer();
  for (var i = 0; i < text.length; i++) {
    if (i > 0 && (text.length - i) % 3 == 0) {
      buffer.write('.');
    }
    buffer.write(text[i]);
  }
  return '${buffer.toString()} đ';
}
