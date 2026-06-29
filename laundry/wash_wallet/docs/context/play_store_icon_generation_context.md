# Context: Play Store Icon Generation Brief WashWallet Apps

Tanggal review: 2026-06-23

Dokumen ini adalah brief untuk AI model/designer lain yang akan membuat ikon Google Play untuk tiga aplikasi mobile WashWallet:

- `WashWallet Cashier`
- `WashWallet Customer`
- `WashWallet Production`

Tujuan utama: menghasilkan tiga ikon Play Store yang terasa satu keluarga brand, tetapi tetap mudah dibedakan di Play Store, launcher Android, app switcher, dan daftar aplikasi internal.

## Spesifikasi Output Wajib

Ikon yang diminta adalah Google Play Store icon, bukan screenshot, bukan feature graphic, dan bukan logo website.

Output utama per app:

- Format: PNG 32-bit dengan alpha.
- Ukuran final: 512px x 512px.
- Color space: sRGB.
- Maksimum ukuran file: 1024KB.
- Bentuk canvas: full square.
- Jangan menambahkan corner radius pada file final.
- Jangan menambahkan drop shadow eksternal pada file final.
- Jangan menambahkan badge, label harga, ranking, kata "best", "#1", "free", "new", "sale", atau elemen yang terlihat seperti klaim performa Play Store.
- Jangan memasukkan logo Google Play atau logo pihak ketiga.
- Hindari teks kecil. Icon harus tetap terbaca pada ukuran kecil.

Google Play akan menerapkan rounded mask dan shadow secara dinamis setelah icon diupload. Karena itu, icon final harus berupa artwork square penuh, bukan rounded-square yang sudah dipotong.

Output tambahan yang sangat disarankan:

- Master source resolusi tinggi, misalnya 1024px atau 2048px square.
- Versi adaptive launcher icon:
  - background layer solid/gradient ringan tanpa detail penting di tepi.
  - foreground layer transparan berisi simbol utama.
  - monochrome layer sederhana untuk themed icon Android.
- Simbol utama adaptive icon harus aman dalam area tengah. Hindari detail penting terlalu dekat tepi karena launcher Android dapat memakai mask berbeda-beda.

Sumber resmi:

- Play preview assets and app icon requirements: https://support.google.com/googleplay/android-developer/answer/9866151
- Google Play icon design specifications: https://developer.android.com/distribute/google-play/resources/icon-design-specifications
- Android adaptive icon guidance: https://developer.android.com/develop/ui/views/launch/icon_design_adaptive

## Brand Context

WashWallet adalah ekosistem aplikasi laundry digital dengan tiga persona utama:

- Customer: pelanggan yang mencari outlet, membuat order, mengatur pickup, membayar/topup, dan melacak status laundry.
- Cashier: kasir/front-office outlet yang membuat order, menerima order customer, menimbang laundry, mengelola pembayaran, pelanggan, membership, dan print struk.
- Production: staf operasional produksi/kurir yang memproses item laundry, pickup, bukti foto, update status, WhatsApp notification, dan print label.

Brand personality:

- Bersih, modern, rapi, dan terpercaya.
- Operasional tetapi tetap friendly.
- Cocok untuk layanan laundry, pembayaran, order tracking, dan workflow outlet.
- Tidak terlalu dekoratif, tidak seperti game, tidak terlalu enterprise gelap.
- Ikon harus terlihat premium dan usable, bukan ilustrasi penuh detail.

Visual foundation dari aplikasi:

- Primary brand teal: `#125B48`.
- Dark teal: `#0C3F32` atau `#082B23`.
- Mid teal: `#2F7F6F`.
- Light teal/mint: `#E8F3F0`, `#C7E1D9`, `#A3CDC3`.
- Neutral putih/abu: `#FFFFFF`, `#F7F9F8`, `#EEF2F1`, `#0F1211`.
- Accent yang boleh dipakai secara terbatas:
  - Blue/info: `#3B82F6` untuk lokasi/tracking/customer.
  - Amber/warning: `#F59E0B` untuk transaksi, antrean, atau workflow.
  - Green/success: `#22C55E` untuk status selesai/clean/verified.

Gunakan teal sebagai benang merah semua icon. Pakai accent berbeda untuk membedakan persona, tetapi jangan membuat palet menjadi ramai.

## Product Ecosystem Context

WashWallet bukan hanya tiga aplikasi mobile. WashWallet adalah ekosistem produk untuk bisnis laundry yang menghubungkan public website, owner/admin dashboard, cashier app, customer app, dan production app dalam satu alur operasional.

Konteks ini penting untuk pembuat ikon karena icon tidak boleh terlihat seperti app laundry generik. Icon harus terasa sebagai bagian dari sistem bisnis laundry modern: ada order, outlet, pelanggan, pembayaran, produksi, kurir, laporan, dan kontrol owner.

### Website dan Owner Dashboard

Website WashWallet memiliki dua fungsi besar:

- Public marketing website untuk menjelaskan produk WashWallet kepada owner laundry.
- Owner/admin dashboard untuk mengelola bisnis laundry secara menyeluruh.

Public website menjelaskan value proposition WashWallet melalui halaman seperti:

- landing page utama.
- about.
- FAQ.
- feature pages untuk operational management, financial accounting, HR/payroll, membership, coin system, dan affiliate program.
- pricing/value section, ROI calculator, comparison, dan CTA register/login.

Owner dashboard adalah pusat kontrol bisnis laundry. Dari web dashboard, owner/admin dapat mengelola:

- Outlet multi-cabang.
- Layanan laundry, kategori, unit, harga, service package, dan membership plan.
- Data customer, subscription/deposit, membership contract, dan loyalty.
- Order dan payment monitoring.
- Courier setting, courier schedule, dan pricing strategy seperti flat rate, distance based, tiered, dan zone based.
- Employee, position, salary, payroll, loan/kasbon, fine/denda.
- Keuangan outlet seperti expense, deposit, petty cash, dan prive.
- Accounting seperti chart of accounts, journal entries, general ledger, profit loss, balance sheet, dan accounting period.
- Owner wallet, bank account, withdrawal, dan admin withdrawal processing.
- Coin system, feature unlock, trial, exposure, dan auto renewal.
- Notification center.
- Import/export data untuk onboarding outlet, customer, category, dan laundry service.

Alasan dibuat:

- Owner laundry butuh satu pusat kontrol untuk melihat performa, mengatur outlet, mengelola layanan, dan membaca laporan.
- Data bisnis laundry sering tersebar di kasir, spreadsheet, chat, nota, dan laporan manual.
- Owner perlu mengontrol bisnis tanpa harus selalu hadir di outlet.
- Platform perlu public website untuk menjelaskan manfaat WashWallet dan mengarahkan calon owner ke register/login.

Manfaat:

- Owner mendapat command center untuk multi-outlet.
- Konfigurasi layanan, harga, courier, membership, dan employee bisa dipakai ulang oleh mobile apps.
- Order dari customer dan cashier dapat dipantau dari web.
- Proses finance/accounting/payroll lebih terstruktur.
- Public website membantu menjelaskan bahwa WashWallet adalah SaaS laundry, bukan hanya app pencatat order.

Implikasi untuk icon:

- Mobile app icons harus terasa sebagai bagian dari ekosistem bisnis laundry yang rapi dan profesional.
- Jangan membuat icon terlalu playful seperti app consumer casual karena sistem ini juga dipakai owner, kasir, staf produksi, dan kurir.
- Jangan membuat icon terlalu corporate/finance-only karena inti produknya tetap laundry operations.
- Brand utama harus terasa bersih, terpercaya, modern, dan operational.

### Hubungan Antar Aplikasi

Ekosistem WashWallet bisa dipahami sebagai alur berikut:

1. Owner melihat public website dan memahami value produk.
2. Owner/admin mengatur outlet, layanan, harga, courier, employee, finance, membership, dan fitur dari web dashboard.
3. Customer memakai Customer App untuk mencari outlet, memilih layanan, membuat order, mengatur pickup/delivery, membayar, topup, dan melacak order.
4. Cashier memakai Cashier App untuk menerima order, membuat order walk-in, menimbang cucian, menghitung harga, menerima pembayaran, mengelola customer, dan print struk/label.
5. Production/courier memakai Production App untuk memproses order, melacak item, mengatur pickup, upload bukti foto, mengirim WhatsApp notification, dan print label.
6. Owner kembali memantau performa, order, finance, accounting, payroll, wallet, dan outlet dari web dashboard.

Setiap mobile app punya alasan keberadaan yang berbeda:

- Customer App dibuat untuk memudahkan pelanggan memesan laundry tanpa proses manual.
- Cashier App dibuat untuk mempercepat transaksi outlet dan mengurangi salah hitung.
- Production App dibuat untuk membuat proses produksi dan pickup lebih tertib serta dapat dilacak.

Karena itu icon ketiga app harus:

- Satu keluarga brand.
- Berbeda jelas dari sisi simbol.
- Menyampaikan role aplikasi hanya dari bentuk utama.
- Tidak mencoba memasukkan seluruh ekosistem ke setiap icon.

## Sistem Ikon yang Diinginkan

Ketiga icon harus terasa satu keluarga:

- Sama-sama memakai full-square background berbasis teal.
- Sama-sama memakai simbol utama berbentuk clean vector/3D-soft minimal, bukan foto.
- Sama-sama memakai bentuk sederhana dengan ruang kosong cukup.
- Sama-sama memakai lighting/shading halus di dalam artwork, tanpa drop shadow eksternal.
- Sama-sama punya metafora laundry + fungsi app.

Perbedaan antar app:

- Cashier: fokus transaksi, POS, order, receipt, pembayaran, printer.
- Customer: fokus pelanggan, order laundry, wallet/topup, pickup/delivery, lokasi.
- Production: fokus proses internal, workflow, item laundry, kurir pickup, status selesai.

Hindari membuat tiga icon hanya berbeda warna tetapi simbolnya sama. Pengguna internal harus bisa membedakan app dari bentuk utama, bukan hanya dari nama app.

## Prompt Umum Untuk Model Gambar

Gunakan prompt umum ini sebagai dasar, lalu tambahkan bagian spesifik tiap app:

```text
Create a premium Google Play app icon for the WashWallet mobile app ecosystem. 512x512 square PNG composition, full-square artwork, no rounded corners in the source image, no external drop shadow, no text, no badges. Clean modern vector-style or soft 3D-minimal icon, professional laundry technology brand, teal-led palette using deep teal #125B48 and fresh mint highlights. The icon should be readable at small sizes, with one strong central symbol, simple geometry, high contrast, and polished sRGB colors. Avoid clutter, avoid photorealism, avoid tiny UI details.
```

Negative prompt:

```text
No text, no letters, no "WW" monogram unless explicitly requested, no Play Store logo, no price/ranking badge, no "#1", no "free", no sale label, no people, no hands, no phone mockup, no screenshots, no QR code, no barcode as primary detail, no realistic photo, no overloaded laundry basket, no complex background, no thin lines, no tiny receipt text, no rounded-corner canvas, no external drop shadow.
```

## App 1: WashWallet Cashier

### Product Role

Cashier adalah aplikasi POS/front-office outlet laundry. User utamanya adalah kasir atau employee outlet. App dipakai untuk:

- Login employee/kasir.
- Melihat dashboard outlet.
- Menerima new order notification.
- Membuat order laundry.
- Menimbang laundry dan memasukkan item/service.
- Mengelola pembayaran.
- Mengelola customer, membership, service, deposit, expense, petty cash, dan finance.
- Print receipt/label memakai thermal printer Bluetooth.
- Mengirim atau menyiapkan WhatsApp notification.

### Alasan Dibuat

Cashier App dibuat karena workflow kasir laundry tidak sesederhana transaksi retail biasa. Kasir harus menerima cucian, memilih layanan, mencatat customer, menghitung quantity/berat, menyesuaikan harga setelah timbang, mengelola membership/deposit, menerima pembayaran, mencetak struk/label, dan tetap merespons order online yang masuk dari Customer App.

Tanpa app khusus, outlet rawan mengalami:

- salah hitung harga karena layanan, quantity, membership, deposit, atau payment status berbeda-beda.
- order online terlambat diterima karena kasir harus refresh manual atau melihat chat.
- data customer dan riwayat transaksi tercecer.
- bukti pembayaran, expense, petty cash, dan setoran outlet sulit diaudit.
- proses print struk/label terpisah dari order digital.

### Manfaat Untuk User dan Bisnis

Untuk kasir:

- Transaksi lebih cepat karena alur order dibuat step-by-step.
- Perhitungan harga lebih konsisten.
- Order online lebih cepat diketahui lewat notification dan banner.
- Struk/label dapat dicetak dari data order.
- Data customer dan membership mudah dilihat saat checkout.

Untuk owner/outlet:

- Order lebih rapi sejak diterima di front desk.
- Potensi salah hitung dan salah catat berkurang.
- Dana outlet seperti deposit, petty cash, dan expense lebih mudah ditelusuri.
- Customer loyalty seperti membership dan deposit benar-benar masuk ke workflow transaksi.

### Fitur Penting Yang Bisa Menginspirasi Icon

- POS order workflow.
- Receipt/struk dan label thermal.
- Payment cash/transfer/QRIS/payment status.
- Smart pricing berdasarkan layanan, berat/quantity, membership, dan deposit.
- Customer search dan quick add.
- New order notification.
- Daily outlet finance: deposit, expense, petty cash.

Yang paling penting untuk icon: "kasir laundry digital", bukan "dompet", bukan "produksi", dan bukan "website dashboard".

### Visual Meaning

Icon harus menyampaikan "laundry POS" atau "kasir laundry digital". Orang yang melihat icon harus menangkap bahwa ini bukan app customer biasa, melainkan tool transaksi/order untuk staf outlet.

Metafora utama yang disarankan:

- Receipt/struk + water drop/laundry fold.
- POS terminal + clean droplet.
- Receipt sheet dengan checkmark dan small payment card.
- Printer receipt keluar dari terminal dengan simbol droplet.

Metafora pendukung:

- Garis receipt sederhana.
- Coin/card/payment chip sederhana.
- Checkmark order selesai.
- Sparkle kecil untuk clean service, maksimal 1-2 detail.

Warna:

- Background utama deep teal `#125B48` atau gradient halus `#125B48` ke `#0C3F32`.
- Simbol utama putih/mint `#FFFFFF`, `#E8F3F0`, `#A3CDC3`.
- Accent amber `#F59E0B` untuk transaksi/payment, digunakan kecil saja.

Do:

- Buat bentuk receipt/POS besar dan jelas di tengah.
- Masukkan elemen laundry sebagai droplet atau folded cloth sederhana.
- Beri kesan cepat, rapi, dan operasional.
- Jaga agar icon tetap bisa dibaca saat 48px.

Don't:

- Jangan gunakan keranjang laundry customer sebagai simbol utama karena akan mirip customer app.
- Jangan gunakan gear sebagai simbol utama karena akan mirip production app.
- Jangan masukkan teks nominal uang, invoice number, atau barcode detail.
- Jangan terlalu banyak elemen finance sehingga icon terlihat seperti accounting app umum.

Prompt spesifik:

```text
Design the Google Play icon for "WashWallet Cashier", a laundry POS and cashier app for outlet staff. Central symbol: a clean receipt or POS terminal combined with a simple laundry water droplet/folded cloth mark and a small payment accent. Deep teal full-square background, mint and white foreground, small amber payment accent. Modern, polished, operational, readable at small size, no text, no external shadow, no rounded canvas.
```

Alt text singkat:

```text
Receipt and payment icon with a laundry droplet for WashWallet Cashier.
```

## App 2: WashWallet Customer

### Product Role

Customer adalah aplikasi pelanggan. User utamanya adalah customer laundry. App dipakai untuk:

- Register/login OTP atau password.
- Melihat home dashboard customer.
- Mencari outlet dan service laundry.
- Menyimpan alamat dan lokasi.
- Checkout order dengan pickup courier atau self dropoff.
- Memilih jadwal courier dan melihat fee.
- Melacak status order.
- Melihat invoice dan melakukan pembayaran.
- Wallet/topup.
- Review order dan profile.
- Menerima push notification seperti order accepted/topup success.

### Alasan Dibuat

Customer App dibuat agar pelanggan laundry bisa melakukan self-service dari ponsel. Pelanggan tidak perlu datang ke outlet hanya untuk melihat layanan, mengecek harga, membuat order, mengatur pickup, membayar, atau menanyakan status cucian.

Masalah yang diselesaikan:

- Customer sering tidak tahu outlet mana yang tersedia, layanan apa yang ada, dan apakah courier didukung.
- Order lewat chat rentan tidak lengkap: alamat, jadwal, layanan, catatan, dan metode pembayaran bisa tercecer.
- Pelanggan perlu tracking status order, invoice, dan payment tanpa terus bertanya ke kasir.
- Pickup/delivery butuh alamat, koordinat, jadwal, dan fee yang jelas.
- Customer butuh saldo/topup atau deposit agar pembayaran lebih mudah.

### Manfaat Untuk User dan Bisnis

Untuk customer:

- Bisa menemukan outlet dan layanan laundry dari satu app.
- Bisa memilih layanan, jadwal pickup, alamat, dan metode pembayaran sendiri.
- Bisa melihat order history, invoice, status, dan notification.
- Bisa menyimpan alamat dan topup saldo.
- Proses laundry terasa lebih transparan.

Untuk outlet/owner:

- Order yang masuk lebih terstruktur.
- Kasir menerima data service, alamat, jadwal, catatan, dan payment method lebih lengkap.
- Peluang repeat order meningkat karena customer punya account, address book, wallet/topup, dan history.
- Beban komunikasi manual berkurang.

### Fitur Penting Yang Bisa Menginspirasi Icon

- Search/discovery outlet dan layanan laundry.
- Nearby outlet/location.
- Laundry cart dan checkout.
- Pickup/delivery schedule.
- Wallet/topup/payment.
- Order tracking dan invoice.
- Address book.
- Push notification order accepted/topup success.

Yang paling penting untuk icon: "pelanggan memesan laundry dengan mudah", bukan "kasir", bukan "factory process", dan bukan sekadar "dompet finansial".

### Visual Meaning

Icon harus menyampaikan "customer laundry service" yang mudah, bersih, dan mobile-friendly. Ini app paling consumer-facing, jadi boleh terasa lebih friendly, ringan, dan approachable dibanding cashier/production.

Metafora utama yang disarankan:

- Wallet/card + water drop/laundry sparkle.
- Laundry bag/basket minimal + location pin.
- Clean folded shirt + wallet card.
- Droplet shield/heart with small delivery route pin.

Metafora pendukung:

- Location pin untuk outlet discovery/pickup.
- Small route curve untuk pickup/delivery.
- Wallet/card untuk topup/payment.
- Sparkle kecil untuk clean result.

Warna:

- Background utama teal/mint yang lebih fresh: `#2F7F6F` ke `#125B48`, atau mint full background dengan deep teal symbol.
- Foreground putih/mint/deep teal.
- Accent blue `#3B82F6` untuk location/tracking atau payment, kecil saja.
- Accent green `#22C55E` boleh dipakai kecil untuk success/clean.

Do:

- Buat icon paling friendly di antara tiga app.
- Pakai bentuk lebih rounded dan approachable di dalam artwork.
- Tunjukkan laundry + convenience/customer journey.
- Jika memakai wallet, gabungkan dengan droplet/laundry supaya tidak terlihat seperti app e-wallet umum.

Don't:

- Jangan membuat icon hanya berupa dompet karena akan kehilangan konteks laundry.
- Jangan membuat icon hanya berupa keranjang laundry karena tidak menjelaskan wallet/topup/order tracking.
- Jangan gunakan POS terminal/receipt sebagai elemen utama karena itu milik cashier.
- Jangan gunakan gear/proses produksi sebagai elemen utama.

Prompt spesifik:

```text
Design the Google Play icon for "WashWallet Customer", a customer laundry app for finding outlets, scheduling pickup, paying/topup, and tracking orders. Central symbol: a friendly wallet/card or laundry bag combined with a clean water droplet and a subtle location/pickup cue. Teal and mint brand palette with a small blue accent for location/tracking. Consumer-friendly, clean, premium, simple, readable at small size, no text, no badges, no rounded canvas, no external shadow.
```

Alt text singkat:

```text
Wallet and laundry droplet icon with a pickup cue for WashWallet Customer.
```

## App 3: WashWallet Production

### Product Role

Production adalah aplikasi operasional internal untuk staf produksi dan kurir. App dipakai untuk:

- Login employee.
- Dashboard produksi berdasarkan permission.
- Melihat order ready/in-progress.
- Memproses item laundry per tahap.
- Mengelola courier pickup schedule.
- Konfirmasi pickup dengan foto bukti.
- Membuka maps untuk pickup.
- Print label/receipt.
- WhatsApp pickup notification.
- Push/realtime new pickup notification.

### Alasan Dibuat

Production App dibuat karena bisnis laundry tidak selesai setelah order dibuat dan dibayar. Setelah transaksi, order harus masuk ke antrean produksi, diproses per item/tahap, dipantau statusnya, dijemput oleh kurir jika perlu, dan diberi bukti operasional.

Masalah yang diselesaikan:

- Staf produksi perlu tahu order mana yang siap dikerjakan, sedang berjalan, prioritas, atau siap pickup.
- Proses laundry sering punya banyak tahap dan item, sehingga status global order saja tidak cukup.
- Kurir membutuhkan jadwal pickup, alamat, navigasi, status perjalanan, dan bukti foto.
- Customer perlu komunikasi saat pickup atau status berubah.
- Label/struk tetap dibutuhkan untuk menghubungkan barang fisik dengan order digital.
- Owner/outlet membutuhkan traceability dari order, item, proses, kurir, sampai bukti foto.

### Manfaat Untuk User dan Bisnis

Untuk staf produksi:

- Antrean kerja lebih jelas.
- Action yang boleh dilakukan mengikuti status order/item.
- Proses item dapat dilacak sampai tahap start/complete.
- Label/struk membantu identifikasi fisik pakaian.

Untuk kurir:

- Jadwal pickup lebih rapi berdasarkan tanggal, outlet, dan slot waktu.
- Alamat dan detail order tersedia di satu tempat.
- Bukti foto membuat pickup lebih akuntabel.
- WhatsApp notification bisa dikirim dari template/backend, bukan diketik manual.

Untuk owner/outlet:

- Produksi dan pickup lebih tertib.
- Risiko miss communication turun.
- Ada rekam jejak operasional yang lebih jelas.
- Order dari Customer/Cashier App dapat dieksekusi oleh tim internal secara terstruktur.

### Fitur Penting Yang Bisa Menginspirasi Icon

- Production dashboard dan antrean proses.
- Order ready-to-process dan in-progress.
- Item-level production tracking.
- Process start/complete.
- Courier pickup schedule.
- Pickup proof photo.
- WhatsApp pickup notification.
- Thermal print label/receipt.
- Permission-aware access untuk staf produksi/kurir.

Yang paling penting untuk icon: "workflow produksi laundry yang tertib", bukan "kasir transaksi", bukan "customer order", dan bukan gear generic tanpa konteks laundry.

### Visual Meaning

Icon harus menyampaikan "workflow produksi laundry" atau "operational processing". Ini app untuk proses internal setelah order masuk, bukan app kasir dan bukan app pelanggan. Icon harus terasa lebih structured, action-oriented, dan reliable.

Metafora utama yang disarankan:

- Gear/process loop + folded cloth/droplet.
- Checklist/process steps + laundry item.
- Conveyor/process arrow + clean shirt.
- Route/checkmark + laundry tag.

Metafora pendukung:

- Small checkmark untuk status selesai.
- Small route arrow untuk courier pickup.
- Tag/label untuk print label.
- Gear sederhana, tetapi jangan terlalu industrial berat.

Warna:

- Background utama dark teal `#0C3F32` atau `#082B23` agar terasa internal/operational.
- Foreground mint/white `#E8F3F0`, `#FFFFFF`.
- Accent amber `#F59E0B` atau blue `#3B82F6` untuk process/pickup, secukupnya.
- Bisa gunakan green `#22C55E` kecil untuk completion check.

Do:

- Buat simbol proses/gear/checklist jelas di tengah.
- Gabungkan process symbol dengan laundry droplet/folded cloth agar tidak terlihat seperti generic factory app.
- Beri kesan stabil, presisi, dan siap kerja.
- Pastikan bentuk utama berbeda dari cashier receipt dan customer wallet.

Don't:

- Jangan pakai receipt/POS sebagai simbol utama.
- Jangan pakai wallet/customer bag sebagai simbol utama.
- Jangan membuat gear terlalu kompleks atau terlalu banyak teeth kecil.
- Jangan membuat icon terlihat seperti maintenance app atau generic settings app tanpa laundry cue.

Prompt spesifik:

```text
Design the Google Play icon for "WashWallet Production", an internal laundry production and courier operations app. Central symbol: a simple process gear or checklist loop combined with folded laundry or a water droplet, plus a small checkmark or route cue. Dark teal full-square background, white and mint foreground, small amber or blue operational accent. Professional, reliable, clean operational workflow, readable at small size, no text, no external shadow, no rounded canvas.
```

Alt text singkat:

```text
Laundry process icon with a gear/checklist and completion cue for WashWallet Production.
```

## Recommended Family Direction

Jika model/designer ingin membuat satu set ikon yang konsisten, gunakan struktur berikut:

| App | Background | Main symbol | Accent | Feeling |
| --- | --- | --- | --- | --- |
| Cashier | Deep teal | Receipt/POS + droplet | Amber payment accent | Transactional, front-office, fast |
| Customer | Fresh teal/mint | Wallet/laundry bag + droplet/location | Blue tracking accent | Friendly, convenient, consumer |
| Production | Dark teal | Gear/checklist/process + laundry | Amber/blue process accent | Structured, internal, reliable |

Common motif:

- Water droplet or clean folded cloth appears in all icons.
- Each app gets one unique operational object:
  - Cashier: receipt/POS.
  - Customer: wallet/location/pickup.
  - Production: gear/checklist/process.
- Shared teal brand background ties the suite together.

## Avoiding Ambiguity

Potential confusion and how to avoid it:

- Cashier vs Customer:
  - Cashier must show receipt/POS/payment terminal.
  - Customer must show wallet/location/laundry pickup, not receipt/POS.
- Cashier vs Production:
  - Cashier can include order check/payment, but not gear/process loop.
  - Production can include checklist/checkmark, but not payment terminal.
- Customer vs Production:
  - Customer can include route pin for pickup convenience.
  - Production can include route/check only as courier workflow, paired with process/gear/tag so it feels internal.

## Style Guardrails

Preferred style:

- Simple vector icon or soft 3D minimal.
- Clean geometric composition.
- Single strong central metaphor.
- Full-square background with gentle depth inside the artwork.
- Rounded internal shapes are okay.
- High contrast between foreground and background.
- No realistic texture-heavy cloth.
- No small UI mockups.

Not preferred:

- Photorealistic laundry machine, washing basket, or human hands.
- Complex scene with outlet, courier, phone, payment, and clothes all at once.
- Tiny text labels.
- Thin outline-only icon with low contrast.
- Generic water droplet only, because all three apps would become indistinguishable.
- Generic wallet only, because WashWallet is not just a financial wallet app.

## Final Asset Checklist

Before using the generated icon:

- Confirm final image is exactly 512x512.
- Confirm PNG is 32-bit and sRGB.
- Confirm file size is <= 1024KB.
- Confirm icon has no rounded canvas corners.
- Confirm icon has no external drop shadow.
- Confirm important artwork is not near the edge.
- Confirm icon remains readable at 48px and 32px.
- Confirm no text, badge, ranking, price, Google Play logo, or third-party logo appears.
- Confirm all three icons are visually related but distinguishable by silhouette.
- Confirm generated launcher icon/adaptive icon variants match the Play Store icon family.
