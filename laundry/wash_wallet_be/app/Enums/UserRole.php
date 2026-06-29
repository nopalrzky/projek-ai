<?php

namespace App\Enums;

enum UserRole: string
{
    case Owner = 'owner';
    case SuperAdmin = 'super_admin';
}
