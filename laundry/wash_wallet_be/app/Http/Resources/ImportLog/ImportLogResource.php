<?php

namespace App\Http\Resources\ImportLog;

use App\Http\Resources\ImportError\ImportErrorResource;
use App\Http\Resources\User\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ImportLogResource extends JsonResource
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
            'userId' => (int) $this->user_id,
            'type' => (string) $this->type,
            'fileName' => (string) $this->file_name,
            'filePath' => (string) $this->file_path,
            'status' => (string) $this->status,
            'totalRows' => (int) $this->total_rows,
            'successCount' => (int) $this->success_count,
            'errorCount' => (int) $this->error_count,
            'context' => $this->context ? (array) $this->context : null,
            'errorMessage' => $this->error_message ? (string) $this->error_message : null,
            'startedAt' => $this->started_at?->toISOString(),
            'completedAt' => $this->completed_at?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),

            // Computed properties
            'progressPercentage' => (float) $this->getProgressPercentage(),
            'durationInSeconds' => $this->getDurationInSeconds() !== null ? (int) $this->getDurationInSeconds() : null,
            'hasErrors' => (bool) $this->hasErrors(),
            'isCompleted' => (bool) $this->isCompleted(),
            'isFailed' => (bool) $this->isFailed(),
            'isProcessing' => (bool) $this->isProcessing(),
            'isPending' => (bool) $this->isPending(),

            // Formatted values
            'formattedStatus' => (string) $this->getFormattedStatus(),
            'formattedDuration' => $this->getFormattedDuration() ? (string) $this->getFormattedDuration() : null,
            'formattedProgress' => (string) $this->getFormattedProgress(),

            // Relationships
            'user' => $this->whenLoaded('user', fn() => UserResource::make($this->user)),

            'errors' => ImportErrorResource::collection($this->whenLoaded('errors')),

            // Computed counts (when loaded)
            'errorsCount' => $this->whenLoaded('errors', fn() => $this->errors ? (int) $this->errors->count() : 0),
        ];
    }

    /**
     * Get formatted status
     */
    private function getFormattedStatus(): string
    {
        return match ($this->status) {
            'pending' => 'Menunggu',
            'processing' => 'Sedang Diproses',
            'completed' => 'Selesai',
            'failed' => 'Gagal',
            'cancelled' => 'Dibatalkan',
            default => ucfirst($this->status),
        };
    }

    /**
     * Get formatted duration
     */
    private function getFormattedDuration(): ?string
    {
        $seconds = $this->getDurationInSeconds();

        if ($seconds === null) {
            return null;
        }

        if ($seconds < 60) {
            return $seconds . ' detik';
        }

        $minutes = floor($seconds / 60);
        $remainingSeconds = $seconds % 60;

        if ($minutes < 60) {
            return $remainingSeconds > 0
                ? "{$minutes} menit {$remainingSeconds} detik"
                : "{$minutes} menit";
        }

        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;

        return $remainingMinutes > 0
            ? "{$hours} jam {$remainingMinutes} menit"
            : "{$hours} jam";
    }

    /**
     * Get formatted progress
     */
    private function getFormattedProgress(): string
    {
        return number_format($this->getProgressPercentage(), 1) . '%';
    }
}
