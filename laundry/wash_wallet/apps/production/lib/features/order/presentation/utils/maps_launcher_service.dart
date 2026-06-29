import 'package:url_launcher/url_launcher.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class MapsLauncherService {
  MapsLauncherService._();

  static String? buildMapsUrl(Order order) {
    final coordinates = _extractCoordinates(order.customerAddress);

    if (coordinates != null) {
      return 'https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}';
    }

    final address = order.pickupAddress?.trim();
    if (address != null && address.isNotEmpty) {
      return 'https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent(address)}';
    }

    return null;
  }

  static bool hasNavigationTarget(Order order) {
    return buildMapsUrl(order) != null;
  }

  static Future<bool> openMaps(Order order) async {
    final url = buildMapsUrl(order);
    if (url == null) return false;

    final uri = Uri.parse(url);

    try {
      if (await canLaunchUrl(uri)) {
        return launchUrl(uri, mode: LaunchMode.externalApplication);
      }

      return launchUrl(uri, mode: LaunchMode.platformDefault);
    } catch (_) {
      return false;
    }
  }

  static _Coordinates? _extractCoordinates(dynamic customerAddress) {
    if (customerAddress is! Map) return null;

    final latitude = _toDouble(customerAddress['latitude']);
    final longitude = _toDouble(customerAddress['longitude']);

    if (latitude == null || longitude == null) return null;
    if (latitude.isNaN || longitude.isNaN) return null;
    if (latitude < -90 || latitude > 90) return null;
    if (longitude < -180 || longitude > 180) return null;

    return _Coordinates(latitude: latitude, longitude: longitude);
  }

  static double? _toDouble(dynamic value) {
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }
}

class _Coordinates {
  final double latitude;
  final double longitude;

  const _Coordinates({required this.latitude, required this.longitude});
}
