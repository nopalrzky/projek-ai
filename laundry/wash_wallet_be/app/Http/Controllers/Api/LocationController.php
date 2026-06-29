<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LocationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

class LocationController extends Controller
{
    public function __construct(
        private readonly LocationService $locationService,
    ) {}

    /**
     * Get all provinces in Indonesia
     */
    public function getProvinces(): JsonResponse
    {
        try {
            $startTime = microtime(true);
            $provinces = $this->locationService->getProvinces();
            $duration = round((microtime(true) - $startTime) * 1000, 2);

            Log::info('Provinces API accessed', [
                'count'       => count($provinces),
                'duration_ms' => $duration,
            ]);

            return $this->successResponse(
                $provinces,
                'Provinces retrieved successfully',
                200,
                [
                    'count'       => count($provinces),
                    'source'      => 'api',
                    'duration_ms' => $duration,
                ]
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[LocationController] Failed to get provinces', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'location',
            ]);

            return $this->errorResponse('Gagal memuat data provinsi', 500, $e);
        }
    }

    /**
     * Get all regencies/cities in a specific province
     */
    public function getRegencies(int $provinceId): JsonResponse
    {
        try {
            if ($provinceId <= 0) {
                return $this->errorResponse('ID provinsi tidak valid', 400);
            }

            $startTime = microtime(true);
            $regencies = $this->locationService->getRegencies($provinceId);
            $duration = round((microtime(true) - $startTime) * 1000, 2);

            Log::info('Regencies API accessed', [
                'province_id' => $provinceId,
                'count'       => count($regencies),
                'duration_ms' => $duration,
            ]);

            return $this->successResponse(
                $regencies,
                'Regencies retrieved successfully',
                200,
                [
                    'count'       => count($regencies),
                    'province_id' => $provinceId,
                    'source'      => 'api',
                    'duration_ms' => $duration,
                ]
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[LocationController] Failed to get regencies', [
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'location',
                'province_id' => $provinceId,
            ]);

            return $this->errorResponse('Gagal memuat data kabupaten/kota', 500, $e);
        }
    }

    /**
     * Get all districts in a specific regency
     */
    public function getDistricts(int $regencyId): JsonResponse
    {
        try {
            if ($regencyId <= 0) {
                return $this->errorResponse('ID kabupaten tidak valid', 400);
            }

            $startTime = microtime(true);
            $districts = $this->locationService->getDistricts($regencyId);
            $duration = round((microtime(true) - $startTime) * 1000, 2);

            Log::info('Districts API accessed', [
                'regency_id'  => $regencyId,
                'count'       => count($districts),
                'duration_ms' => $duration,
            ]);

            return $this->successResponse(
                $districts,
                'Districts retrieved successfully',
                200,
                [
                    'count'       => count($districts),
                    'regency_id'  => $regencyId,
                    'source'      => 'api',
                    'duration_ms' => $duration,
                ]
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[LocationController] Failed to get districts', [
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'location',
                'regency_id' => $regencyId,
            ]);

            return $this->errorResponse('Gagal memuat data kecamatan', 500, $e);
        }
    }

    /**
     * Get all villages in a specific district
     */
    public function getVillages(int $districtId): JsonResponse
    {
        try {
            if ($districtId <= 0) {
                return $this->errorResponse('ID kecamatan tidak valid', 400);
            }

            $startTime = microtime(true);
            $villages = $this->locationService->getVillages($districtId);
            $duration = round((microtime(true) - $startTime) * 1000, 2);

            Log::info('Villages API accessed', [
                'district_id' => $districtId,
                'count'       => count($villages),
                'duration_ms' => $duration,
            ]);

            return $this->successResponse(
                $villages,
                'Villages retrieved successfully',
                200,
                [
                    'count'       => count($villages),
                    'district_id' => $districtId,
                    'source'      => 'api',
                    'duration_ms' => $duration,
                ]
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[LocationController] Failed to get villages', [
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'location',
                'district_id' => $districtId,
            ]);

            return $this->errorResponse('Gagal memuat data kelurahan/desa', 500, $e);
        }
    }

    /**
     * Get detailed information about a specific province
     */
    public function getProvinceById(int $provinceId): JsonResponse
    {
        try {
            if ($provinceId <= 0) {
                return $this->errorResponse('ID provinsi tidak valid', 400);
            }

            $province = $this->locationService->getProvinceById($provinceId);

            return $this->successResponse($province, 'Province details retrieved successfully');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[LocationController] Failed to get province details', [
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'location',
                'province_id' => $provinceId,
            ]);

            return $this->errorResponse('Gagal memuat detail provinsi', 500, $e);
        }
    }

    /**
     * Get detailed information about a specific regency
     */
    public function getRegencyById(int $regencyId): JsonResponse
    {
        try {
            if ($regencyId <= 0) {
                return $this->errorResponse('ID kabupaten tidak valid', 400);
            }

            $regency = $this->locationService->getRegencyById($regencyId);

            return $this->successResponse($regency, 'Regency details retrieved successfully');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Data tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[LocationController] Failed to get regency details', [
                'error'      => $e->getMessage(),
                'user_id'    => Auth::id(),
                'type'       => 'location',
                'regency_id' => $regencyId,
            ]);

            return $this->errorResponse('Gagal memuat detail kabupaten/kota', 500, $e);
        }
    }
}
