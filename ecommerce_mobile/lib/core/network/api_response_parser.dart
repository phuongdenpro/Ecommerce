/// Helpers for parsing the backend `{ success, message, data }` wrapper.
class ApiResponseParser {
  static dynamic unwrap(dynamic responseData) {
    if (responseData is Map<String, dynamic> && responseData['data'] != null) {
      return responseData['data'];
    }
    return responseData;
  }

  static Map<String, dynamic> extractMap(dynamic responseData) {
    final data = unwrap(responseData);
    if (data is Map<String, dynamic>) return data;
    throw FormatException('Expected map in API response, got $data');
  }

  static List<T> parseList<T>(
    dynamic responseData,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    final data = unwrap(responseData);
    if (data is List) {
      return data
          .map((item) => fromJson(item as Map<String, dynamic>))
          .toList();
    }
    if (data is Map<String, dynamic> && data['items'] is List) {
      return (data['items'] as List)
          .map((item) => fromJson(item as Map<String, dynamic>))
          .toList();
    }
    return [];
  }

  static String parseId(dynamic value) => value?.toString() ?? '';

  static double parseMoney(dynamic value) => (value as num?)?.toDouble() ?? 0;

  static int parseInt(dynamic value) => (value as num?)?.toInt() ?? 0;
}
