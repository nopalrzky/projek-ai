<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Exception;
use Illuminate\Support\Facades\Log;

class ImageService
{
  protected string $disk;

  public function __construct(string $disk = 'public')
  {
    $this->disk = $disk;
  }

  /**
   * Store a new image in a given directory.
   */
  public function store(UploadedFile $file, string $directory = 'uploads'): string
  {
    try {
      $this->validateImage($file);

      $filename = $this->generateFileName($file);
      $path = $file->storeAs($directory, $filename, $this->disk);

      Log::info('Image stored successfully', [
        'path' => $path,
        'directory' => $directory,
        'disk' => $this->disk,
        'original_name' => $file->getClientOriginalName(),
      ]);

      return $path;
    } catch (Exception $e) {
      Log::error('Image storage failed', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }
  }

  /**
   * Update an image (delete old one and store new)
   */
  public function update(?string $oldPath, UploadedFile $newFile, string $directory = 'uploads'): string
  {
    if ($oldPath) {
      $this->delete($oldPath);
    }

    return $this->store($newFile, $directory);
  }

  /**
   * Delete an image from storage
   */
  public function delete(?string $path): void
  {
    if (!$path) return;

    try {
      if (Storage::disk($this->disk)->exists($path)) {
        Storage::disk($this->disk)->delete($path);
        Log::info('Image deleted successfully', ['path' => $path]);
      }
    } catch (Exception $e) {
      Log::warning('Failed to delete image', [
        'path' => $path,
        'error' => $e->getMessage(),
      ]);
    }
  }

  /**
   * Validate uploaded file is a proper image
   */
  protected function validateImage(UploadedFile $file): void
  {
    $mime = $file->getMimeType();
    if (!Str::startsWith($mime, 'image/')) {
      throw new Exception('Invalid file type, must be an image.');
    }
  }

  /**
   * Generate unique filename for the image
   */
  protected function generateFileName(UploadedFile $file): string
  {
    $extension = $file->getClientOriginalExtension();
    return Str::uuid() . '.' . strtolower($extension);
  }
}
