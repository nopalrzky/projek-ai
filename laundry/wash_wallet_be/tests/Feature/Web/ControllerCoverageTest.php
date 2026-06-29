<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

function webControllerClasses(): array
{
  return collect(File::files(app_path('Http/Controllers/Web')))
    ->map(fn($file) => 'App\\Http\\Controllers\\Web\\' . $file->getFilenameWithoutExtension())
    ->values()
    ->all();
}

function concreteWebRoutePath(string $uri): string
{
  $path = preg_replace('/\{[^}]+\??\}/', '1', $uri);

  return '/' . ltrim($path, '/');
}

describe('Web controller coverage', function () {
  it('all registered web controller routes point to valid controller classes', function () {
    $routes = collect(Route::getRoutes())
      ->filter(fn($route) => str_starts_with($route->getActionName(), 'App\\Http\\Controllers\\Web\\'))
      ->values();

    expect($routes)->not->toBeEmpty();

    foreach ($routes as $route) {
      $action = $route->getActionName();
      $controller = explode('@', $action)[0] ?? '';

      expect(class_exists($controller))->toBeTrue();
    }
  });

  it('web controller routes have expected guest/auth middleware behavior', function () {
    $controllers = webControllerClasses();

    $routes = collect(Route::getRoutes())
      ->filter(function ($route) use ($controllers) {
        $action = $route->getActionName();

        return collect($controllers)->contains(fn($controller) => str_starts_with($action, $controller . '@'));
      })
      ->values();

    foreach ($routes as $route) {
      $method = collect($route->methods())
        ->reject(fn($httpMethod) => in_array($httpMethod, ['HEAD', 'OPTIONS']))
        ->first();

      if (!$method) {
        continue;
      }

      $path = concreteWebRoutePath($route->uri());
      $middleware = collect($route->gatherMiddleware())->map(fn($m) => (string) $m);
      $response = \Pest\Laravel\call($method, $path);
      $status = $response->getStatusCode();

      $hasAuthMiddleware = $middleware->contains(fn($m) => str_contains($m, 'auth'));
      $hasGuestMiddleware = $middleware->contains(fn($m) => str_contains($m, 'guest'));

      if ($hasAuthMiddleware) {
        expect(in_array($status, [302, 401, 403, 419], true))->toBeTrue();
        continue;
      }

      if ($status >= 500) {
        dump("FAILING ROUTE: " . $method . " " . $path);
        dump($response->getContent());
      }

      if ($hasGuestMiddleware) {
        expect($status)->toBeLessThan(500);
        continue;
      }

      expect($status)->toBeLessThan(500);
    }
  });
});
