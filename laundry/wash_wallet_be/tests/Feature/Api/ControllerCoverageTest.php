<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

function apiControllerClasses(): array
{
  return collect(File::files(app_path('Http/Controllers/Api')))
    ->map(fn($file) => 'App\\Http\\Controllers\\Api\\' . $file->getFilenameWithoutExtension())
    ->values()
    ->all();
}

function concreteRoutePath(string $uri): string
{
  $path = preg_replace('/\{[^}]+\??\}/', '1', $uri);

  return '/' . ltrim($path, '/');
}

describe('Controller coverage', function () {
  it('all registered API controller routes point to valid controller classes', function () {
    $routes = collect(Route::getRoutes())
      ->filter(fn($route) => str_starts_with($route->getActionName(), 'App\\Http\\Controllers\\Api\\'))
      ->values();

    expect($routes)->not->toBeEmpty();

    foreach ($routes as $route) {
      $action = $route->getActionName();
      $controller = explode('@', $action)[0] ?? '';

      expect(class_exists($controller))->toBeTrue();
    }
  });

  it('all API controller routes respond without server errors', function () {
    $controllers = apiControllerClasses();
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

      $path = concreteRoutePath($route->uri());
      $requiresSanctum = collect($route->gatherMiddleware())
        ->contains(fn($middleware) => str_contains((string) $middleware, 'auth:sanctum'));

      if ($requiresSanctum) {
        $response = \Pest\Laravel\json($method, $path);
        $status = $response->getStatusCode();
        expect($status)->toBe(401);
        continue;
      }

      expect($path)->toStartWith('/');
    }
  });
});
