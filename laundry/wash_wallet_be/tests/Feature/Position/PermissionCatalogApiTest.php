<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('GET /api/permissions/catalog returns 12 permission keys', function () {
    /** @var User $user */    
    $user = User::factory()->createOne();

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/permissions/catalog');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'data' => [
                '*' => [
                    'group',
                    'permissions' => [
                        '*' => [
                            'key',
                            'label',
                        ],
                    ],
                ]
            ],
            'message'
        ]);

    $data = $response->json('data');
    $flatPermissions = collect($data)
        ->flatMap(fn (array $group) => $group['permissions'])
        ->values();

    expect($flatPermissions)->toHaveCount(50);
    expect($flatPermissions->pluck('key'))->toContain('cashier_dashboard.view');
    expect($flatPermissions->pluck('key'))->toContain('order.print');
    expect($flatPermissions->pluck('key'))->not->toContain('order.manage');
    expect($data[0]['group'])->toBe('Dashboard Kasir');
});

test('unauthenticated request is rejected 401', function () {
    $response = $this->getJson('/api/permissions/catalog');

    $response->assertStatus(401);
});
