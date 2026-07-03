<?php

use App\Models\Employee;
use App\Models\Outlet;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

function createEmployeePasswordOwner(): User
{
    Role::findOrCreate('owner', 'web');

    /** @var User $owner */
    $owner = User::factory()->create([
        'status' => User::STATUS_ACTIVE,
    ]);

    $owner->assignRole('owner');

    return $owner;
}

function createEmployeePasswordSuperAdmin(): User
{
    Role::findOrCreate('super_admin', 'web');

    /** @var User $superAdmin */
    $superAdmin = User::factory()->create([
        'status' => User::STATUS_ACTIVE,
    ]);

    $superAdmin->assignRole('super_admin');

    return $superAdmin;
}

function createEmployeeForOwner(User $owner, array $attributes = []): Employee
{
    $outlet = Outlet::factory()->create([
        'owner_id' => $owner->id,
    ]);

    return Employee::factory()->create(array_merge([
        'outlet_id' => $outlet->id,
        'password' => Hash::make('OldPass123'),
        'is_active' => true,
    ], $attributes));
}

describe('Web employee password update', function () {
    it('redirects guest to login', function () {
        $employee = Employee::factory()->create();

        \Pest\Laravel\put(route('employees.password.update', $employee->id), [
            'password' => 'NewPass123',
            'passwordConfirmation' => 'NewPass123',
        ])->assertRedirect(route('login'));
    });

    it('allows an owner to change password for employee in owned outlet and revokes old tokens', function () {
        $owner = createEmployeePasswordOwner();
        $employee = createEmployeeForOwner($owner);
        $employee->createToken('old-device');

        \Pest\Laravel\actingAs($owner);

        \Pest\Laravel\from(route('employees.show', $employee->id))
            ->put(route('employees.password.update', $employee->id), [
                'password' => 'NewPass123',
                'passwordConfirmation' => 'NewPass123',
            ])
            ->assertRedirect(route('employees.show', $employee->id))
            ->assertSessionHas('success', "Password karyawan '{$employee->name}' berhasil diganti");

        $employee->refresh();

        expect(Hash::check('NewPass123', $employee->password))->toBeTrue()
            ->and($employee->tokens()->count())->toBe(0);
    });

    it('prevents the old password and allows the new password on mobile login', function () {
        $owner = createEmployeePasswordOwner();
        $employee = createEmployeeForOwner($owner);

        \Pest\Laravel\actingAs($owner);

        \Pest\Laravel\put(route('employees.password.update', $employee->id), [
            'password' => 'NewPass123',
            'passwordConfirmation' => 'NewPass123',
        ])->assertSessionHas('success');

        \Pest\Laravel\postJson(route('mobile.cashier.auth.login'), [
            'username' => $employee->username,
            'password' => 'OldPass123',
            'deviceName' => 'test-device',
        ])->assertStatus(422);

        \Pest\Laravel\postJson(route('mobile.cashier.auth.login'), [
            'username' => $employee->username,
            'password' => 'NewPass123',
            'deviceName' => 'test-device',
        ])->assertOk()
            ->assertJsonPath('success', true);
    });

    it('rejects an owner changing password for employee from another owner', function () {
        $owner = createEmployeePasswordOwner();
        $otherOwner = createEmployeePasswordOwner();
        $employee = createEmployeeForOwner($otherOwner);
        $oldPasswordHash = $employee->password;

        \Pest\Laravel\actingAs($owner);

        \Pest\Laravel\put(route('employees.password.update', $employee->id), [
            'password' => 'NewPass123',
            'passwordConfirmation' => 'NewPass123',
        ])->assertForbidden();

        expect($employee->fresh()->password)->toBe($oldPasswordHash);
    });

    it('allows super admin to change password across outlets', function () {
        $owner = createEmployeePasswordOwner();
        $superAdmin = createEmployeePasswordSuperAdmin();
        $employee = createEmployeeForOwner($owner);

        \Pest\Laravel\actingAs($superAdmin);

        \Pest\Laravel\put(route('employees.password.update', $employee->id), [
            'password' => 'AdminPass123',
            'passwordConfirmation' => 'AdminPass123',
        ])->assertSessionHas('success');

        expect(Hash::check('AdminPass123', $employee->fresh()->password))->toBeTrue();
    });

    it('validates password requirements', function (array $payload, string $field) {
        $owner = createEmployeePasswordOwner();
        $employee = createEmployeeForOwner($owner);
        $oldPasswordHash = $employee->password;

        \Pest\Laravel\actingAs($owner);

        \Pest\Laravel\from(route('employees.show', $employee->id))
            ->put(route('employees.password.update', $employee->id), $payload)
            ->assertRedirect(route('employees.show', $employee->id))
            ->assertSessionHasErrors($field);

        expect($employee->fresh()->password)->toBe($oldPasswordHash);
    })->with([
        'short password' => [[
            'password' => 'Aa123',
            'passwordConfirmation' => 'Aa123',
        ], 'password'],
        'without lowercase' => [[
            'password' => 'NEWPASS123',
            'passwordConfirmation' => 'NEWPASS123',
        ], 'password'],
        'without uppercase' => [[
            'password' => 'newpass123',
            'passwordConfirmation' => 'newpass123',
        ], 'password'],
        'confirmation mismatch' => [[
            'password' => 'NewPass123',
            'passwordConfirmation' => 'OtherPass123',
        ], 'passwordConfirmation'],
    ]);

    it('rejects inactive employees', function () {
        $owner = createEmployeePasswordOwner();
        $employee = createEmployeeForOwner($owner, [
            'is_active' => false,
        ]);
        $oldPasswordHash = $employee->password;

        \Pest\Laravel\actingAs($owner);

        \Pest\Laravel\from(route('employees.show', $employee->id))
            ->put(route('employees.password.update', $employee->id), [
                'password' => 'NewPass123',
                'passwordConfirmation' => 'NewPass123',
            ])
            ->assertRedirect(route('employees.show', $employee->id))
            ->assertSessionHas('error');

        expect($employee->fresh()->password)->toBe($oldPasswordHash);
    });

    it('rejects soft deleted employees', function () {
        $owner = createEmployeePasswordOwner();
        $employee = createEmployeeForOwner($owner);
        $oldPasswordHash = $employee->password;
        $employee->delete();

        \Pest\Laravel\actingAs($owner);

        \Pest\Laravel\from(route('employees.index'))
            ->put(route('employees.password.update', $employee->id), [
                'password' => 'NewPass123',
                'passwordConfirmation' => 'NewPass123',
            ])
            ->assertRedirect(route('employees.index'))
            ->assertSessionHas('error');

        expect(Employee::withTrashed()->find($employee->id)->password)->toBe($oldPasswordHash);
    });
});
