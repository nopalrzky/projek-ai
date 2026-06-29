<?php

namespace App\Services\Import;

use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategoryImportService extends BaseImportService
{
    public function __construct()
    {
        $this->config = config('import-export.models.category');

        if (!$this->config) {
            throw new \InvalidArgumentException("Category import configuration not found");
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
                            $value = (int)$value;
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

        if (empty($data['code'])) {
            $data['code'] = Str::slug($data['name'] ?? '');
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

    protected function findExisting(array $data): ?int
    {
        if (!isset($data['name']) || !isset($data['outlet_id'])) {
            return null;
        }

        $existing = Category::where('name', $data['name'])
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
                Category::where('id', $existingId)->update($data);
            } else {
                Category::create($data);
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