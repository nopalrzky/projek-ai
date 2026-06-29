import 'dart:async';
import 'package:dio/dio.dart';

mixin NetworkRetryMixin {
  Future<T> withRetry<T>(Future<T> Function() fn, {int maxAttempts = 3}) async {
    int attempt = 0;
    while (true) {
      try {
        attempt++;
        return await fn();
      } catch (e) {
        if (e is DioException && attempt < maxAttempts) {
          if (e.type != DioExceptionType.badResponse) {
            await Future.delayed(Duration(milliseconds: 500 * attempt));
            continue;
          }
        }
        rethrow;
      }
    }
  }
}
