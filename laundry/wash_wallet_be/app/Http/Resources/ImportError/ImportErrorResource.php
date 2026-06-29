<?php

namespace App\Http\Resources\ImportError;

use App\Http\Resources\ImportLog\ImportLogResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ImportErrorResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'importLogId' => (int) $this->import_log_id,
            'rowNumber' => (int) $this->row_number,
            'data' => (array) $this->data,
            'errors' => (array) $this->errors,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),

            // Computed properties
            'formattedErrors' => $this->getFormattedErrors(),
            'hasMultipleErrors' => (bool) $this->hasMultipleErrors(),
            'errorCount' => (int) $this->getErrorCount(),

            // Formatted values
            'formattedRowNumber' => (string) ('Baris ' . $this->row_number),
            'firstError' => $this->getFirstError() ? (string) $this->getFirstError() : null,
            'errorSummary' => (string) $this->getErrorSummary(),

            // Relationships
            'importLog' => ImportLogResource::make($this->whenLoaded('importLog')),
        ];
    }

    /**
     * Get first error message
     */
    private function getFirstError(): ?string
    {
        if (empty($this->errors)) {
            return null;
        }

        return is_array($this->errors) ? ($this->errors[0] ?? null) : $this->errors;
    }

    /**
     * Get error summary
     */
    private function getErrorSummary(): string
    {
        $count = $this->getErrorCount();

        if ($count === 0) {
            return 'Tidak ada error';
        }

        if ($count === 1) {
            return '1 error';
        }

        return "{$count} errors";
    }
}
