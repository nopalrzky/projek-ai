<?php

use App\Models\Employee;

describe('Employee model helpers', function () {
  it('calculates the age correctly', function () {
    $employee = Employee::factory()->make([
      'date_of_birth' => '1995-05-15',
    ]);

    expect($employee->getAge())->toBe((int) now()->diffInYears(\Carbon\Carbon::parse('1995-05-15')));
  });

  it('returns null if date of birth is not set', function () {
    $employee = Employee::factory()->make([
      'date_of_birth' => null,
    ]);

    expect($employee->getAge())->toBeNull();
  });
});
