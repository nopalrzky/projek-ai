<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Table('allowances')]
class Allowance extends Model
{
    /** @use HasFactory<\Database\Factories\AllowanceFactory> */
    use HasFactory;
}
