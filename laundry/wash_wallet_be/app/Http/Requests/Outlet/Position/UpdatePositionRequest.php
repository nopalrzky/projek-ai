<?php

namespace App\Http\Requests\Outlet\Position;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Services\PositionService;

class UpdatePositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $positionId = (int) $this->route('positionId');
        $outletId = (int) $this->route('outletId');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('positions', 'name')
                    ->where(
                        fn($query) => $query
                            ->where('outlet_id', $outletId)
                            ->whereNull('deleted_at')
                    )
                    ->ignore($positionId)
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'isActive' => ['boolean'],
            'permissions'   => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::in(app(PositionService::class)->getPermissionKeys())],
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nama posisi',
            'description' => 'deskripsi',
            'isActive' => 'status aktif',
            'permissions'   => 'daftar permission',
            'permissions.*' => 'permission',
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'Nama posisi sudah digunakan.',
            'permissions.*.in' => 'Permission yang dipilih tidak valid.',
        ];
    }
}
