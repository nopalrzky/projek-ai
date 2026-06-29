<?php

namespace App\Jobs;

use App\Models\ImportLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ProcessImportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 600;
    public $tries = 3;

    public function __construct(
        protected int $logId,
        protected string $type,
        protected array $context = []
    ) {}

    public function handle(): void
    {
        $log = ImportLog::findOrFail($this->logId);

        try {
            $log->markAsProcessing();

            $config = $this->getConfig($this->type);

            $filePath = Storage::disk('local')->path($log->file_path);

            if (!file_exists($filePath)) {
                throw new \Exception("Import file not found: {$filePath}");
            }

            $sheetName = $config['template']['sheet_name'] ?? 'Data';
            $spreadsheet = IOFactory::load($filePath);

            $sheet = $this->findSheet($spreadsheet, $sheetName, $config);

            $rows = $sheet->toArray(null, true, true, true);
            $rows = array_filter($rows, fn($row) => !empty(array_filter($row, fn($cell) => $cell !== null && $cell !== '')));

            if (empty($rows)) {
                throw new \Exception("Excel file is empty");
            }

            $headers = array_values(array_filter(array_shift($rows)));
            $log->update(['total_rows' => count($rows)]);

            $serviceClass = $config['service'];

            if (!class_exists($serviceClass)) {
                throw new \Exception("Import service class not found: {$serviceClass}");
            }

            $service = new $serviceClass();
            $service->setLog($log);

            $context = array_merge($this->context, [
                'owner_id' => $log->user_id,
            ]);
            $service->setContext($context);

            $chunkSize = config('import-export.chunk_size', 100);
            $chunks = array_chunk($rows, $chunkSize, true);

            foreach ($chunks as $chunk) {
                foreach ($chunk as $index => $row) {
                    $rowData = array_values($row);

                    if (empty(array_filter($rowData, fn($cell) => $cell !== null && $cell !== ''))) {
                        continue;
                    }

                    $rowNumber = $index + 2;
                    $service->processRow($rowData, $headers, $rowNumber);
                }
            }

            $log->markAsCompleted();
        } catch (\Exception $e) {
            Log::error("Import job failed", [
                'log_id' => $this->logId,
                'type' => $this->type,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $log->markAsFailed($e->getMessage());
            throw $e;
        }
    }

    protected function getConfig(string $type): array
    {
        $config = config("import-export.models.{$type}");

        if (!$config) {
            Artisan::call('config:clear');
            $config = config("import-export.models.{$type}");
        }

        if (!$config) {
            throw new \Exception(
                "Invalid import type: {$type}. Available types: " .
                    implode(', ', array_keys(config('import-export.models', [])))
            );
        }

        return $config;
    }

    protected function findSheet($spreadsheet, string $sheetName, array $config)
    {
        try {
            $sheet = $spreadsheet->getSheetByName($sheetName);
            if ($sheet) {
                return $sheet;
            }
        } catch (\Exception $e) {
        }

        $expectedHeaders = array_keys($config['columns']);

        foreach ($spreadsheet->getAllSheets() as $testSheet) {
            $firstRow = $testSheet->rangeToArray('A1:Z1', null, true, false, false)[0];
            $firstRow = array_filter($firstRow, fn($cell) => $cell !== null && $cell !== '');

            $matchCount = 0;

            foreach ($expectedHeaders as $expected) {
                foreach ($firstRow as $actual) {
                    $cleanExpected = strtolower(trim($expected));
                    $cleanActual = strtolower(trim(str_replace('*', '', $actual)));

                    if ($cleanActual === $cleanExpected || stripos($cleanActual, $cleanExpected) !== false) {
                        $matchCount++;
                        break;
                    }
                }
            }

            if ($matchCount >= count($expectedHeaders) * 0.5) {
                return $testSheet;
            }
        }

        return $spreadsheet->getSheet(0);
    }

    public function failed(\Throwable $exception): void
    {
        $log = ImportLog::find($this->logId);

        if ($log) {
            $log->markAsFailed($exception->getMessage());
        }
    }
}
