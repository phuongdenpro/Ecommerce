class ApiConstants {
  // Dùng 10.0.2.2 cho Android Emulator để kết nối đến localhost của máy tính
  static const baseUrl = 'http://10.0.2.2:5207/api';
  // Dùng địa chỉ IP (vd: 192.168.1.x) nếu chạy trên thiết bị thật, 
  // (nhớ mở port 5207 trên backend bằng cách sửa applicationUrl thành http://0.0.0.0:5207)
  // static const baseUrl = 'http://192.168.1.252:5207/api';
}
