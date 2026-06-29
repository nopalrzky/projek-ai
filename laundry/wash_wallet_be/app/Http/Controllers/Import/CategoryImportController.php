<?php

namespace App\Http\Controllers\Import;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Http\Controllers\Controller;
use App\Http\Requests\Outlet\Category\UploadCategoryRequest;
use App\Http\Resources\ImportLog\ImportLogResource;
use App\Http\Resources\Outlet\OutletResource;
use App\Services\Import\ImportService;
use App\Services\Export\TemplateGenerator;
use App\Models\ImportLog;
use App\Services\OutletService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;


#[Middleware('auth')]
class CategoryImportController extends Controller
{
    public function __construct(protected readonly ImportService $importService, protected readonly OutletService $outletService, protected readonly TemplateGenerator $templateGenerator) {}

    /**
     * Show upload page
     */
    public function create(int $outletId)
    {
        $outlet = $this->outletService->getById($outletId);
        return Inertia::render('Dashboard/Outlets/Categories/Import', [
            'outlet' => (new OutletResource($outlet))->resolve(),
            'type' => 'category',
            'config' => config('import-export.models.category'),
        ]);
    }

    /**
     * Download template
     */
    public function downloadTemplate(?int $outletId = null)
    {
        try {
            $filePath = $this->templateGenerator->generate('category');
            $fileName = 'Template_Import_Kategori.xlsx';

            return response()->download($filePath, $fileName)->deleteFileAfterSend();
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to generate template: ' . $e->getMessage());
        }
    }

    /**
     * Process upload & show preview
     */
    public function upload(UploadCategoryRequest $request, int $outletId)
    {
        $outlet = $this->outletService->getById($outletId);
        try {
            $file = $request->file('file');
            $type = $request->input('type', 'category');
            $previewData = $this->importService->preview($file, $type, [
                'outlet_id' => $outlet->id,
            ]);


            $tempPath = $file->store('temp-imports', 'local');
            Session::put('category_import_temp_file', $tempPath);
            Session::put('category_import_file_name', $file->getClientOriginalName());
            Session::put('category_import_outlet_id', $outlet->id);
            Session::put('category_import_type', $type);

            return Inertia::render('Dashboard/Outlets/Categories/Preview', [
                'outlet' => (new OutletResource($outlet))->resolve(),
                'type' => 'category',
                'preview' => $previewData['preview'],
                'errors' => $previewData['errors'],
                'total_rows' => $previewData['total_rows'],
                'has_more' => $previewData['has_more'],
                'file_name' => $file->getClientOriginalName(),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Preview failed: ' . $e->getMessage());
        }
    }

    /**
     * Confirm & start import
     */
    public function confirm(int $outletId)
    {
        try {
            $outlet = $this->outletService->getById($outletId);

            $tempPath = Session::get('category_import_temp_file');
            $fileName = Session::get('category_import_file_name');
            $sessionOutletId = Session::get('category_import_outlet_id');

            if (!$tempPath || !Storage::disk('local')->exists($tempPath)) {
                return redirect()->route('outlets.categories.import.create', $outlet)
                    ->with('error', 'Import session expired. Please upload again.');
            }

            if ($sessionOutletId != $outlet->id) {
                return redirect()->route('outlets.categories.import.create', $outlet)
                    ->with('error', 'Invalid outlet. Please upload again.');
            }

            $fullPath = Storage::disk('local')->path($tempPath);

            if (!file_exists($fullPath)) {
                return redirect()->route('outlets.categories.import.create', $outlet)
                    ->with('error', 'File not found. Please upload again.');
            }

            $file = new \Illuminate\Http\UploadedFile(
                $fullPath,
                $fileName,
                mime_content_type($fullPath),
                null,
                true
            );

            $log = $this->importService->startImport($file, 'category', [
                'outlet_id' => $outlet->id,
            ]);

            Session::forget(['category_import_temp_file', 'category_import_file_name', 'category_import_outlet_id']);
            Storage::disk('local')->delete($tempPath);

            return redirect()->route('outlets.categories.import.result', [
                'outletId' => $outletId,
                'importId' => $log->id
            ])->with('success', 'Import started successfully. Processing in background...');
        } catch (\Exception $e) {
            Log::error('Category confirm error:', [
                'outlet_id' => $outletId,
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
    public function result(int $outletId, string $importId)
    {
        try {
            $outlet = $this->outletService->getById($outletId);
            $importLog = ImportLog::with('errors')
                ->byUserId(Auth::id())
                ->byType('category')
                ->findOrFail($importId);

            return Inertia::render('Dashboard/Outlets/Categories/Result', [
                'outlet' => (new OutletResource($outlet))->resolve(),
                'importLog' => (new ImportLogResource($importLog))->resolve(),
            ]);
        } catch (\Exception $e) {
            return redirect()->route('outlets.show', $outlet)
                ->with('error', 'Import not found');
        }
    }

    /**
     * Get import status (for polling)
     */
    public function status(string $importId)
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
     * Cancel import (optional)
     */
    public function cancel(int $outletId, string $importId)
    {
        try {
            $log = ImportLog::where('user_id', Auth::id())
                ->where('type', 'category')
                ->where('status', 'processing')
                ->findOrFail($importId);

            $log->update(['status' => 'cancelled']);

            return redirect()->route('outlets.show', $outletId)
                ->with('success', 'Import cancelled successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to cancel import');
        }
    }
}
