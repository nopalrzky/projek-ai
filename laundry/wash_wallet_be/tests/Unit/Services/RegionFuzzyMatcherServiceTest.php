<?php

use App\Services\RegionFuzzyMatcherService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Cache::flush();

    // Fake external Emsifa API responses
    Http::fake([
        '*/provinces.json' => Http::response([
            ['id' => '35', 'name' => 'JAWA TIMUR'],
            ['id' => '31', 'name' => 'DKI JAKARTA'],
        ], 200),
        '*/regencies/35.json' => Http::response([
            ['id' => '3578', 'province_id' => '35', 'name' => 'KOTA SURABAYA'],
            ['id' => '3524', 'province_id' => '35', 'name' => 'KABUPATEN LAMONGAN'],
        ], 200),
        '*/districts/3578.json' => Http::response([
            ['id' => '3578080', 'regency_id' => '3578', 'name' => 'BUBUTAN'],
        ], 200),
        '*/villages/3578080.json' => Http::response([
            ['id' => '3578080004', 'district_id' => '3578080', 'name' => 'TEMBOK DUKUH'],
        ], 200),
        '*/districts/3524.json' => Http::response([
            ['id' => '3524190', 'regency_id' => '3524', 'name' => 'NGIMBANG'],
        ], 200),
        '*/villages/3524190.json' => Http::response([
            ['id' => '3524190001', 'district_id' => '3524190', 'name' => 'TANJUNGKULON'],
            ['id' => '3524190002', 'district_id' => '3524190', 'name' => 'TANJUNG WETAN'],
        ], 200),
    ]);
});

test('it matches normal formatted location successfully', function () {
    $service = app(RegionFuzzyMatcherService::class);

    $result = $service->matchLocation('Jawa Timur', 'Surabaya', 'Bubutan', 'Tembok Dukuh');

    expect($result)->toBeArray()
        ->toHaveKey('province_id', '35')
        ->toHaveKey('province_name', 'JAWA TIMUR')
        ->toHaveKey('regency_id', '3578')
        ->toHaveKey('regency_name', 'KOTA SURABAYA')
        ->toHaveKey('district_id', '3578080')
        ->toHaveKey('district_name', 'BUBUTAN')
        ->toHaveKey('village_id', '3578080004')
        ->toHaveKey('village_name', 'TEMBOK DUKUH');
});

test('it matches location containing common abbreviations like Kec. and Kel.', function () {
    $service = app(RegionFuzzyMatcherService::class);

    $result = $service->matchLocation('Jawa Timur', 'KOTA SURABAYA', 'Kec. Bubutan', 'Kel. Tembok Dukuh');

    expect($result)->toBeArray()
        ->toHaveKey('district_id', '3578080')
        ->toHaveKey('village_id', '3578080004');
});

test('it matches location and strips plus codes successfully', function () {
    $service = app(RegionFuzzyMatcherService::class);

    // e.g. "M6R5+5W7, Tanjungkulon" should match "TANJUNGKULON"
    $result = $service->matchLocation(
        'Jawa Timur',
        'Kabupaten Lamongan',
        'Kec. Ngimbang',
        'M6R5+5W7, Tanjungkulon'
    );

    expect($result)->toBeArray()
        ->toHaveKey('regency_id', '3524')
        ->toHaveKey('district_id', '3524190')
        ->toHaveKey('village_id', '3524190001')
        ->toHaveKey('village_name', 'TANJUNGKULON');
});

test('it matches abbreviated prefixes like Tj.', function () {
    $service = app(RegionFuzzyMatcherService::class);

    // "Tj. Wetan" should match "TANJUNG WETAN"
    $result = $service->matchLocation(
        'Jawa Timur',
        'Kabupaten Lamongan',
        'Kec. Ngimbang',
        'Tj. Wetan'
    );

    expect($result)->toBeArray()
        ->toHaveKey('village_id', '3524190002')
        ->toHaveKey('village_name', 'TANJUNG WETAN');
});

test('it strips postal codes and RT/RW notations', function () {
    $service = app(RegionFuzzyMatcherService::class);

    $result = $service->matchLocation(
        'Jawa Timur 60173',
        'Surabaya',
        'Bubutan',
        'Tembok Dukuh RT.004/RW.10'
    );

    expect($result)->toBeArray()
        ->toHaveKey('province_id', '35')
        ->toHaveKey('village_id', '3578080004');
});

test('it returns early if no provinceName provided', function () {
    $service = app(RegionFuzzyMatcherService::class);

    $result = $service->matchLocation(null, 'Surabaya', 'Bubutan', 'Tembok Dukuh');

    expect($result)->toBeEmpty();
});

test('it returns empty if province is not matched', function () {
    $service = app(RegionFuzzyMatcherService::class);

    $result = $service->matchLocation('Jawa Barat', 'Surabaya', 'Bubutan', 'Tembok Dukuh');

    expect($result)->toBeEmpty();
});

test('it parses full address from street string correctly', function () {
    $service = app(RegionFuzzyMatcherService::class);

    $result1 = $service->parseFullAddress("Jl. Demak Jaya II No.82, RT.004/RW.10, Tembok Dukuh, Kec. Bubutan, Surabaya, Jawa Timur 60173");
    expect($result1)->toBeArray()
        ->toHaveKey('province', 'Jawa Timur')
        ->toHaveKey('regency', 'Surabaya')
        ->toHaveKey('district', 'Kec. Bubutan')
        ->toHaveKey('village', 'Tembok Dukuh');

    $result2 = $service->parseFullAddress("M6R5+5W7, Tanjungkulon, Tj. Wetan, Munungrejo, Kec. Ngimbang, Kabupaten Lamongan, Jawa Timur 62273");
    expect($result2)->toBeArray()
        ->toHaveKey('province', 'Jawa Timur')
        ->toHaveKey('regency', 'Kabupaten Lamongan')
        ->toHaveKey('district', 'Kec. Ngimbang')
        ->toHaveKey('village', 'Munungrejo');
});
