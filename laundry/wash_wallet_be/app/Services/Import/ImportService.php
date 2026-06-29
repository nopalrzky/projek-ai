<?php

namespace App\Services\Import;

use App\Models\ImportLog;
use App\Jobs\ProcessImportJob;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportService
{

  public function preview(UploadedFile $file, string $type, array $context = []): array
  {
    $config = config("import-export.models.{$type}");

    if (!$config || !$config['enabled']) {
      throw new \InvalidArgumentException("Invalid import type: {$type}");
    }

    try {
      $sheetName = $config['template']['sheet_name'] ?? 'Data';
      $spreadsheet = IOFactory::load($file->getPathname());

      $sheet = $this->findSheet($spreadsheet, $sheetName, $config);

      $rows = $sheet->toArray(null, true, true, true);
      $rows = array_filter($rows, fn($row) => !empty(array_filter($row, fn($cell) => $cell !== null && $cell !== '')));

      if (empty($rows)) {
        throw new \Exception("Excel file is empty or has no data");
      }

      $headers = array_values(array_filter(array_shift($rows)));
      $cleanHeaders = array_map(fn($h) => trim(str_replace('*', '', $h)), $headers);

      $expectedHeaders = array_keys($config['columns']);
      $this->validateHeaders($cleanHeaders, $expectedHeaders);

      $preview = [];
      $errors = [];
      $rowNumber = 2;

      $serviceClass = $config['service'];
      $service = new $serviceClass();

      $previewContext = array_merge($context, [
        'owner_id' => Auth::id(),
      ]);
      $service->setContext($previewContext);

      $previewLimit = 10;
      $processedCount = 0;

      foreach ($rows as $row) {
        $rowData = array_values($row);

        if (empty(array_filter($rowData, fn($cell) => $cell !== null && $cell !== ''))) {
          $rowNumber++;
          continue;
        }

        try {
          $data = $service->parseRowForPreview($rowData, $headers);
          $data = $service->transformDataForPreview($data);
          $validation = $service->validateRowForPreview($data, false);

          if ($validation['valid']) {
            if ($processedCount < $previewLimit) {
              $preview[] = $data;
              $processedCount++;
            }
          } else {
            $errors[] = [
              'row' => $rowNumber,
              'data' => $data,
              'errors' => $validation['errors'],
            ];
          }
        } catch (\Exception $e) {
          $errors[] = [
            'row' => $rowNumber,
            'data' => $rowData,
            'errors' => [$e->getMessage()],
          ];
        }

        $rowNumber++;
      }

      Log::info('Preview completed', [
        'type' => $type,
        'total_rows' => count($rows),
        'valid' => count($preview),
        'errors' => count($errors),
      ]);

      return [
        'preview' => $preview,
        'errors' => $errors,
        'total_rows' => count($rows),
        'has_more' => count($rows) > $previewLimit,
      ];
    } catch (\Exception $e) {
      Log::error("Preview failed: " . $e->getMessage());
      throw $e;
    }
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
          if (stripos($actual, $expected) !== false) {
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

  protected function validateHeaders(array $actualHeaders, array $expectedHeaders): void
  {
    $missingHeaders = [];

    foreach ($expectedHeaders as $expected) {
      $found = false;
      foreach ($actualHeaders as $actual) {
        $cleanActual = strtolower(trim(str_replace('*', '', $actual)));
        $cleanExpected = strtolower(trim($expected));

        if ($cleanActual === $cleanExpected) {
          $found = true;
          break;
        }
      }
      if (!$found) {
        $missingHeaders[] = $expected;
      }
    }

    if (!empty($missingHeaders)) {
      throw new \Exception(
        "Missing required columns: " . implode(', ', $missingHeaders) . "\n" .
          "Found headers: " . implode(', ', $actualHeaders)
      );
    }
  }

  public function startImport(UploadedFile $file, string $type, array $context = []): ImportLog
  {
    $config = config("import-export.models.{$type}");

    if (!$config || !$config['enabled']) {
      throw new \InvalidArgumentException("Import type not available: {$type}");
    }

    $path = $file->store('imports', 'local');

    $log = ImportLog::create([
      'user_id' => Auth::id(),
      'type' => $type,
      'file_name' => $file->getClientOriginalName(),
      'file_path' => $path,
      'status' => 'pending',
      'context' => $context,
    ]);

    ProcessImportJob::dispatch($log->id, $type, $context);

    return $log;
  }

  public function getStatus(string $logId): array
  {
    $log = ImportLog::with('errors')->findOrFail($logId);

    return [
      'id' => $log->id,
      'status' => $log->status,
      'total_rows' => $log->total_rows,
      'success_count' => $log->success_count,
      'error_count' => $log->error_count,
      'progress_percentage' => $log->total_rows > 0
        ? round(($log->success_count + $log->error_count) / $log->total_rows * 100, 2)
        : 0,
      'started_at' => $log->started_at?->format('Y-m-d H:i:s'),
      'completed_at' => $log->completed_at?->format('Y-m-d H:i:s'),
      'errors' => $log->errors->take(100)->map(fn($error) => [
        'row' => $error->row_number,
        'data' => $error->data,
        'errors' => $error->errors,
      ]),
    ];
  }
}
