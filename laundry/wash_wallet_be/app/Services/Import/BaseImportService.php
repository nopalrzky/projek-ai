<?php

namespace App\Services\Import;

use App\Models\ImportLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Validator;

abstract class BaseImportService
{
  protected array $config;
  protected ImportLog $log;
  protected array $errors = [];
  protected int $successCount = 0;
  protected int $errorCount = 0;
  protected array $context = [];

  abstract protected function parseRow(array $row, array $headers): array;

  protected function validateRow(array $data, bool $isUpdate = false): array
  {
    $rules = $isUpdate
      ? ($this->config['update_validation'] ?? $this->config['validation'])
      : $this->config['validation'];

    if ($isUpdate && isset($data['id'])) {
      $rules = $this->replaceIdPlaceholder($rules, $data['id']);
    }

    $validator = Validator::make($data, $rules);

    return [
      'valid' => !$validator->fails(),
      'errors' => $validator->errors()->all()
    ];
  }

  protected function transformData(array $data): array
  {
    $transformers = $this->config['transformers'] ?? [];

    foreach ($transformers as $field => $transformer) {
      if (isset($data[$field]) && is_callable($transformer)) {
        $data[$field] = $transformer($data[$field]);
      }
    }

    return $data;
  }

  protected function encryptSensitiveData(array $data): array
  {
    $encryptFields = config('import-export.encrypt_fields', []);

    foreach ($this->config['columns'] as $columnConfig) {
      $field = $columnConfig['field'];
      $shouldEncrypt = $columnConfig['encrypt'] ?? in_array($field, $encryptFields);

      if ($shouldEncrypt && isset($data[$field]) && !empty($data[$field])) {
        try {
          $data[$field] = Crypt::encryptString($data[$field]);
        } catch (\Exception $e) {
          // Log error but continue
        }
      }
    }

    return $data;
  }

  protected function findExisting(array $data): ?int
  {
    $uniqueKeys = $this->config['unique_keys'] ?? [];

    if (empty($uniqueKeys)) {
      return null;
    }

    $model = app($this->config['model']);
    $query = $model->query();

    foreach ($uniqueKeys as $key) {
      if (isset($data[$key])) {
        $query->where($key, $data[$key]);
      }
    }

    $existing = $query->first();

    return $existing?->id;
  }

  protected function applyTenantScope(array &$data): void
  {
    if (!($this->config['tenant_scope'] ?? false)) {
      return;
    }

    $tenantField = $this->config['tenant_field'] ?? 'owner_id';

    if (!isset($data[$tenantField])) {
      if ($tenantField === 'owner_id') {
        $data[$tenantField] = Auth::id();
      }
    }
  }

  protected function logError(int $rowNumber, array $data, array $errors): void
  {
    $this->log->errors()->create([
      'row_number' => $rowNumber,
      'data' => $data,
      'errors' => $errors
    ]);

    $this->errorCount++;
    $this->log->increment('error_count');
  }

  protected function logSuccess(): void
  {
    $this->successCount++;
    $this->log->increment('success_count');
  }

  private function replaceIdPlaceholder(array $rules, int $id): array
  {
    return array_map(function ($rule) use ($id) {
      if (is_string($rule)) {
        return str_replace('{id}', $id, $rule);
      }
      return $rule;
    }, $rules);
  }

  public function setContext(array $context): self
  {
    $this->context = $context;
    return $this;
  }

  public function setLog(ImportLog $log): self
  {
    $this->log = $log;
    return $this;
  }
}
