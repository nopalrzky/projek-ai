<?php

use Illuminate\Support\Facades\File;

describe('Service coverage', function () {
  it('all service classes are resolvable from the container', function () {
    $files = File::files(app_path('Services'));

    expect($files)->not->toBeEmpty();

    foreach ($files as $file) {
      $class = 'App\\Services\\' . $file->getFilenameWithoutExtension();

      if (!class_exists($class)) {
        continue;
      }

      $reflection = new ReflectionClass($class);

      if ($reflection->isAbstract()) {
        continue;
      }

      $instance = app()->make($class);
      expect($instance)->toBeInstanceOf($class);

      $publicMethods = collect($reflection->getMethods(ReflectionMethod::IS_PUBLIC))
        ->filter(fn(ReflectionMethod $method) => $method->class === $class)
        ->filter(fn(ReflectionMethod $method) => !str_starts_with($method->name, '__'))
        ->values();

      expect($publicMethods->count(), "{$class} has no public business methods")->toBeGreaterThan(0);
    }
  });
});
