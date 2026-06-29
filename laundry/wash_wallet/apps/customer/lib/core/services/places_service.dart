import 'package:dio/dio.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';

class PlacesService {
  final Dio _dio;
  final String _apiKey = 'AIzaSyDkYBDAdNxfYcFRyIbLz0GYQ1YHV7v9HUY';

  PlacesService(this._dio);

  Future<Result<List<Map<String, dynamic>>>> getAutocomplete(
    String input, {
    String? sessionToken,
    double? lat,
    double? lng,
  }) async {
    try {
      final response = await _dio.get(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json',
        queryParameters: {
          'input': input,
          'key': _apiKey,
          'language': 'id',
          'components': 'country:id',
          'sessiontoken': ?sessionToken,
          if (lat != null && lng != null) 'location': '$lat,$lng',
          if (lat != null && lng != null) 'radius': '10000',
        },
      );

      if (response.data['status'] == 'OK') {
        final predictions = List<Map<String, dynamic>>.from(
          response.data['predictions'],
        );
        return Result.success(predictions);
      } else {
        return Result.failure(
          ServerFailure(
            message: 'Gagal mengambil saran alamat: ${response.data['status']}',
          ),
        );
      }
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }

  Future<Result<Map<String, dynamic>>> getPlaceDetails(
    String placeId, {
    String? sessionToken,
  }) async {
    try {
      final response = await _dio.get(
        'https://maps.googleapis.com/maps/api/place/details/json',
        queryParameters: {
          'place_id': placeId,
          'key': _apiKey,
          'fields': 'geometry,formatted_address',
          'sessiontoken': ?sessionToken,
        },
      );

      if (response.data['status'] == 'OK') {
        return Result.success(response.data['result']);
      } else {
        return Result.failure(
          ServerFailure(
            message:
                'Gagal mengambil detail lokasi: ${response.data['status']}',
          ),
        );
      }
    } catch (e) {
      return Result.failure(ServerFailure(message: e.toString()));
    }
  }
}
