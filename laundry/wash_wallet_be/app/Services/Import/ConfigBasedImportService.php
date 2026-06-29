<?php

namespace App\Services\Import;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ConfigBasedImportService extends BaseImportService
{
  public function __construct(
    protected string $type,
    array $context = []
  ) {
    $this->config = config("import-export.models.{$type}");

    if (!$this->config) {
      throw new \InvalidArgumentException("Invalid import type: {$type}");
    }

    $this->context = $context;
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

  protected function parseRow(array $row, array $headers): array
  {
    $data = [];

    foreach ($this->config['columns'] as $excelColumn => $columnConfig) {
      $headerIndex = array_search($excelColumn, $headers);

      if ($headerIndex !== false && isset($row[$headerIndex])) {
        $value = trim($row[$headerIndex]);

        if ($value === '' || $value === null) {
          if (isset($columnConfig['default'])) {
            $data[$columnConfig['field']] = $columnConfig['default'];
          }
          continue;
        }

        if (($columnConfig['type'] ?? null) === 'relation') {
          $value = $this->resolveRelation($value, $columnConfig);

          if ($value === null && $columnConfig['required']) {
            throw new \Exception("Relation not found: {$excelColumn} = {$row[$headerIndex]}");
          }
        }

        $data[$columnConfig['field']] = $value;
      } elseif (isset($columnConfig['default'])) {
        $data[$columnConfig['field']] = $columnConfig['default'];
      }
    }

    $data = $this->applyAutoFill($data);

    return $data;
  }

  protected function applyAutoFill(array $data): array
  {
    $autoFill = $this->config['auto_fill'] ?? [];

    foreach ($autoFill as $field => $source) {
      if (isset($data[$field])) {
        continue;
      }

      if ($source === 'auth_user_id') {
        $data[$field] = Auth::id();
      } elseif (str_starts_with($source, 'route_param:')) {
        $param = str_replace('route_param:', '', $source);
        $data[$field] = $this->context[$param] ?? null;
      }
    }

    return $data;
  }

  protected function resolveRelation($value, array $config): ?int
  {
    $model = app($config['relation_model']);
    $field = $config['relation_field'];

    $query = $model->where($field, $value);

    if (isset($config['relation_scope'])) {
      foreach ($config['relation_scope'] as $scopeField => $scopeValue) {
        if (str_starts_with($scopeValue, 'route_param:')) {
          $param = str_replace('route_param:', '', $scopeValue);
          $scopeValue = $this->context[$param] ?? null;
        }

        if ($scopeValue !== null) {
          $query->where($scopeField, $scopeValue);
        }
      }
    }

    $result = $query->first();

    return $result?->id;
  }

  protected function processRow(array $row, array $headers, int $rowNumber): bool
  {
    try {
      $data = $this->parseRow($row, $headers);

      $data = $this->transformData($data);

      $this->applyTenantScope($data);

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
    $model = app($this->config['model']);

    if ($existingId) {
      $model->find($existingId)->update($data);
    } else {
      $model->create($data);
    }
  }
}
