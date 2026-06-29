<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * GoogleMapsService - Utility service for Google Maps API interactions.
 * This service is NOT extending BaseService as per architectural plan.
 */
class GoogleMapsService
{
    private string $apiKey;
    private const CACHE_TTL = 86400; // 24 hours

    public function __construct()
    {
        $this->apiKey = (string) (config('google_maps.api_key') ?? '');
    }

    /**
     * Get distance between two points in kilometers.
     * Uses Distance Matrix API with Haversine fallback.
     */
    public function getDistance(float $originLat, float $originLng, float $destLat, float $destLng): float
    {
        $cacheKey = "distance:{$originLat},{$originLng}:{$destLat},{$destLng}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($originLat, $originLng, $destLat, $destLng) {
            try {
                if (empty($this->apiKey)) {
                    throw new Exception("Google Maps API Key is not configured.");
                }

                $response = Http::timeout(10)->get('https://maps.googleapis.com/maps/api/distancematrix/json', [
                    'origins' => "{$originLat},{$originLng}",
                    'destinations' => "{$destLat},{$destLng}",
                    'key' => $this->apiKey,
                    'mode' => 'driving',
                ]);

                if (!$response->successful()) {
                    throw new Exception("Google Maps API request failed with status: " . $response->status());
                }

                $data = $response->json();

                if (($data['status'] ?? '') !== 'OK') {
                    throw new Exception("Google Maps API error: " . ($data['status'] ?? 'Unknown Error'));
                }

                $element = $data['rows'][0]['elements'][0] ?? null;

                if (!$element || ($element['status'] ?? '') !== 'OK') {
                    throw new Exception("Google Maps could not find a route: " . ($element['status'] ?? 'No results'));
                }

                $distanceMeters = $element['distance']['value'];
                $distanceKm = round($distanceMeters / 1000, 2);

                Log::info("[GoogleMapsService] Distance fetched from API", [
                    'origin' => "{$originLat},{$originLng}",
                    'dest' => "{$destLat},{$destLng}",
                    'distance_km' => $distanceKm
                ]);

                return $distanceKm;
            } catch (Exception $e) {
                $fallbackDistance = $this->calculateHaversineDistance($originLat, $originLng, $destLat, $destLng);

                Log::warning("[GoogleMapsService] API failed, using Haversine fallback", [
                    'error' => $e->getMessage(),
                    'fallback_distance_km' => $fallbackDistance
                ]);

                return $fallbackDistance;
            }
        });
    }

    /**
     * Haversine formula to calculate straight-line distance between two points in km.
     */
    private function calculateHaversineDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371;

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 2);
    }
}
