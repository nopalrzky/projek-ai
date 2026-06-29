<?php

namespace App\Http\Controllers\Import;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Http\Controllers\Controller;
use App\Http\Requests\Outlet\Customer\UploadCustomerRequest;
use App\Http\Resources\ImportLog\ImportLogResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Services\Import\ImportService;
use App\Services\Export\TemplateGenerator;
use App\Models\ImportLog;
use App\Services\OutletService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

#[Middleware('auth')]
class CustomerImportController extends Controller
{
  public function __construct(protected readonly ImportService $importService, protected readonly OutletService $outletService, protected readonly TemplateGenerator $templateGenerator) {}

  public function create(int $outletId)
  {
    try {
      $outlet = $this->outletService->getById($outletId);

      return Inertia::render('Dashboard/Outlets/Customers/Import', [
        'outlet' => (new OutletResource($outlet))->resolve(),
        'type' => 'customer',
        'config' => config('import-export.models.customer'),
      ]);
    } catch (\Exception $e) {
      return redirect()->route('outlets.show', $outletId)
        ->with('error', 'Failed to load import page: ' . $e->getMessage());
    }
  }

  public function downloadTemplate(int $outletId)
  {
    try {
      $outlet = $this->outletService->getById($outletId);

      $filePath = $this->templateGenerator->generate('customer', [
        'outlet_id' => $outlet->id,
      ]);

      $fileName = 'Template_Import_Customer_' . $outlet->slug . '.xlsx';

      return response()->download($filePath, $fileName)->deleteFileAfterSend();
    } catch (\Exception $e) {
      Log::error('Failed to generate customer template:', [
        'outlet_id' => $outletId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return back()->with('error', 'Failed to generate template: ' . $e->getMessage());
    }
  }

  public function upload(UploadCustomerRequest $request, int $outletId)
  {
    try {
      $outlet = $this->outletService->getById($outletId);

      $file = $request->file('file');
      $type = $request->input('type', 'customer');

      Log::info('Customer upload started:', [
        'outlet_id' => $outlet->id,
        'file_name' => $file->getClientOriginalName(),
        'type' => $type,
        'file_size' => $file->getSize(),
      ]);

      $previewData = $this->importService->preview($file, $type, [
        'outlet_id' => $outlet->id,
      ]);

      Log::info('Customer Preview Data:', [
        'type' => $type,
        'outlet_id' => $outlet->id,
        'preview_count' => count($previewData['preview']),
        'error_count' => count($previewData['errors']),
        'total_rows' => $previewData['total_rows'],
      ]);

      $tempPath = $file->store('temp-imports', 'local');
      Session::put('customer_import_temp_file', $tempPath);
      Session::put('customer_import_file_name', $file->getClientOriginalName());
      Session::put('customer_import_outlet_id', $outlet->id);
      Session::put('customer_import_type', $type);

      return Inertia::render('Dashboard/Outlets/Customers/Preview', [
        'outlet' => (new OutletResource($outlet))->resolve(),
        'type' => 'customer',
        'preview' => $previewData['preview'],
        'errors' => $previewData['errors'],
        'total_rows' => $previewData['total_rows'],
        'has_more' => $previewData['has_more'],
        'file_name' => $file->getClientOriginalName(),
      ]);
    } catch (\Exception $e) {
      Log::error('Customer upload error:', [
        'outlet_id' => $outletId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return redirect()->back()
        ->with('error', 'Preview failed: ' . $e->getMessage());
    }
  }

  public function confirm(int $outletId)
  {
    try {
      $outlet = $this->outletService->getById($outletId);

      $tempPath = Session::get('customer_import_temp_file');
      $fileName = Session::get('customer_import_file_name');
      $sessionOutletId = Session::get('customer_import_outlet_id');

      if (!$tempPath || !Storage::disk('local')->exists($tempPath)) {
        return redirect()->route('outlets.customers.import.create', $outletId)
          ->with('error', 'Import session expired. Please upload again.');
      }

      if ($sessionOutletId != $outletId) {
        return redirect()->route('outlets.customers.import.create', $outletId)
          ->with('error', 'Invalid outlet. Please upload again.');
      }

      $fullPath = Storage::disk('local')->path($tempPath);

      if (!file_exists($fullPath)) {
        return redirect()->route('outlets.customers.import.create', $outletId)
          ->with('error', 'File not found. Please upload again.');
      }

      $file = new UploadedFile(
        $fullPath,
        $fileName,
        mime_content_type($fullPath),
        null,
        true
      );

      Log::info('Starting customer import:', [
        'outlet_id' => $outlet->id,
        'file_name' => $fileName,
      ]);

      $log = $this->importService->startImport($file, 'customer', [
        'outlet_id' => $outlet->id,
      ]);

      Session::forget([
        'customer_import_temp_file',
        'customer_import_file_name',
        'customer_import_outlet_id',
        'customer_import_type'
      ]);

      Storage::disk('local')->delete($tempPath);

      return redirect()->route('outlets.customers.import.result', [
        'outletId' => $outletId,
        'importId' => $log->id
      ])->with('success', 'Import started successfully. Processing in background...');
    } catch (\Exception $e) {
      Log::error('Customer confirm error:', [
        'outlet_id' => $outletId,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return redirect()->back()
        ->with('error', 'Import failed: ' . $e->getMessage());
    }
  }

  public function result(int $outletId, string $importId)
  {
    try {
      $outlet = $this->outletService->getById($outletId);

      $importLog = ImportLog::with('errors')
        ->byUserId(Auth::id())
        ->byType('customer')
        ->findOrFail($importId);

      return Inertia::render('Dashboard/Outlets/Customers/Result', [
        'outlet' => (new OutletResource($outlet))->resolve(),
        'importLog' => (new ImportLogResource($importLog))->resolve(),
      ]);
    } catch (\Exception $e) {
      Log::error('Failed to load customer import result:', [
        'outlet_id' => $outletId,
        'import_id' => $importId,
        'error' => $e->getMessage(),
      ]);

      return redirect()->route('outlets.show', $outletId)
        ->with('error', 'Import not found');
    }
  }

  public function status(int $outletId, string $importId)
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

  public function cancel(int $outletId, string $importId)
  {
    try {
      $log = ImportLog::where('user_id', Auth::id())
        ->where('type', 'customer')
        ->where('status', 'processing')
        ->findOrFail($importId);

      $log->update(['status' => 'cancelled']);

      Log::info('Customer import cancelled:', [
        'outlet_id' => $outletId,
        'import_id' => $importId,
      ]);

      return redirect()->route('outlets.show', $outletId)
        ->with('success', 'Import cancelled successfully');
    } catch (\Exception $e) {
      return redirect()->back()
        ->with('error', 'Failed to cancel import');
    }
  }
}
