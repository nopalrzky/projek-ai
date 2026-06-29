<?php

namespace App\Http\Resources\PayrollItem;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isEarning = $this->type === 'earning';

        return [
            'id'             => (int) $this->id,
            'payrollId'      => (int) $this->payroll_id,
            'name'           => (string) $this->name,
            'type'           => (string) $this->type,
            'category'       => (string) $this->category,
            'amount'         => (float) $this->amount,
            'referenceType'  => $this->reference_type ? (string) $this->reference_type : null,
            'referenceId'    => $this->reference_id ? (int) $this->reference_id : null,
            'createdAt'      => $this->created_at?->toISOString(),
            'updatedAt'      => $this->updated_at?->toISOString(),

            'formattedAmount' => (string) ('Rp ' . number_format($this->amount, 0, ',', '.')),
            'typeLabel'       => (string) ($isEarning ? 'Pemasukan' : 'Potongan'),
            'typeColor'       => (string) ($isEarning ? 'success' : 'error'),
            'categoryLabel'   => (string) $this->getCategoryLabel(),
            'isEarning'       => (bool) $isEarning,
            'isDeduction'     => (bool) !$isEarning,
        ];
    }

    private function getCategoryLabel(): string
    {
        return match ($this->category) {
            'salary'     => 'Gaji Pokok',
            'allowance'  => 'Tunjangan',
            'commission' => 'Komisi',
            'fine'       => 'Denda',
            'loan'       => 'Pinjaman',
            'other'      => 'Lainnya',
            default      => ucfirst($this->category ?? '-'),
        };
    }
}
