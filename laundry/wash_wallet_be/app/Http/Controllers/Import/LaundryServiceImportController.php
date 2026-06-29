<?php

namespace App\Http\Controllers\Import;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\LaundryService\UploadLaundryServiceRequest;
use App\Http\Resources\Category\CategoryResource;
use App\Http\Resources\ImportLog\ImportLogResource;
use App\Models\ImportLog;
use App\Services\CategoryService;
use App\Services\Export\TemplateGenerator;
use App\Services\Import\ImportService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

#[Middleware('auth')]
class LaundryServiceImportController extends Controller
{
  public function __construct(protected readonly ImportService $importService, protected readonly CategoryService $categoryService, protected readonly TemplateGenerator $templateGenerator) {}

  /**
   * Show upload page
   */
  public function create(int $categoryId)
  {
    try {
      $category = $this->categoryService->getById($categoryId);

      return Inertia::render('Dashboard/Categories/LaundryServices/Import', [
        'category' => (new CategoryResource($category))->resolve(),
        'type' => 'laundry_service',
        'config' => config('import-export.models.laundry_service'),
      ]);
    } catch (\Exception $e) {
      return redirect()->route('categories.show', $categoryId)
        ->with('error', 'Failed to load import page: ' . $e->getMessage());
    }
  }

  /**
   * Download template
   */
  public function downloadTemplate(int $categoryId)
  {
    try {
      $category = $this->categoryService->getById($categoryId);

      $filePath = $this->templateGenerator->generate('laundry_service', [
        'category_id' => $category->id,
      ]);

      $fileName = 'Template_Import_Layanan_' . $category->slug . '.xlsx';

      return response()->download($filePath, $fileName)->deleteFileAfterSend();
    } catch (\Exception $e) {
      Log::error('Failed to generate laundry service template:', [
        'category_id' => $categoryId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return back()->with('error', 'Failed to generate template: ' . $e->getMessage());
    }
  }

  /**
   * Process upload & show preview
   */
  public function upload(UploadLaundryServiceRequest $request, int $categoryId)
  {
    try {
      $category = $this->categoryService->getById($categoryId);

      $file = $request->file('file');
      $type = $request->input('type', 'laundry_service');

      Log::info('Laundry service upload started:', [
        'category_id' => $category->id,
        'file_name' => $file->getClientOriginalName(),
        'type' => $type,
        'file_size' => $file->getSize(),
      ]);

      // Preview data
      $previewData = $this->importService->preview($file, $type, [
        'category_id' => $category->id,
      ]);

      Log::info('Laundry Service Preview Data:', [
        'type' => $type,
        'category_id' => $category->id,
        'preview_count' => count($previewData['preview']),
        'error_count' => count($previewData['errors']),
        'total_rows' => $previewData['total_rows'],
      ]);

      // Store temp file
      $tempPath = $file->store('temp-imports', 'local');
      Session::put('laundry_service_import_temp_file', $tempPath);
      Session::put('laundry_service_import_file_name', $file->getClientOriginalName());
      Session::put('laundry_service_import_category_id', $category->id);
      Session::put('laundry_service_import_type', $type);

      return Inertia::render('Dashboard/Categories/LaundryServices/Preview', [
        'category' => (new CategoryResource($category))->resolve(),
        'type' => 'laundry_service',
        'preview' => $previewData['preview'],
        'errors' => $previewData['errors'],
        'total_rows' => $previewData['total_rows'],
        'has_more' => $previewData['has_more'],
        'file_name' => $file->getClientOriginalName(),
      ]);
    } catch (\Exception $e) {
      Log::error('Laundry service upload error:', [
        'category_id' => $categoryId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return redirect()->back()
        ->with('error', 'Preview failed: ' . $e->getMessage());
    }
  }

  /**
   * Confirm & start import
   */
  public function confirm(int $categoryId)
  {
    try {
      $category = $this->categoryService->getById($categoryId);

      $tempPath = Session::get('laundry_service_import_temp_file');
      $fileName = Session::get('laundry_service_import_file_name');
      $sessionCategoryId = Session::get('laundry_service_import_category_id');

      // Validate session
      if (!$tempPath || !Storage::disk('local')->exists($tempPath)) {
        return redirect()->route('categories.laundry-services.import.create', $categoryId)
          ->with('error', 'Import session expired. Please upload again.');
      }

      if ($sessionCategoryId != $categoryId) {
        return redirect()->route('categories.laundry-services.import.create', $categoryId)
          ->with('error', 'Invalid category. Please upload again.');
      }

      $fullPath = Storage::disk('local')->path($tempPath);

      if (!file_exists($fullPath)) {
        return redirect()->route('categories.laundry-services.import.create', $categoryId)
          ->with('error', 'File not found. Please upload again.');
      }

      // Create UploadedFile instance
      $file = new UploadedFile(
        $fullPath,
        $fileName,
        mime_content_type($fullPath),
        null,
        true
      );

      Log::info('Starting laundry service import:', [
        'category_id' => $category->id,
        'file_name' => $fileName,
      ]);

      // Start import job
      $log = $this->importService->startImport($file, 'laundry_service', [
        'category_id' => $category->id,
      ]);

      // Clear session
      Session::forget([
        'laundry_service_import_temp_file',
        'laundry_service_import_file_name',
        'laundry_service_import_category_id',
        'laundry_service_import_type'
      ]);

      // Delete temp file
      Storage::disk('local')->delete($tempPath);

      return redirect()->route('categories.laundry-services.import.result', [
        'categoryId' => $categoryId,
        'importId' => $log->id
      ])->with('success', 'Import started successfully. Processing in background...');
    } catch (\Exception $e) {
      Log::error('Laundry service confirm error:', [
        'category_id' => $categoryId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return redirect()->back()
        ->with('error', 'Import failed: ' . $e->getMessage());
    }
  }

  /**
   * Show result page
   */
  public function result(int $categoryId, string $importId)
  {
    try {
      $category = $this->categoryService->getById($categoryId);

      $importLog = ImportLog::with('errors')
        ->byUserId(Auth::id())
        ->byType('laundry_service')
        ->findOrFail($importId);

      return Inertia::render('Dashboard/Categories/LaundryServices/Result', [
        'category' => (new CategoryResource($category))->resolve(),
        'importLog' => (new ImportLogResource($importLog))->resolve(),
      ]);
    } catch (\Exception $e) {
      Log::error('Failed to load laundry service import result:', [
        'category_id' => $categoryId,
        'import_id' => $importId,
        'error' => $e->getMessage(),
      ]);

      return redirect()->route('categories.show', $categoryId)
        ->with('error', 'Import not found');
    }
  }

  /**
   * Get import status (for polling)
   */
  public function status(int $categoryId, string $importId)
  {
    try {
      $status = $this->importService->getStatus($importId);

      return response()->json([
        'success' => true,
        'data' => $status,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'error' => 'Import not found',
      ], 404);
    }
  }

  /**
   * Cancel import
   */
  public function cancel(int $categoryId, string $importId)
  {
    try {
      $log = ImportLog::where('user_id', Auth::id())
        ->where('type', 'laundry_service')
        ->where('status', 'processing')
        ->findOrFail($importId);

      $log->update(['status' => 'cancelled']);

      Log::info('Laundry service import cancelled:', [
        'category_id' => $categoryId,
        'import_id' => $importId,
      ]);

      return redirect()->route('categories.show', $categoryId)
        ->with('success', 'Import cancelled successfully');
    } catch (\Exception $e) {
      return redirect()->back()
        ->with('error', 'Failed to cancel import');
    }
  }
}
