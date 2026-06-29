<?php

namespace App\Http\Controllers\Import;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Http\Controllers\Controller;
use App\Http\Requests\Outlet\UploadOutletRequest;
use App\Http\Resources\ImportLog\ImportLogResource;
use App\Services\Import\ImportService;
use App\Services\Export\TemplateGenerator;
use App\Models\ImportLog;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;


#[Middleware('auth')]
class OutletImportController extends Controller
{
    public function __construct(protected readonly ImportService $importService, protected readonly TemplateGenerator $templateGenerator) {}

    /**
     *  Show upload page
     */
    public function index()
    {
        return Inertia::render('Dashboard/Outlets/Import', [
            'type' => 'outlet',
            'config' => config('import-export.models.outlet'),
        ]);
    }

    /**
     * Download template
     */
    public function downloadTemplate()
    {
        try {
            $filePath = $this->templateGenerator->generate('outlet');
            $fileName = 'Template_Import_Outlet.xlsx';

            return response()->download($filePath, $fileName)->deleteFileAfterSend();
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to generate template: ' . $e->getMessage());
        }
    }

    /**
     *  Process upload & show preview
     */
    public function upload(UploadOutletRequest $request)
    {
        try {
            $file = $request->file('file');
            $type = $request->input('type', 'outlet');
            $previewData = $this->importService->preview($file, $type, [
                'owner_id' => Auth::id(),
            ]);

            $tempPath = $file->store('temp-imports', 'local');
            Session::put('import_temp_file', $tempPath);
            Session::put('import_file_name', $file->getClientOriginalName());
            Session::put('import_type', $type);

            return Inertia::render('Dashboard/Outlets/Preview', [
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
     *  Confirm & start import
     */
    public function confirm()
    {
        try {
            $tempPath = Session::get('import_temp_file');
            $fileName = Session::get('import_file_name');

            if (!$tempPath || !Storage::disk('local')->exists($tempPath)) {
                return redirect()->route('outlets.import.create')
                    ->with('error', 'Import session expired. Please upload again.');
            }

            $fullPath = Storage::disk('local')->path($tempPath);

            if (!file_exists($fullPath)) {
                return redirect()->route('outlets.import.index')
                    ->with('error', 'File not found. Please upload again.');
            }

            $file = new UploadedFile(
                $fullPath,
                $fileName,
                mime_content_type($fullPath),
                null,
                true
            );

            $log = $this->importService->startImport($file, 'outlet', [
                'owner_id' => Auth::id(),
            ]);

            Session::forget(['import_temp_file', 'import_file_name']);
            Storage::disk('local')->delete($tempPath);

            return redirect()->route('outlets.import.result', ['importId' => $log->id])
                ->with('success', 'Import started successfully. Processing in background...');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

    /**
     *  Show result page
     */
    public function result(string $importId)
    {
        try {
            $importLog = ImportLog::with('errors')
                ->byUserId(Auth::id())
                ->byType('outlet')
                ->findOrFail($importId);

            return Inertia::render(
                'Dashboard/Outlets/Result',
                [
                    'importLog' => (new ImportLogResource($importLog))->resolve(),
                ]
            );
        } catch (\Exception $e) {
            return redirect()->route('outlets.index')
                ->with('error', 'Import not found');
        }
    }

    /**
     * Get import status (for polling)
     */
    public function status(string $importId)
    {
        try {
            $log = ImportLog::where('user_id', Auth::id())
                ->where('type', 'outlet')
                ->findOrFail($importId);

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
    public function cancel(string $importId)
    {
        try {
            $log = ImportLog::where('user_id', Auth::id())
                ->where('type', 'outlet')
                ->where('status', 'processing')
                ->findOrFail($importId);

            $log->update(['status' => 'cancelled']);

            return redirect()->route('outlets.index')
                ->with('success', 'Import cancelled successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to cancel import');
        }
    }
}
