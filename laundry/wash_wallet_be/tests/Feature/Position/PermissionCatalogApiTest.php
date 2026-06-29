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
                    'key',
                    'label',
                ]
            ],
            'message'
        ]);

    $data = $response->json('data');
    expect(count($data))->toBe(12);
    expect($data[0]['key'])->toBe('order.create');
    expect($data[0]['label'])->toBe('Buat Order');
});

test('unauthenticated request is rejected 401', function () {
    $response = $this->getJson('/api/permissions/catalog');

    $response->assertStatus(401);
});
