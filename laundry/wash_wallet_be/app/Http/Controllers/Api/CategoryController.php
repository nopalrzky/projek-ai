<?php

namespace App\Http\Controllers\Api;

use App\Helpers\PaginationHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Requests\Category\LaundryService\StoreLaundryServiceRequest;
use App\Http\Requests\Category\LaundryService\UpdateLaundryServiceRequest;
use App\Http\Resources\Category\CategoryResource;
use App\Http\Resources\LaundryService\LaundryServiceResource;
use App\Services\CategoryService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

use Illuminate\Routing\Attributes\Controllers\Middleware;

#[Middleware('auth:sanctum')]
class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryService $categoryService,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilters($request);

            $categories = $this->categoryService->getAll(
                filters: $filters,
                page: $filters['page'],
                perPage: $filters['perPage'],
                relations: ['outlet']
            );

            return $this->successResponse(
                CategoryResource::collection($categories->items())->resolve(),
                'Categories retrieved successfully',
                200,
                PaginationHelper::format($categories, $request)
            );
        } catch (Throwable $e) {
            Log::error('[CategoryController] Failed to fetch categories', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'category_management',
            ]);

            return $this->errorResponse('Gagal memuat daftar kategori', 500, $e);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        try {
            $category = $this->categoryService->store($request->validated());

            return $this->successResponse(
                (new CategoryResource($category->load('outlet')))->resolve(),
                'Category created successfully',
                201
            );
        } catch (Throwable $e) {
            Log::error('[CategoryController] Failed to create category', [
                'error'   => $e->getMessage(),
                'user_id' => Auth::id(),
                'type'    => 'category_management',
            ]);

            return $this->errorResponse('Gagal membuat kategori', 500, $e);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $category = $this->categoryService->getById($id, ['laundryServices']);

            Log::info('[CategoryController] Category retrieved successfully', [
                'category_id' => $id,
                'user_id'     => Auth::id(),
                'type'        => 'category_management',
                'data'        => (new CategoryResource($category))->resolve(),
            ]);

            return $this->successResponse(
                (new CategoryResource($category))->resolve(),
                'Category retrieved successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Kategori tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[CategoryController] Failed to fetch category', [
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'category_management',
                'category_id' => $id,
            ]);

            return $this->errorResponse('Gagal memuat kategori', 500, $e);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, int $id): JsonResponse
    {
        try {
            $category = $this->categoryService->update($id, $request->validated());

            return $this->successResponse(
                (new CategoryResource($category->load('outlet')))->resolve(),
                'Category updated successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Kategori tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[CategoryController] Failed to update category', [
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'category_management',
                'category_id' => $id,
            ]);

            return $this->errorResponse('Gagal memperbarui kategori', 500, $e);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $deleted = $this->categoryService->destroy($id);

            if ($deleted) {
                return $this->successResponse(null, 'Category deleted successfully');
            }

            return $this->errorResponse('Kategori tidak ditemukan atau tidak dapat dihapus', 404);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Kategori tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[CategoryController] Failed to delete category', [
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'category_management',
                'category_id' => $id,
            ]);

            return $this->errorResponse('Gagal menghapus kategori', 500, $e);
        }
    }

    /**
     * Store laundry service for category
     */
    public function storeLaundryService(StoreLaundryServiceRequest $request, int $categoryId): JsonResponse
    {
        try {
            $laundryService = $this->categoryService->storeLaundryService($categoryId, $request->validated());

            return $this->successResponse(
                (new LaundryServiceResource($laundryService))->resolve(),
                'Laundry service created successfully',
                201
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Kategori tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[CategoryController] Failed to create laundry service', [
                'error'       => $e->getMessage(),
                'user_id'     => Auth::id(),
                'type'        => 'category_management',
                'category_id' => $categoryId,
            ]);

            return $this->errorResponse('Gagal membuat layanan laundry', 500, $e);
        }
    }

    /**
     * Update laundry service for category
     */
    public function updateLaundryService(UpdateLaundryServiceRequest $request, int $categoryId, int $laundryServiceId): JsonResponse
    {
        try {
            $laundryService = $this->categoryService->updateLaundryService($categoryId, $laundryServiceId, $request->validated());

            return $this->successResponse(
                (new LaundryServiceResource($laundryService))->resolve(),
                'Laundry service updated successfully'
            );
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Kategori atau layanan laundry tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[CategoryController] Failed to update laundry service', [
                'error'              => $e->getMessage(),
                'user_id'            => Auth::id(),
                'type'               => 'category_management',
                'category_id'        => $categoryId,
                'laundry_service_id' => $laundryServiceId,
            ]);

            return $this->errorResponse('Gagal memperbarui layanan laundry', 500, $e);
        }
    }

    /**
     * Delete laundry service for category
     */
    public function destroyLaundryService(int $categoryId, int $laundryServiceId): JsonResponse
    {
        try {
            $deleted = $this->categoryService->destroyLaundryService($categoryId, $laundryServiceId);

            if ($deleted) {
                return $this->successResponse(null, 'Laundry service deleted successfully');
            }

            return $this->errorResponse('Layanan laundry tidak ditemukan atau tidak dapat dihapus', 404);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Kategori atau layanan laundry tidak ditemukan', 404, $e);
        } catch (Throwable $e) {
            Log::error('[CategoryController] Failed to delete laundry service', [
                'error'              => $e->getMessage(),
                'user_id'            => Auth::id(),
                'type'               => 'category_management',
                'category_id'        => $categoryId,
                'laundry_service_id' => $laundryServiceId,
            ]);

            return $this->errorResponse('Gagal menghapus layanan laundry', 500, $e);
        }
    }

    /**
     * Helper: Get filters from request
     */
    private function getFilters(Request $request): array
    {
        return [
            'search' => $request->string('search')->toString(),
            'outletId' => $request->has('outletId') && $request->filled('outletId')
                ? $request->integer('outletId')
                : null,
            'isActive' => $request->has('isActive') && $request->filled('isActive')
                ? $request->boolean('isActive')
                : null,
            'sortBy'        => $request->string('sortBy', 'created_at')->toString(),
            'sortDirection' => $request->string('sortDirection', 'desc')->toString(),
            'page'          => $request->integer('page', 1),
            'perPage'       => $request->integer('perPage', 15),
        ];
    }
}
