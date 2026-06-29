<?php

namespace App\Services\Import;

use App\Models\Outlet;
use Illuminate\Support\Facades\DB;

class OutletImportService extends BaseImportService
{
  public function __construct()
  {
    $this->config = config('import-export.models.outlet');

    if (!$this->config) {
      throw new \InvalidArgumentException("Outlet import configuration not found");
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

          if (isset($columnConfig['type']) && $columnConfig['type'] === 'boolean') {
            $value = $this->parseBooleanValue($value);
          }

          $data[$columnConfig['field']] = $value;
        } elseif (isset($columnConfig['default'])) {
          $data[$columnConfig['field']] = $columnConfig['default'];
        }
      } elseif (isset($columnConfig['default'])) {
        $data[$columnConfig['field']] = $columnConfig['default'];
      }
    }

    $ownerId = $this->context['owner_id'] ?? null;

    if (!$ownerId) {
      throw new \Exception('Owner ID not found in import context');
    }

    $data['owner_id'] = $ownerId;

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

  protected function findExisting(array $data): ?int
  {
    if (!isset($data['code'])) {
      return null;
    }

    $ownerId = $this->context['owner_id'] ?? $data['owner_id'] ?? null;

    if (!$ownerId) {
      return null;
    }

    $existing = Outlet::where('code', $data['code'])
      ->where('owner_id', $ownerId)
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
    $ownerId = $this->context['owner_id'] ?? $data['owner_id'] ?? null;

    DB::transaction(function () use ($data, $existingId, $ownerId) {
      if ($existingId) {
        Outlet::where('id', $existingId)
          ->where('owner_id', $ownerId)
          ->update($data);
      } else {
        Outlet::create($data);
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
