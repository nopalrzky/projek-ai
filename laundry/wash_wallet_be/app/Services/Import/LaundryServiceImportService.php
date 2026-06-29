<?php

namespace App\Services\Import;

use App\Models\LaundryService;
use App\Models\Unit;
use Illuminate\Support\Facades\DB;

class LaundryServiceImportService extends BaseImportService
{
  public function __construct()
  {
    $this->config = config('import-export.models.laundry_service');

    if (!$this->config) {
      throw new \InvalidArgumentException("Laundry service import configuration not found");
    }
  }

  protected function parseRow(array $row, array $headers): array
  {
    $data = [];
    $headerMap = $this->buildHeaderMap($headers);

    foreach ($this->config['columns'] as $excelColumn => $columnConfig) {
      $cleanExpected = $this->cleanHeader($excelColumn);

      if (isset($headerMap[$cleanExpected])) {
        $headerIndex = $headerMap[$cleanExpected];
        $value = $row[$headerIndex] ?? null;

        if ($value !== null && $value !== '') {
          $value = trim((string)$value);

          if (isset($columnConfig['type'])) {
            if ($columnConfig['type'] === 'boolean') {
              $value = $this->parseBooleanValue($value);
            } elseif ($columnConfig['type'] === 'number') {
              $value = $this->parseNumberValue($value);
            }
          }

          $data[$columnConfig['field']] = $value;
        } elseif (isset($columnConfig['default'])) {
          $data[$columnConfig['field']] = $columnConfig['default'];
        }
      } elseif (isset($columnConfig['default'])) {
        $data[$columnConfig['field']] = $columnConfig['default'];
      }
    }

    $categoryId = $this->context['category_id'] ?? null;

    if (!$categoryId) {
      throw new \Exception('Category ID not found in import context');
    }

    $data['category_id'] = $categoryId;

    if (isset($data['unit_name'])) {
      $unit = Unit::where('name', $data['unit_name'])->first();
      if ($unit) {
        $data['unit_id'] = $unit->id;
      }
      unset($data['unit_name']);
    }

    if (isset($data['name'])) {
      $data['slug'] = LaundryService::generateUniqueSlug($data['name'], $categoryId);
    }

    if (!isset($data['min_quantity']) || $data['min_quantity'] === null) {
      $data['min_quantity'] = 1;
    }

    if (!isset($data['is_active'])) {
      $data['is_active'] = true;
    }

    return $data;
  }

  protected function buildHeaderMap(array $headers): array
  {
    $map = [];
    foreach ($headers as $index => $header) {
      $cleanHeader = $this->cleanHeader($header);
      $map[$cleanHeader] = $index;
    }
    return $map;
  }

  protected function cleanHeader(string $header): string
  {
    return strtolower(trim(str_replace('*', '', $header)));
  }

  protected function parseBooleanValue($value): bool
  {
    if (is_bool($value)) {
      return $value;
    }

    $valueStr = strtolower(trim((string)$value));
    return in_array($valueStr, ['aktif', 'active', '1', 'true', 'ya', 'yes', 'y'], true);
  }

  protected function parseNumberValue($value)
  {
    $value = str_replace(['.', ',', ' ', 'Rp'], '', (string)$value);
    return is_numeric($value) ? (float)$value : 0;
  }

  protected function findExisting(array $data): ?int
  {
    if (!isset($data['name']) || !isset($data['category_id'])) {
      return null;
    }

    $existing = LaundryService::where('category_id', $data['category_id'])
      ->where('name', $data['name'])
      ->first();

    return $existing?->id;
  }

  public function processRow(array $row, array $headers, int $rowNumber): bool
  {
    try {
      $data = $this->parseRow($row, $headers);
      $data = $this->transformData($data);
      $existingId = $this->findExisting($data);
      $validation = $this->validateRow($data, $existingId !== null);

      if (!$validation['valid']) {
        $this->logError($rowNumber, $data, $validation['errors']);
        return false;
      }

      $data = $this->encryptSensitiveData($data);
      $this->upsertData($data, $existingId);
      $this->logSuccess();

      return true;
    } catch (\Exception $e) {
      $this->logError($rowNumber, $row, [$e->getMessage()]);
      return false;
    }
  }

  protected function upsertData(array $data, ?int $existingId): void
  {
    DB::transaction(function () use ($data, $existingId) {
      if ($existingId) {
        LaundryService::where('id', $existingId)->update($data);
      } else {
        LaundryService::create($data);
      }
    });
  }

  public function parseRowForPreview(array $row, array $headers): array
  {
    return $this->parseRow($row, $headers);
  }

  public function validateRowForPreview(array $data, bool $isUpdate = false): array
  {
    return $this->validateRow($data, $isUpdate);
  }

  public function transformDataForPreview(array $data): array
  {
    return $this->transformData($data);
  }
}
