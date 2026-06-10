import 'package:flutter_restapi/core/network/api_response_parser.dart';

import '../../domain/entities/payment_entity.dart';

class PaymentModel {
  final String id;
  final String orderId;
  final String method;
  final String status;
  final double amount;
  final String? transactionId;
  final DateTime? paidAt;

  const PaymentModel({
    required this.id,
    required this.orderId,
    required this.method,
    required this.status,
    required this.amount,
    this.transactionId,
    this.paidAt,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    return PaymentModel(
      id: ApiResponseParser.parseId(json['id']),
      orderId: ApiResponseParser.parseId(json['orderId']),
      method: json['method']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      amount: ApiResponseParser.parseMoney(json['amount']),
      transactionId: json['transactionId'] as String?,
      paidAt: json['paidAt'] != null
          ? DateTime.tryParse(json['paidAt'].toString())
          : null,
    );
  }

  PaymentEntity toEntity() => PaymentEntity(
        id: id,
        orderId: orderId,
        method: method,
        status: status,
        amount: amount,
        transactionId: transactionId,
        paidAt: paidAt,
      );
}
