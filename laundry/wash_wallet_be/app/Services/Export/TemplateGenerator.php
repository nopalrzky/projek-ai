<?php

namespace App\Services\Export;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use App\Models\Unit;

class TemplateGenerator
{
    public function generate(string $type, array $context = []): string
    {
        $config = config("import-export.models.{$type}");

        if (!$config || !($config['enabled'] ?? false)) {
            throw new \InvalidArgumentException("Invalid template type: {$type}");
        }

        $spreadsheet = new Spreadsheet();

        $dataSheet = $spreadsheet->getActiveSheet();
        $dataSheet->setTitle($config['template']['sheet_name'] ?? 'Data');

        $this->generateHeaders($dataSheet, $config);
        $this->addExampleData($dataSheet, $config);

        $this->addInstructionsSheet($spreadsheet, $config, $context);

        $spreadsheet->setActiveSheetIndex(0);

        $fileName = $config['template']['filename'] ?? 'template.xlsx';
        $tempPath = storage_path('app/temp/' . $fileName);

        if (!file_exists(dirname($tempPath))) {
            mkdir(dirname($tempPath), 0755, true);
        }

        $writer = new Xlsx($spreadsheet);
        $writer->save($tempPath);

        return $tempPath;
    }

    protected function generateHeaders($sheet, array $config): void
    {
        $column = 'A';
        $row = 1;

        foreach ($config['columns'] as $excelColumn => $columnConfig) {
            $isRequired = $columnConfig['required'] ?? false;

            $headerText = $excelColumn;
            if ($isRequired) {
                $headerText .= ' *';
            }

            $sheet->setCellValue($column . $row, $headerText);

            if (isset($columnConfig['description'])) {
                $commentText = $columnConfig['description'];

                if (isset($columnConfig['example'])) {
                    $commentText .= "\n\nContoh: " . $columnConfig['example'];
                }

                if (isset($columnConfig['options'])) {
                    $commentText .= "\n\nPilihan: " . implode(', ', $columnConfig['options']);
                }

                $sheet->getComment($column . $row)
                    ->getText()
                    ->createTextRun($commentText);

                $sheet->getComment($column . $row)->setWidth('250pt');
                $sheet->getComment($column . $row)->setHeight('100pt');
            }

            $this->styleHeader($sheet, $column . $row, $isRequired);

            if (isset($columnConfig['options']) && is_array($columnConfig['options'])) {
                $this->addDropdownValidation($sheet, $column, $columnConfig['options']);
            }

            $sheet->getColumnDimension($column)->setAutoSize(true);

            $column++;
        }

        $sheet->freezePane('A2');
    }

    protected function addDropdownValidation($sheet, string $column, array $options): void
    {
        $validation = $sheet->getCell($column . '2')->getDataValidation();
        $validation->setType(DataValidation::TYPE_LIST);
        $validation->setErrorStyle(DataValidation::STYLE_STOP);
        $validation->setAllowBlank(false);
        $validation->setShowInputMessage(true);
        $validation->setShowErrorMessage(true);
        $validation->setShowDropDown(true);
        $validation->setErrorTitle('Input Tidak Valid');
        $validation->setError('Silakan pilih dari dropdown yang tersedia');
        $validation->setPromptTitle('Pilih Opsi');
        $validation->setPrompt('Pilih dari opsi yang tersedia: ' . implode(', ', $options));
        $validation->setFormula1('"' . implode(',', $options) . '"');

        for ($i = 2; $i <= 1000; $i++) {
            $cell = $sheet->getCell($column . $i);
            $cell->setDataValidation(clone $validation);
        }
    }

    protected function addInstructionsSheet(Spreadsheet $spreadsheet, array $config, array $context): void
    {
        $sheet = $spreadsheet->createSheet(1);
        $sheet->setTitle('📋 Petunjuk');

        $row = 1;

        $sheet->setCellValue('A' . $row, 'PETUNJUK IMPORT ' . strtoupper($config['label']));
        $sheet->mergeCells('A' . $row . ':E' . $row);
        $sheet->getStyle('A' . $row)->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 18,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4F46E5'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);
        $sheet->getRowDimension($row)->setRowHeight(35);
        $row += 2;

        if (isset($config['description'])) {
            $sheet->setCellValue('A' . $row, $config['description']);
            $sheet->mergeCells('A' . $row . ':E' . $row);
            $sheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['italic' => true, 'size' => 11],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
            $row += 2;
        }

        if (!empty($context)) {
            $row = $this->addMasterDataSection($sheet, $row, $config, $context);
        }

        $sheet->setCellValue('A' . $row, '📌 CARA PENGGUNAAN:');
        $sheet->getStyle('A' . $row)->applyFromArray([
            'font' => ['bold' => true, 'size' => 12],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E0E7FF'],
            ],
        ]);
        $row++;

        $instructions = [
            '1. Jangan mengubah nama kolom di header (baris pertama)',
            '2. Kolom yang diberi tanda (*) wajib diisi',
            '3. Arahkan kursor ke header kolom untuk melihat keterangan detail',
            '4. Isi data dimulai dari baris ke-2',
            '5. Hapus baris contoh (baris ke-2) sebelum import data asli',
            '6. Maksimal ukuran file: ' . config('import-export.max_file_size', 10240) . ' KB',
            '7. Format file yang didukung: .xlsx atau .csv',
            '8. Simpan file dalam format Excel (.xlsx) sebelum import',
        ];

        foreach ($instructions as $instruction) {
            $sheet->setCellValue('A' . $row, $instruction);
            $sheet->getStyle('A' . $row)->applyFromArray([
                'alignment' => ['wrapText' => true],
            ]);
            $row++;
        }

        $row += 2;

        $sheet->setCellValue('A' . $row, '📊 DETAIL KOLOM:');
        $sheet->getStyle('A' . $row)->applyFromArray([
            'font' => ['bold' => true, 'size' => 12],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E0E7FF'],
            ],
        ]);
        $row++;

        $headers = ['Nama Kolom', 'Wajib?', 'Tipe', 'Keterangan', 'Contoh'];
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col . $row, $header);
            $sheet->getStyle($col . $row)->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '6366F1'],
                ],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '000000'],
                    ],
                ],
            ]);
            $col++;
        }
        $row++;

        foreach ($config['columns'] as $excelColumn => $columnConfig) {
            $sheet->setCellValue('A' . $row, $excelColumn);
            $sheet->setCellValue('B' . $row, ($columnConfig['required'] ?? false) ? 'Ya *' : 'Tidak');

            $type = $columnConfig['type'] ?? 'string';
            if (isset($columnConfig['options'])) {
                $type .= ' (dropdown)';
            }
            $sheet->setCellValue('C' . $row, $type);

            $description = $columnConfig['description'] ?? '-';
            if (isset($columnConfig['options'])) {
                $description .= "\nPilihan: " . implode(', ', $columnConfig['options']);
            }
            if (isset($columnConfig['max_length'])) {
                $description .= "\nMaks: " . $columnConfig['max_length'] . ' karakter';
            }
            $sheet->setCellValue('D' . $row, $description);

            $sheet->setCellValue('E' . $row, $columnConfig['example'] ?? '-');

            $sheet->getStyle('A' . $row . ':E' . $row)->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'D1D5DB'],
                    ],
                ],
                'alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_TOP],
            ]);

            if ($columnConfig['required'] ?? false) {
                $sheet->getStyle('B' . $row)->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => 'DC2626']],
                ]);
            }

            $row++;
        }

        $row += 2;

        $sheet->setCellValue('A' . $row, '⚠️ CATATAN PENTING:');
        $sheet->getStyle('A' . $row)->applyFromArray([
            'font' => ['bold' => true, 'size' => 12],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'FEF3C7'],
            ],
        ]);
        $row++;

        $notes = [
            '• Pastikan semua data sudah benar sebelum import',
            '• Data yang sudah ada akan diupdate berdasarkan nama + unit',
            '• Import akan diproses di background',
            '• Anda akan mendapat notifikasi jika import selesai',
            '• File error akan tersedia untuk download jika ada data yang gagal',
        ];

        foreach ($notes as $note) {
            $sheet->setCellValue('A' . $row, $note);
            $row++;
        }

        foreach (range('A', 'E') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $sheet->getColumnDimension('A')->setWidth(25);
        $sheet->getColumnDimension('D')->setWidth(50);
        $sheet->getColumnDimension('E')->setWidth(30);
    }

    /**
     * Master Data Section (Units, Categories, etc)
     */
    protected function addMasterDataSection($sheet, int $row, array $config, array $context): int
    {
        $needsUnits = isset($config['columns']['ID Unit']);

        if (!$needsUnits) {
            return $row;
        }

        $sheet->setCellValue('A' . $row, '📚 MASTER DATA REFERENSI:');
        $sheet->mergeCells('A' . $row . ':E' . $row);
        $sheet->getStyle('A' . $row)->applyFromArray([
            'font' => ['bold' => true, 'size' => 12],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'DBEAFE'],
            ],
        ]);
        $row++;

        if ($needsUnits) {
            $row = $this->addUnitsTable($sheet, $row);
        }

        $row += 2;

        return $row;
    }
    protected function addUnitsTable($sheet, int $row): int
    {
        $sheet->setCellValue('A' . $row, '🔢 DAFTAR UNIT:');
        $sheet->getStyle('A' . $row)->applyFromArray([
            'font' => ['bold' => true, 'size' => 11, 'color' => ['rgb' => '1E40AF']],
        ]);
        $row++;

        $headers = ['ID Unit', 'Nama Unit', 'Simbol', 'Deskripsi', 'Status'];
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col . $row, $header);
            $sheet->getStyle($col . $row)->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '3B82F6'],
                ],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '000000'],
                    ],
                ],
            ]);
            $col++;
        }
        $row++;

        $units = Unit::orderBy('id', 'asc')
            ->get(['id', 'name', 'symbol', 'description']);

        foreach ($units as $unit) {
            $sheet->setCellValue('A' . $row, $unit->id);
            $sheet->setCellValue('B' . $row, $unit->name);
            $sheet->setCellValue('C' . $row, $unit->symbol);
            $sheet->setCellValue('D' . $row, $unit->description ?? '-');

            $sheet->getStyle('A' . $row . ':E' . $row)->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'D1D5DB'],
                    ],
                ],
                'alignment' => ['vertical' => Alignment::VERTICAL_TOP],
            ]);

            $sheet->getStyle('A' . $row)->applyFromArray([
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                'font' => ['bold' => true],
            ]);

            $statusColor = $unit->is_active ? 'D1FAE5' : 'FEE2E2';
            $sheet->getStyle('E' . $row)->applyFromArray([
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => $statusColor],
                ],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);

            $row++;
        }

        $row++;
        $sheet->setCellValue('A' . $row, '💡 Tips: Gunakan ID Unit dari tabel di atas untuk kolom "ID Unit" di sheet Data');
        $sheet->mergeCells('A' . $row . ':E' . $row);
        $sheet->getStyle('A' . $row)->applyFromArray([
            'font' => ['italic' => true, 'size' => 10, 'color' => ['rgb' => '059669']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'D1FAE5'],
            ],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
        ]);

        return $row + 1;
    }

    protected function addExampleData($sheet, array $config): void
    {
        $column = 'A';
        $row = 2;

        foreach ($config['columns'] as $excelColumn => $columnConfig) {
            if (isset($columnConfig['example'])) {
                $sheet->setCellValue($column . $row, $columnConfig['example']);

                $sheet->getStyle($column . $row)->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'FEF3C7'],
                    ],
                    'font' => [
                        'italic' => true,
                        'color' => ['rgb' => '92400E'],
                    ],
                ]);
            }
            $column++;
        }

        $lastColumn = chr(ord('A') + count($config['columns']));
        $sheet->setCellValue($lastColumn . $row, '← Hapus baris ini sebelum import');
        $sheet->getStyle($lastColumn . $row)->applyFromArray([
            'font' => ['italic' => true, 'color' => ['rgb' => 'DC2626']],
        ]);
    }

    protected function styleHeader($sheet, string $cellCoordinate, bool $isRequired): void
    {
        $color = $isRequired ? 'DC2626' : '4F46E5';

        $sheet->getStyle($cellCoordinate)->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => $color],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
                'wrapText' => true,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '000000'],
                ],
            ],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(30);
    }
}
