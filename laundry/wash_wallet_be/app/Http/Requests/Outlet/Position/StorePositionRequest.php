<?php

namespace App\Http\Requests\Outlet\Position;

use Illuminate\Foundation\Http\FormRequest;
use App\Services\PositionService;
use Illuminate\Validation\Rule;

class StorePositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $outletId = (int) $this->route('outletId');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('positions', 'name')->where(
                    fn($query) => $query
                        ->where('outlet_id', $outletId)
                        ->whereNull('deleted_at')
                ),
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
            'name.required' => 'Nama posisi wajib diisi.',
            'name.string' => 'Nama posisi harus berupa teks.',
            'name.max' => 'Nama posisi tidak boleh lebih dari :max karakter.',
            'name.unique' => 'Nama posisi sudah digunakan.',
            'description.string' => 'Deskripsi harus berupa teks.',
            'description.max' => 'Deskripsi tidak boleh lebih dari :max karakter.',
            'isActive.boolean' => 'Status aktif harus berupa nilai benar atau salah.',
            'permissions.*.in' => 'Permission yang dipilih tidak valid.',
        ];
    }
}
