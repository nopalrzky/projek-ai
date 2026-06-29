import 'package:connectivity_plus/connectivity_plus.dart';

class OfflineException implements Exception {
  final String actionName;
  const OfflineException({required this.actionName});

  @override
  String toString() => 'Diperlukan koneksi internet untuk $actionName. Draft Anda telah disimpan.';
}

class OnlineGuard {
  static Future<bool> isOnline() async {
    final results = await Connectivity().checkConnectivity();
    return !results.contains(ConnectivityResult.none);
  }

  static Future<T> requireOnline<T>({
    required String actionName,
    required Future<T> Function() action,
    required void Function(String message) onOffline,
  }) async {
    if (!await isOnline()) {
      final message = 'Diperlukan koneksi internet untuk $actionName.';
      onOffline(message);
      throw OfflineException(actionName: actionName);
    }
    return await action();
  }
}
