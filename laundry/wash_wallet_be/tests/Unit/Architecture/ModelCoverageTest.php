<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\File;

describe('Model coverage', function () {
  it('all model classes are loadable and instantiable', function () {
    $files = File::files(app_path('Models'));

    expect($files)->not->toBeEmpty();

    foreach ($files as $file) {
      $class = 'App\\Models\\' . $file->getFilenameWithoutExtension();

      expect(class_exists($class), "Model class {$class} not found")->toBeTrue();
      expect(is_subclass_of($class, Model::class), "{$class} is not an Eloquent model")->toBeTrue();

      $instance = app($class);

      expect($instance)->toBeInstanceOf(Model::class);
      expect($instance->getTable())->not->toBe('');
      expect($instance->getFillable())->toBeArray();
      expect($instance->getGuarded())->toBeArray();
    }
  });
});
