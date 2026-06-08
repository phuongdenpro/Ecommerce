import '../repositories/auth_repository.dart';

class RegisterParams {
  final String fullName;
  final String email;
  final String password;

  const RegisterParams({
    required this.fullName,
    required this.email,
    required this.password,
  });
}

class RegisterUseCase {
  final AuthRepository _repository;

  RegisterUseCase(this._repository);

  Future<void> call(RegisterParams params) {
    return _repository.register(
      fullName: params.fullName,
      email: params.email,
      password: params.password,
    );
  }
}
