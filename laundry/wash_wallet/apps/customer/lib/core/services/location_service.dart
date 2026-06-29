import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

class LocationService {
  Future<Result<Position>> getCurrentPosition() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return const Result.failure(
          ServerFailure(message: 'Location services are disabled.'),
        );
      }

      PermissionStatus permission = await Permission.locationWhenInUse.status;
      if (permission == PermissionStatus.denied) {
        permission = await Permission.locationWhenInUse.request();
        if (permission == PermissionStatus.denied) {
          return const Result.failure(
            ServerFailure(message: 'Location permissions are denied.'),
          );
        }
      }

      if (permission == PermissionStatus.permanentlyDenied) {
        return const Result.failure(
          ServerFailure(
            message:
                'Location permissions are permanently denied, we cannot request permissions.',
          ),
        );
      }

      try {
        Position? lastKnown = await Geolocator.getLastKnownPosition();
        if (lastKnown != null) {
          return Result.success(lastKnown);
        }
      } catch (_) {}

      Position position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.low,
          timeLimit: Duration(seconds: 2),
        ),
      );
      return Result.success(position);
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }
}
