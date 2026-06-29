<?php

return [
  'batch_size' => 100,
  'chunk_size' => 1000,
  'max_file_size' => 10240,
  'allowed_extensions' => ['xlsx', 'csv'],
  'storage_disk' => 'local',

  'models' => [

    'category' => [
      'enabled' => true,
      'model' => \App\Models\Category::class,
      'service' => \App\Services\Import\CategoryImportService::class,
      'label' => 'Kategori',
      'description' => 'Data kategori produk',
      'context' => 'outlet',
      'parent_route_param' => 'outletId',

      'auto_fill' => [
        'outlet_id' => 'route_param:outletId',
      ],

      'template' => [
        'filename' => 'Template_Import_Kategori.xlsx',
        'sheet_name' => 'Data Kategori',
      ],
      'columns' => [
        'Nama Kategori' => [
          'field' => 'name',
          'required' => true,
          'type' => 'string',
          'max_length' => 255,
          'description' => 'Nama kategori produk (wajib diisi)',
          'example' => 'Pakaian',
        ],
        'Deskripsi' => [
          'field' => 'description',
          'required' => false,
          'type' => 'text',
          'description' => 'Keterangan kategori (opsional)',
          'example' => 'Kategori untuk produk pakaian',
        ],
        'Status' => [
          'field' => 'is_active',
          'required' => true,
          'type' => 'boolean',
          'default' => true,
          'description' => 'Status kategori (wajib diisi)',
          'example' => 'Aktif',
          'options' => ['Aktif', 'Tidak Aktif'],
        ],
      ],

      'validation' => [
        'name' => 'required|string|max:255',
        'description' => 'nullable|string|max:1000',
        'is_active' => 'required|boolean',
      ],

      'update_validation' => [
        'name' => 'required|string|max:255',
        'description' => 'nullable|string|max:1000',
        'is_active' => 'required|boolean',
      ],
      'instructions' => [
        'Kolom bertanda * wajib diisi',
        'Kode akan di-generate otomatis jika dikosongkan',
        'Urutan digunakan untuk menentukan tampilan kategori',
        'Status harus dipilih dari dropdown (Aktif/Tidak Aktif)',
        'Jika nama kategori sudah ada, data akan diupdate',
        'Gunakan format dropdown yang disediakan untuk kolom Status',
        'Jangan ubah header kolom di template',
      ],
    ],

    'customer' => [
      'enabled' => true,
      'model' => \App\Models\Customer::class,
      'service' => \App\Services\Import\CustomerImportService::class,
      'label' => 'Customer',
      'description' => 'Data pelanggan laundry',
      'context' => 'outlet',
      'parent_route_param' => 'outletId',

      'auto_fill' => [
        'outlet_id' => 'route_param:outletId',
      ],

      'template' => [
        'filename' => 'Template_Import_Customer.xlsx',
        'sheet_name' => 'Data Customer',
      ],

      'columns' => [
        'Nama Customer' => [
          'field' => 'name',
          'required' => true,
          'type' => 'string',
          'max_length' => 255,
          'description' => 'Nama lengkap customer (wajib diisi)',
          'example' => 'John Doe',
        ],
        'Email' => [
          'field' => 'email',
          'required' => false,
          'type' => 'email',
          'max_length' => 255,
          'description' => 'Alamat email customer (opsional)',
          'example' => 'john.doe@example.com',
        ],
        'Telepon' => [
          'field' => 'phone',
          'required' => true,
          'type' => 'string',
          'max_length' => 20,
          'description' => 'Nomor telepon customer (wajib diisi)',
          'example' => '081234567890',
        ],
        'Alamat' => [
          'field' => 'address',
          'required' => false,
          'type' => 'text',
          'description' => 'Alamat lengkap customer (opsional)',
          'example' => 'Jl. Sudirman No. 123, Jakarta',
        ],
        'Jenis Kelamin' => [
          'field' => 'gender',
          'required' => false,
          'type' => 'string',
          'description' => 'Jenis kelamin customer (opsional)',
          'example' => 'Laki-laki',
          'options' => ['Laki-laki', 'Perempuan'],
        ],
        'Status' => [
          'field' => 'is_active',
          'required' => false,
          'type' => 'boolean',
          'default' => true,
          'description' => 'Status aktif customer (opsional)',
          'example' => 'Aktif',
          'options' => ['Aktif', 'Tidak Aktif'],
        ],
      ],

      'validation' => [
        'name' => 'required|string|max:255',
        'email' => 'nullable|email|max:255',
        'phone' => 'required|string|max:20',
        'address' => 'nullable|string',
        'gender' => 'nullable|in:male,female',
        'is_active' => 'nullable|boolean',
        'outlet_id' => 'required|exists:outlets,id',
      ],

      'update_validation' => [
        'name' => 'required|string|max:255',
        'email' => 'nullable|email|max:255',
        'phone' => 'required|string|max:20',
        'address' => 'nullable|string',
        'gender' => 'nullable|in:male,female',
        'is_active' => 'nullable|boolean',
        'outlet_id' => 'required|exists:outlets,id',
      ],

      'unique_keys' => ['phone', 'outlet_id'],
      'relations' => ['outlet'],
      'tenant_scope' => true,
      'tenant_field' => 'outlet_id',

      'transformers' => [
        'is_active' => 'boolean_parser',
        'gender' => 'gender_parser',
      ],

      'instructions' => [
        'Kolom bertanda * wajib diisi',
        'Nomor telepon harus unik per outlet',
        'Email harus dalam format yang valid',
        'Jenis Kelamin harus dipilih dari dropdown (Laki-laki/Perempuan)',
        'Status harus dipilih dari dropdown (Aktif/Tidak Aktif)',
        'Jika nomor telepon sudah ada di outlet yang sama, data akan diupdate',
        'Gunakan format dropdown yang disediakan',
        'Jangan ubah header kolom di template',
      ],
    ],

    'outlet' => [
      'enabled' => true,
      'model' => \App\Models\Outlet::class,
      'service' => \App\Services\Import\OutletImportService::class,
      'label' => 'Outlet',
      'description' => 'Data outlet laundry',
      'context' => 'global',

      'auto_fill' => [
        'owner_id' => 'auth_user_id',
      ],

      'template' => [
        'filename' => 'Template_Import_Outlet.xlsx',
        'sheet_name' => 'Data Outlet',
      ],
      'columns' => [
        'Kode Outlet' => [
          'field' => 'code',
          'required' => true,
          'type' => 'string',
          'max_length' => 50,
          'description' => 'Kode unik outlet (contoh: OTL001)',
          'example' => 'OTL001',
        ],
        'Nama Outlet' => [
          'field' => 'name',
          'required' => true,
          'type' => 'string',
          'max_length' => 255,
          'description' => 'Nama lengkap outlet',
          'example' => 'WashWallet Sudirman',
        ],
        'Alamat' => [
          'field' => 'address',
          'required' => false,
          'type' => 'text',
          'description' => 'Alamat lengkap outlet',
          'example' => 'Jl. Sudirman No. 123, Jakarta Pusat',
        ],
        'Telepon' => [
          'field' => 'phone',
          'required' => true,
          'type' => 'string',
          'max_length' => 20,
          'description' => 'Nomor telepon outlet',
          'example' => '081234567890',
        ],
        'Email' => [
          'field' => 'email',
          'required' => false,
          'type' => 'email',
          'description' => 'Email outlet',
          'example' => 'sudirman@washwallet.com',
        ],
        'Status' => [
          'field' => 'is_active',
          'required' => false,
          'type' => 'boolean',
          'default' => true,
          'description' => 'Status aktif outlet',
          'example' => 'Aktif',
          'options' => ['Aktif', 'Nonaktif'],
        ],
      ],

      'validation' => [
        'code' => 'required|string|max:50',
        'name' => 'required|string|max:255',
        'address' => 'nullable|string',
        'phone' => 'required|string|max:20',
        'email' => 'nullable|email',
        'is_active' => 'nullable|boolean',
        'owner_id' => 'required|exists:users,id',
      ],

      'update_validation' => [
        'code' => 'required|string|max:50',
        'name' => 'required|string|max:255',
        'address' => 'nullable|string',
        'phone' => 'required|string|max:20',
        'email' => 'nullable|email',
        'is_active' => 'nullable|boolean',
        'owner_id' => 'required|exists:users,id',
      ],

      'unique_keys' => ['code'],
      'relations' => ['owner'],
      'tenant_scope' => true,
      'tenant_field' => 'owner_id',

      'transformers' => [
        'is_active' => 'boolean_parser',
      ],
    ],

    'laundry_service' => [
      'enabled' => true,
      'model' => \App\Models\LaundryService::class,
      'service' => \App\Services\Import\LaundryServiceImportService::class,
      'label' => 'Layanan Laundry',
      'description' => 'Data layanan laundry untuk kategori',
      'context' => 'category',
      'parent_route_param' => 'categoryId',

      'auto_fill' => [
        'category_id' => 'route_param:categoryId',
      ],

      'template' => [
        'filename' => 'Template_Import_Layanan_Laundry.xlsx',
        'sheet_name' => 'Data Layanan',
      ],

      'columns' => [
        'Nama Layanan' => [
          'field' => 'name',
          'required' => true,
          'type' => 'string',
          'max_length' => 255,
          'description' => 'Nama layanan laundry (wajib diisi)',
          'example' => 'Cuci Setrika Kiloan',
        ],
        'Deskripsi' => [
          'field' => 'description',
          'required' => false,
          'type' => 'text',
          'description' => 'Deskripsi layanan (opsional)',
          'example' => 'Layanan cuci dan setrika dengan hitungan kilogram',
        ],
        'Satuan' => [
          'field' => 'unit_name',
          'required' => true,
          'type' => 'string',
          'description' => 'Nama satuan (lihat sheet Petunjuk untuk daftar satuan yang tersedia)',
          'example' => 'Kilogram',
        ],
        'Harga' => [
          'field' => 'price',
          'required' => true,
          'type' => 'number',
          'description' => 'Harga layanan dalam Rupiah (wajib diisi, tanpa titik atau koma)',
          'example' => '25000',
        ],
        'Durasi (jam)' => [
          'field' => 'duration_hours',
          'required' => true,
          'type' => 'number',
          'description' => 'Durasi pengerjaan dalam jam (wajib diisi)',
          'example' => '48',
        ],
        'Minimum Pemesanan' => [
          'field' => 'min_quantity',
          'required' => false,
          'type' => 'number',
          'default' => 1,
          'description' => 'Jumlah minimum pemesanan (opsional, default: 1)',
          'example' => '1',
        ],
        'Status' => [
          'field' => 'is_active',
          'required' => false,
          'type' => 'boolean',
          'default' => true,
          'description' => 'Status layanan (opsional, default: Aktif)',
          'example' => 'Aktif',
          'options' => ['Aktif', 'Tidak Aktif'],
        ],
      ],

      'validation' => [
        'name' => 'required|string|max:255',
        'description' => 'nullable|string|max:1000',
        'unit_name' => 'required|string|exists:units,name',
        'price' => 'required|numeric|min:0',
        'duration_hours' => 'required|integer|min:1',
        'min_quantity' => 'nullable|integer|min:1',
        'is_active' => 'nullable|boolean',
        'category_id' => 'required|exists:categories,id',
      ],

      'update_validation' => [
        'name' => 'required|string|max:255',
        'description' => 'nullable|string|max:1000',
        'unit_id' => 'required|integer|exists:units,id',
        'price' => 'required|numeric|min:0',
        'duration_hours' => 'required|integer|min:1',
        'min_quantity' => 'nullable|integer|min:1',
        'is_active' => 'nullable|boolean',
        'category_id' => 'required|exists:categories,id',
      ],

      'unique_keys' => ['category_id', 'name'],
      'relations' => ['category', 'unit'],
      'tenant_scope' => true,
      'tenant_field' => 'category_id',

      'transformers' => [
        'is_active' => 'boolean_parser',
        'price' => 'number_parser',
        'duration_hours' => 'integer_parser',
        'min_quantity' => 'integer_parser',
      ],

      'instructions' => [
        'Kolom bertanda * wajib diisi',
        'Nama layanan harus unik per kategori',
        'Satuan harus sesuai dengan data yang tersedia di database (lihat sheet Petunjuk)',
        'Harga diisi dalam angka tanpa menggunakan titik, koma, atau simbol Rp',
        'Durasi diisi dalam satuan jam (contoh: 24, 48, 72)',
        'Minimum Pemesanan minimal 1, jika dikosongkan akan otomatis diisi 1',
        'Status harus dipilih dari dropdown (Aktif/Tidak Aktif)',
        'Jika nama layanan sudah ada dalam kategori yang sama, data akan diupdate',
        'Slug akan di-generate otomatis dari nama layanan',
        'Gunakan format dropdown yang disediakan',
        'Jangan ubah header kolom di template',
      ],
    ],

  ],

];