import 'order_item_model.dart';
import '../../domain/entities/order_entity.dart';

class OrderModel {
  final int id;
  final String orderCode;
  final int totalAmount;
  final String status;
  final String? paymentMethod;
  final String? paymentStatus;
  final String shippingAddress;
  final String recipientName;
  final String recipientPhone;
  final String? notes;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final List<OrderItemModel> items;

  const OrderModel({
    required this.id,
    required this.orderCode,
    required this.totalAmount,
    required this.status,
    this.paymentMethod,
    this.paymentStatus,
    required this.shippingAddress,
    required this.recipientName,
    required this.recipientPhone,
    this.notes,
    required this.createdAt,
    this.updatedAt,
    required this.items,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    final itemsList = (json['items'] as List<dynamic>?)
            ?.map((item) => OrderItemModel.fromJson(item as Map<String, dynamic>))
            .toList() ??
        [];

    return OrderModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      orderCode: json['orderCode']?.toString() ?? '',
      totalAmount: (json['totalAmount'] as num?)?.toInt() ?? 0,
      status: json['status']?.toString() ?? 'pending',
      paymentMethod: json['paymentMethod'] as String?,
      paymentStatus: json['paymentStatus'] as String?,
      shippingAddress: json['shippingAddress']?.toString() ?? '',
      recipientName: json['recipientName']?.toString() ?? '',
      recipientPhone: json['recipientPhone']?.toString() ?? '',
      notes: json['notes'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'].toString())
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'].toString())
          : null,
      items: itemsList,
    );
  }

  OrderEntity toEntity() => OrderEntity(
        id: id,
        orderCode: orderCode,
        totalAmount: totalAmount,
        status: _parseStatus(status),
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        shippingAddress: shippingAddress,
        recipientName: recipientName,
        recipientPhone: recipientPhone,
        notes: notes,
        createdAt: createdAt,
        items: items
            .map((item) => (
                  productId: item.productId,
                  productName: item.productName,
                  price: item.price,
                  quantity: item.quantity,
                  imageUrl: item.imageUrl,
                ))
            .toList(),
      );

  static OrderStatus _parseStatus(String status) {
    return switch (status.toLowerCase()) {
      'pending' => OrderStatus.pending,
      'confirmed' => OrderStatus.confirmed,
      'shipping' => OrderStatus.shipping,
      'completed' => OrderStatus.completed,
      'cancelled' => OrderStatus.cancelled,
      _ => OrderStatus.pending,
    };
  }
}
