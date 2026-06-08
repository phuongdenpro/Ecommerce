class UserEntity {
  final String id;
  final String fullName;
  final String email;
  final String? phoneNumber;
  final String role;
  final String? avatarUrl;

  const UserEntity({
    required this.id,
    required this.fullName,

    required this.email,
    this.phoneNumber,
    required this.role,
    this.avatarUrl,
  });
}
