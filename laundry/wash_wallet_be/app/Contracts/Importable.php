<?php

namespace App\Contracts;

interface Importable
{
  /**
   * Get column mapping for import
   */
  public function getColumnMapping(): array;

  /**
   * Get validation rules
   */
  public function getValidationRules(bool $isUpdate = false): array;

  /**
   * Transform raw data before validation
   */
  public function transformData(array $data): array;

  /**
   * Custom validation logic
   */
  public function customValidation(array $data): array;

  /**
   * Import data (insert or update)
   */
  public function import(array $data): void;

  /**
   * Get unique keys for matching existing data
   */
  public function getUniqueKeys(): array;
}
