<?php

namespace App\Services\Import;

use App\Models\Customer;
use Illuminate\Support\Facades\DB;

class CustomerImportService extends BaseImportService
{
  public function __construct()
  {
    $this->config = config('import-export.models.customer');

    if (!$this->config) {
      throw new \InvalidArgumentException("Customer import configuration not found");
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
            } elseif ($columnConfig['type'] === 'string' && $columnConfig['field'] === 'gender') {
              $value = $this->parseGenderValue($value);
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

    $outletId = $this->context['outlet_id'] ?? null;

    if (!$outletId) {
      throw new \Exception('Outlet ID not found in import context');
    }

    $data['outlet_id'] = $outletId;

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

  protected function parseGenderValue($value): ?string
  {
    if (empty($value)) {
      return null;
    }

    $valueStr = strtolower(trim((string)$value));

    $genderMap = [
      'laki-laki' => 'male',
      'laki' => 'male',
      'l' => 'male',
      'male' => 'male',
      'm' => 'male',
      'perempuan' => 'female',
      'wanita' => 'female',
      'p' => 'female',
      'female' => 'female',
      'f' => 'female',
    ];

    return $genderMap[$valueStr] ?? null;
  }

  protected function findExisting(array $data): ?int
  {
    if (!isset($data['phone']) || !isset($data['outlet_id'])) {
      return null;
    }

    $existing = Customer::where('phone', $data['phone'])
      ->where('outlet_id', $data['outlet_id'])
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
        Customer::where('id', $existingId)->update($data);
      } else {
        Customer::create($data);
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
