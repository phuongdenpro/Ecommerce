import 'package:flutter_restapi/core/network/api_response_parser.dart';

import 'order_item_model.dart';
import '../../domain/entities/order_entity.dart';

class OrderModel {
  final String id;
  final String orderCode;
  final double totalAmount;
  final double shippingFee;
  final double discountAmount;
  final double finalAmount;
  final String status;
  final String? paymentMethod;
  final String? paymentStatus;
  final String shippingAddress;
  final String? note;
  final DateTime createdAt;
  final List<OrderItemModel> items;
  final int? itemCount;

  const OrderModel({
    required this.id,
    required this.orderCode,
    required this.totalAmount,
    required this.shippingFee,
    required this.discountAmount,
    required this.finalAmount,
    required this.status,
    this.paymentMethod,
    this.paymentStatus,
    required this.shippingAddress,
    this.note,
    required this.createdAt,
    required this.items,
    this.itemCount,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    final itemsList = (json['items'] as List<dynamic>?)
            ?.map((item) => OrderItemModel.fromJson(item as Map<String, dynamic>))
            .toList() ??
        [];

    return OrderModel(
      id: ApiResponseParser.parseId(json['id']),
      orderCode: json['orderCode']?.toString() ?? '',
      totalAmount: ApiResponseParser.parseMoney(json['totalAmount']),
      shippingFee: ApiResponseParser.parseMoney(json['shippingFee']),
      discountAmount: ApiResponseParser.parseMoney(json['discountAmount']),
      finalAmount: ApiResponseParser.parseMoney(
        json['finalAmount'] ?? json['totalAmount'],
      ),
      status: json['status']?.toString() ?? 'Pending',
      paymentMethod: json['paymentMethod'] as String?,
      paymentStatus: json['paymentStatus'] as String?,
      shippingAddress: json['shippingAddress']?.toString() ?? '',
      note: json['note'] as String? ?? json['notes'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'].toString())
          : DateTime.now(),
      items: itemsList,
      itemCount: json['itemCount'] != null
          ? ApiResponseParser.parseInt(json['itemCount'])
          : null,
    );
  }

  OrderEntity toEntity() => OrderEntity(
        id: id,
        orderCode: orderCode,
        totalAmount: totalAmount,
        shippingFee: shippingFee,
        discountAmount: discountAmount,
        finalAmount: finalAmount,
        status: _parseStatus(status),
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        shippingAddress: shippingAddress,
        note: note,
        createdAt: createdAt,
        items: items
            .map((item) => (
                  productId: item.productId,
                  productName: item.productName,
                  unitPrice: item.unitPrice,
                  quantity: item.quantity,
                  imageUrl: item.imageUrl,
                  subTotal: item.subTotal,
                ))
            .toList(),
      );

  static OrderStatus _parseStatus(String status) {
    return switch (status.toLowerCase()) {
      'pending' => OrderStatus.pending,
      'confirmed' => OrderStatus.confirmed,
      'processing' => OrderStatus.processing,
      'shipping' => OrderStatus.shipping,
      'delivered' => OrderStatus.delivered,
      'completed' => OrderStatus.delivered,
      'cancelled' => OrderStatus.cancelled,
      _ => OrderStatus.pending,
    };
  }
}
