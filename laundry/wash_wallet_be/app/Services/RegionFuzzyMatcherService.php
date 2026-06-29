<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RegionFuzzyMatcherService
{
  private const API_BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';
  private const CACHE_TTL = 30 * 24 * 60 * 60;
  private const SIMILARITY_THRESHOLD = 70;

  /**
   * Tries to find matching region IDs for the given region names.
   *
   * @param string|null $provinceName
   * @param string|null $regencyName
   * @param string|null $districtName
   * @param string|null $villageName
   * @return array Returns associative array of matched IDs and Names.
   */
  public function matchLocation(
    ?string $provinceName,
    ?string $regencyName,
    ?string $districtName,
    ?string $villageName
  ): array {
    $result = [];

    try {
      if (!$provinceName) {
        return $result;
      }

      $provinces = $this->fetchData('/provinces.json', 'provinces');
      $matchedProvince = $this->fuzzySearch($provinceName, $provinces, 80);

      if (!$matchedProvince) {
        return $result;
      }

      $result['province_id'] = $matchedProvince['id'];
      $result['province_name'] = $matchedProvince['name'];

      if (!$regencyName) {
        return $result;
      }

      $regencies = $this->fetchData("/regencies/{$matchedProvince['id']}.json", "regencies_{$matchedProvince['id']}");
      $matchedRegency = $this->fuzzySearch($regencyName, $regencies, 65);

      if (!$matchedRegency) {
        return $result;
      }

      $result['regency_id'] = $matchedRegency['id'];
      $result['regency_name'] = $matchedRegency['name'];

      if (!$districtName) {
        return $result;
      }

      $districts = $this->fetchData("/districts/{$matchedRegency['id']}.json", "districts_{$matchedRegency['id']}");
      $matchedDistrict = $this->fuzzySearch($districtName, $districts, 60);

      if (!$matchedDistrict) {
        return $result;
      }

      $result['district_id'] = $matchedDistrict['id'];
      $result['district_name'] = $matchedDistrict['name'];

      if (!$villageName) {
        return $result;
      }

      $villages = $this->fetchData("/villages/{$matchedDistrict['id']}.json", "villages_{$matchedDistrict['id']}");
      $matchedVillage = $this->fuzzySearch($villageName, $villages, 55);

      if ($matchedVillage) {
        $result['village_id'] = $matchedVillage['id'];
        $result['village_name'] = $matchedVillage['name'];
      }

      return $result;
    } catch (\Throwable $e) {
      Log::warning('[RegionFuzzyMatcherService] Error matching location: ' . $e->getMessage(), [
        'province' => $provinceName,
        'regency' => $regencyName,
        'district' => $districtName,
        'village' => $villageName,
      ]);
      return $result;
    }
  }

  /**
   * Tries to parse a single full address string into structured region names.
   *
   * @param string $address
   * @return array
   */
  public function parseFullAddress(string $address): array
  {
    $parts = array_map('trim', explode(',', $address));
    $parts = array_filter($parts);

    $result = [
      'province' => null,
      'regency'  => null,
      'district' => null,
      'village'  => null,
    ];

    if (count($parts) < 2) {
      return $result;
    }

    // GMap addresses usually end with: [Street Info], [Village], [Kecamatan], [Kabupaten/Kota], [Provinsi + Postcode], [Indonesia]
    $reversed = array_values(array_reverse($parts));
    $idx = 0;

    if ($idx < count($reversed) && strtolower($reversed[$idx]) === 'indonesia') {
      $idx++;
    }

    if ($idx < count($reversed)) {
      $result['province'] = trim(preg_replace('/\b\d{5}\b/', '', $reversed[$idx]));
      $idx++;
    }

    if ($idx < count($reversed)) {
      $result['regency'] = $reversed[$idx];
      $idx++;
    }

    if ($idx < count($reversed)) {
      $result['district'] = $reversed[$idx];
      $idx++;
    }

    if ($idx < count($reversed)) {
      $val = $reversed[$idx];
      if (!preg_match('/\b(jl\.|jalan|no\.|rt\.|rw\.)/i', $val)) {
        $result['village'] = $val;
      }
    }

    return $result;
  }

  private function fetchData(string $endpoint, string $cacheKey): array
  {
    return Cache::remember('emsifa_' . $cacheKey, self::CACHE_TTL, function () use ($endpoint) {
      $response = Http::timeout(5)->get(self::API_BASE_URL . $endpoint);

      if ($response->successful()) {
        return $response->json();
      }

      throw new \Exception('Failed to fetch data from Emsifa API');
    });
  }

  private function fuzzySearch(string $searchQuery, array $items, int $threshold): ?array
  {
    $bestMatch = null;
    $highestScore = 0;

    $normalizedSearch = $this->normalizeText($searchQuery);
    $searchWords = array_filter(
      explode(' ', $normalizedSearch),
      fn($w) => strlen($w) > 2
    );

    foreach ($items as $item) {
      $normalizedItem = $this->normalizeText($item['name']);

      similar_text($normalizedSearch, $normalizedItem, $similarPercent);

      $maxLen = max(strlen($normalizedSearch), strlen($normalizedItem));
      $levenshteinScore = $maxLen > 0
        ? (1 - levenshtein($normalizedSearch, $normalizedItem) / $maxLen) * 100
        : 0;

      $wordBonus = 0;
      if (!empty($searchWords)) {
        $matchedWords = 0;
        foreach ($searchWords as $word) {
          if (str_contains($normalizedItem, $word)) {
            $matchedWords++;
          }
        }
        $wordBonus = ($matchedWords / count($searchWords)) * 30;
      }

      $finalScore = max($similarPercent, $levenshteinScore) + $wordBonus;

      if ($finalScore > $highestScore) {
        $highestScore = $finalScore;
        $bestMatch = $item;
      }
    }

    if ($highestScore >= $threshold) {
      return $bestMatch;
    }

    return null;
  }

  private function normalizeText(string $text): string
  {
    $text = strtoupper(trim($text));

    $text = preg_replace('/\b[A-Z0-9]{4,}\+[A-Z0-9]+\b/', '', $text);

    $abbreviations = [
      'KEC.'   => 'KECAMATAN',
      'KEL.'   => 'KELURAHAN',
      'DS.'    => 'DESA',
      'KAB.'   => 'KABUPATEN',
      'TJ.'    => 'TANJUNG',
      'GG.'    => 'GANG',
      'JL.'    => 'JALAN',
      'KOMP.'  => 'KOMPLEK',
      'PSR.'   => 'PASAR',
      'BLK.'   => 'BELAKANG',
      'NO.'    => '',
      'RT.'    => '',
      'RW.'    => '',
    ];
    foreach ($abbreviations as $abbr => $full) {
      $text = str_replace($abbr, $full, $text);
    }

    $text = preg_replace('/\b\d{5}\b/', '', $text);

    $text = preg_replace('/\b\d+\/\d+\b/', '', $text);
    $text = preg_replace('/\bNO\s*\d+\b/', '', $text);

    $adminPrefixes = ['KABUPATEN ', 'KOTA ', 'KECAMATAN ', 'KELURAHAN ', 'DESA '];
    foreach ($adminPrefixes as $prefix) {
      $text = str_replace($prefix, '', $text);
    }

    $text = preg_replace('/\s+/', ' ', $text);

    return trim($text);
  }
}
