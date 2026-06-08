import '../../domain/entities/user_entity.dart';

class UserModel {
  final String id;
  final String? fullName;
  final String email;
  final String? phoneNumber;
  final String? role;
  final String? avatarUrl;

  const UserModel({
    required this.id,
    this.fullName,
    required this.email,
    this.phoneNumber,
    this.role,
    this.avatarUrl,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    print('Parsing UserModel from JSON: $json');
    return UserModel(
      id: json['id'] as String,
      fullName: json['fullName'] as String?,
      email: json['email'] as String,
      phoneNumber: (json['phoneNumber'] ?? json['phone']) as String?,
      role: json['role']?.toString() ?? 'User',
      avatarUrl: json['avatarUrl'] as String?,
    );
  }

  UserEntity toEntity() => UserEntity(
        id: id,
        fullName: fullName ?? '',
        email: email,
        phoneNumber: phoneNumber ?? '',
        role: role ?? 'User',
        avatarUrl: avatarUrl,
      );
}
