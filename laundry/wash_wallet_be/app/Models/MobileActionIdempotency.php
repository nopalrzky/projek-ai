<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Query\Builder;

#[Table('mobile_action_idempotencies')]
class MobileActionIdempotency extends Model
{
    protected $fillable = [
        'employee_id',
        'outlet_id',
        'action',
        'client_request_id',
        'request_hash',
        'status',
        'response_code',
        'response_body',
    ];

    protected $casts = [
        'response_body' => 'array',
    ];


    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function scopeByEmployeeId(Builder $query, int $employeeId) : Builder
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeByOutletId(Builder $query, int $outletId) : Builder
    {
        return $query->where('outlet_id', $outletId);
    }

}
