<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Exception;

class LocationService
{
  /**
   * Base URL for Indonesia Region API
   */
  private const API_BASE_URL = 'https://emsifa.github.io/api-wilayah-indonesia/api';

  /**
   * Cache TTL in seconds (24 hours by default)
   */
  private const CACHE_TTL = 86400; // 24 hours

  /**
   * HTTP request timeout in seconds
   */
  private const REQUEST_TIMEOUT = 10;

  /**
   * Get cache TTL from config or use default
   */
  private function getCacheTtl(): int
  {
    return config('cache.ttl', self::CACHE_TTL);
  }

  /**
   * Make HTTP request to the API with error handling
   */
  private function makeRequest(string $endpoint): array
  {
    try {
      $response = Http::timeout(self::REQUEST_TIMEOUT)
        ->withHeaders([
          'Accept' => 'application/json',
          'User-Agent' => 'LaundryManagementSystem/1.0'
        ])
        ->get(self::API_BASE_URL . $endpoint);

      if (!$response->successful()) {
        throw new Exception("API request failed with status: {$response->status()}");
      }

      $data = $response->json();

      if (!is_array($data)) {
        throw new Exception("Invalid API response format");
      }

      return $data;
    } catch (Exception $e) {
      Log::error('LocationService API request failed', [
        'endpoint' => $endpoint,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      throw new Exception("Failed to fetch location data: {$e->getMessage()}");
    }
  }

  /**
   * Get all provinces in Indonesia
   *
   * @return array<int, array{id: int, name: string}>
   * @throws Exception
   */
  public function getProvinces(): array
  {
    return Cache::remember(
      'locations.provinces',
      $this->getCacheTtl(),
      function () {
        Log::info('Fetching provinces from API');

        $provinces = $this->makeRequest('/provinces.json');

        $result = collect($provinces)->map(function ($province) {
          if (!isset($province['id']) || !isset($province['name'])) {
            throw new Exception("Invalid province data structure");
          }

          return [
            'id' => (int) $province['id'],
            'name' => (string) $province['name']
          ];
        })->toArray();

        Log::info('Successfully fetched provinces', ['count' => count($result)]);

        return $result;
      }
    );
  }

  /**
   * Get all regencies/cities in a specific province
   *
   * @param int $provinceId
   * @return array<int, array{id: int, name: string, province_id: int}>
   * @throws Exception
   */
  public function getRegencies(int $provinceId): array
  {
    if ($provinceId <= 0) {
      throw new Exception("Invalid province ID: {$provinceId}");
    }

    return Cache::remember(
      "locations.regencies.{$provinceId}",
      $this->getCacheTtl(),
      function () use ($provinceId) {
        Log::info('Fetching regencies from API', ['province_id' => $provinceId]);

        $regencies = $this->makeRequest("/regencies/{$provinceId}.json");

        $result = collect($regencies)->map(function ($regency) use ($provinceId) {
          if (!isset($regency['id']) || !isset($regency['name'])) {
            throw new Exception("Invalid regency data structure");
          }

          return [
            'id' => (int) $regency['id'],
            'name' => (string) $regency['name'],
            'province_id' => $provinceId
          ];
        })->toArray();

        Log::info('Successfully fetched regencies', [
          'province_id' => $provinceId,
          'count' => count($result)
        ]);

        return $result;
      }
    );
  }

  /**
   * Get all districts in a specific regency
   *
   * @param int $regencyId
   * @return array<int, array{id: int, name: string, regency_id: int}>
   * @throws Exception
   */
  public function getDistricts(int $regencyId): array
  {
    if ($regencyId <= 0) {
      throw new Exception("Invalid regency ID: {$regencyId}");
    }

    return Cache::remember(
      "locations.districts.{$regencyId}",
      $this->getCacheTtl(),
      function () use ($regencyId) {
        Log::info('Fetching districts from API', ['regency_id' => $regencyId]);

        $districts = $this->makeRequest("/districts/{$regencyId}.json");

        $result = collect($districts)->map(function ($district) use ($regencyId) {
          if (!isset($district['id']) || !isset($district['name'])) {
            throw new Exception("Invalid district data structure");
          }

          return [
            'id' => (int) $district['id'],
            'name' => (string) $district['name'],
            'regency_id' => $regencyId
          ];
        })->toArray();

        Log::info('Successfully fetched districts', [
          'regency_id' => $regencyId,
          'count' => count($result)
        ]);

        return $result;
      }
    );
  }

  /**
   * Get all villages in a specific district
   *
   * @param int $districtId
   * @return array<int, array{id: int, name: string, district_id: int}>
   * @throws Exception
   */
  public function getVillages(int $districtId): array
  {
    if ($districtId <= 0) {
      throw new Exception("Invalid district ID: {$districtId}");
    }

    return Cache::remember(
      "locations.villages.{$districtId}",
      $this->getCacheTtl(),
      function () use ($districtId) {
        Log::info('Fetching villages from API', ['district_id' => $districtId]);

        $villages = $this->makeRequest("/villages/{$districtId}.json");

        $result = collect($villages)->map(function ($village) use ($districtId) {
          if (!isset($village['id']) || !isset($village['name'])) {
            throw new Exception("Invalid village data structure");
          }

          return [
            'id' => (int) $village['id'],
            'name' => (string) $village['name'],
            'district_id' => $districtId
          ];
        })->toArray();

        Log::info('Successfully fetched villages', [
          'district_id' => $districtId,
          'count' => count($result)
        ]);

        return $result;
      }
    );
  }

  /**
   * Get detailed information about a specific province
   *
   * @param int $provinceId
   * @return array{id: int, name: string}
   * @throws Exception
   */
  public function getProvinceById(int $provinceId): array
  {
    if ($provinceId <= 0) {
      throw new Exception("Invalid province ID: {$provinceId}");
    }

    return Cache::remember(
      "locations.province.{$provinceId}",
      $this->getCacheTtl(),
      function () use ($provinceId) {
        Log::info('Fetching province details from API', ['province_id' => $provinceId]);

        $province = $this->makeRequest("/province/{$provinceId}.json");

        if (!isset($province['id']) || !isset($province['name'])) {
          throw new Exception("Invalid province data structure");
        }

        $result = [
          'id' => (int) $province['id'],
          'name' => (string) $province['name']
        ];

        Log::info('Successfully fetched province details', ['province' => $result]);

        return $result;
      }
    );
  }

  /**
   * Get detailed information about a specific regency
   *
   * @param int $regencyId
   * @return array{id: int, name: string, province_id: int}
   * @throws Exception
   */
  public function getRegencyById(int $regencyId): array
  {
    if ($regencyId <= 0) {
      throw new Exception("Invalid regency ID: {$regencyId}");
    }

    return Cache::remember(
      "locations.regency.{$regencyId}",
      $this->getCacheTtl(),
      function () use ($regencyId) {
        Log::info('Fetching regency details from API', ['regency_id' => $regencyId]);

        $regency = $this->makeRequest("/regency/{$regencyId}.json");

        if (!isset($regency['id']) || !isset($regency['name']) || !isset($regency['province_id'])) {
          throw new Exception("Invalid regency data structure");
        }

        $result = [
          'id' => (int) $regency['id'],
          'name' => (string) $regency['name'],
          'province_id' => (int) $regency['province_id']
        ];

        Log::info('Successfully fetched regency details', ['regency' => $result]);

        return $result;
      }
    );
  }
}
