import 'package:intl/intl.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:print_bluetooth_thermal/print_bluetooth_thermal.dart';

class PrintItemData {
  final String serviceName;
  final double quantity;
  final String unitName;
  final double unitPrice;
  final double totalAmount;

  const PrintItemData({
    required this.serviceName,
    required this.quantity,
    required this.unitName,
    required this.unitPrice,
    required this.totalAmount,
  });
}

class ThermalPrinterService {
  String? _connectedDeviceAddress;

  void setSelectedPrinterAddress(String? address) {
    _connectedDeviceAddress = address;
  }

  Future<bool> requestPermissions() async {
    final statusConnect = await Permission.bluetoothConnect.request();
    final statusScan = await Permission.bluetoothScan.request();
    return statusConnect.isGranted && statusScan.isGranted;
  }

  Future<bool> isBluetoothEnabled() async {
    try {
      return await PrintBluetoothThermal.bluetoothEnabled;
    } catch (_) {
      return false;
    }
  }

  Future<bool> connectToPrinter() async {
    try {
      final hasPermission = await requestPermissions();
      if (!hasPermission) return false;

      if (_connectedDeviceAddress == null) {
        throw Exception(
          'Belum ada printer yang dipilih. Buka Pengaturan > Printer untuk memilih printer.',
        );
      }

      final success = await PrintBluetoothThermal.connect(
        macPrinterAddress: _connectedDeviceAddress!,
      );
      return success;
    } catch (e) {
      throw Exception('Gagal menghubungkan printer: $e');
    }
  }

  Future<void> disconnect() async {
    await PrintBluetoothThermal.disconnect;
  }

  Future<bool> isConnected() async {
    try {
      return await PrintBluetoothThermal.connectionStatus;
    } catch (_) {
      return false;
    }
  }

  Future<List<BluetoothInfo>> getAvailableDevices() async {
    try {
      final hasPermission = await requestPermissions();
      if (!hasPermission) {
        throw Exception(
          'Izin Bluetooth diperlukan. Aktifkan izin "Perangkat Terdekat" di pengaturan aplikasi.',
        );
      }
      return await PrintBluetoothThermal.pairedBluetooths;
    } catch (e) {
      throw Exception('Gagal mendapatkan daftar perangkat: $e');
    }
  }

  Future<void> connectToDevice(BluetoothInfo device) async {
    try {
      final success = await PrintBluetoothThermal.connect(
        macPrinterAddress: device.macAdress,
      );
      if (success) {
        _connectedDeviceAddress = device.macAdress;
      } else {
        throw Exception('Gagal terhubung ke ${device.name}');
      }
    } catch (e) {
      throw Exception('Gagal terhubung ke perangkat: $e');
    }
  }

  Future<void> printReceiptFromData({
    required String outletName,
    required String outletAddress,
    required String orderNumber,
    required String orderDate,
    required String cashierName,
    required String customerName,
    required String customerPhone,
    required List<PrintItemData> items,
    required double subtotal,
    required double discountAmount,
    required double taxAmount,
    required double totalAmount,
    required double paidAmount,
    required double remainingAmount,
    required String paymentStatus,
    String? estimatedCompletion,
  }) async {
    try {
      await _ensureConnected();

      final bytes = <int>[];
      bytes.addAll([0x1B, 0x40]);
      bytes.addAll([0x1B, 0x61, 0x01]);
      bytes.addAll([0x1B, 0x45, 0x01]);
      bytes.addAll([0x1D, 0x21, 0x11]);
      bytes.addAll(_encodeText('$outletName\n'));
      bytes.addAll([0x1D, 0x21, 0x00]);
      bytes.addAll([0x1B, 0x45, 0x00]);
      bytes.addAll(_encodeText('$outletAddress\n'));
      bytes.addAll(_encodeText('--------------------------------\n'));

      bytes.addAll([0x1B, 0x61, 0x00]);
      bytes.addAll([0x1B, 0x45, 0x01]);
      bytes.addAll(_encodeText('No. Pesanan: $orderNumber\n'));
      bytes.addAll([0x1B, 0x45, 0x00]);
      bytes.addAll(_encodeText('Tanggal: $orderDate\n'));
      bytes.addAll(_encodeText('Kasir: $cashierName\n'));
      bytes.addAll(_encodeText('Pelanggan: $customerName\n'));
      if (customerPhone != '-') {
        bytes.addAll(_encodeText('Telepon: $customerPhone\n'));
      }
      bytes.addAll(_encodeText('--------------------------------\n'));

      if (items.isNotEmpty) {
        bytes.addAll([0x1B, 0x45, 0x01]);
        bytes.addAll(_encodeText('ITEM PESANAN\n'));
        bytes.addAll([0x1B, 0x45, 0x00]);
        bytes.addAll(_encodeText('--------------------------------\n'));

        for (final item in items) {
          final qty = item.quantity % 1 == 0
              ? item.quantity.toInt().toString()
              : item.quantity.toString();
          bytes.addAll(_encodeText('${item.serviceName}\n'));
          bytes.addAll(
            _encodeText(
              '  $qty ${item.unitName} x ${_formatCurrency(item.unitPrice)} = ${_formatCurrency(item.totalAmount)}\n',
            ),
          );
        }
        bytes.addAll(_encodeText('--------------------------------\n'));
      }

      bytes.addAll(
        _encodeText(_padRow('Subtotal:', _formatCurrency(subtotal))),
      );
      if (discountAmount > 0) {
        bytes.addAll(
          _encodeText(
            _padRow('Diskon:', '- ${_formatCurrency(discountAmount)}'),
          ),
        );
      }
      if (taxAmount > 0) {
        bytes.addAll(
          _encodeText(_padRow('Pajak:', _formatCurrency(taxAmount))),
        );
      }

      bytes.addAll(_encodeText('--------------------------------\n'));
      bytes.addAll([0x1B, 0x45, 0x01]);
      bytes.addAll([0x1D, 0x21, 0x01]);
      bytes.addAll(
        _encodeText(_padRow('TOTAL:', _formatCurrency(totalAmount))),
      );
      bytes.addAll([0x1D, 0x21, 0x00]);
      bytes.addAll([0x1B, 0x45, 0x00]);
      bytes.addAll(_encodeText('--------------------------------\n'));

      bytes.addAll(
        _encodeText(_padRow('Dibayar:', _formatCurrency(paidAmount))),
      );
      if (remainingAmount > 0) {
        bytes.addAll(
          _encodeText(_padRow('Sisa:', _formatCurrency(remainingAmount))),
        );
      }
      bytes.addAll(_encodeText('Status: $paymentStatus\n'));
      bytes.addAll(_encodeText('--------------------------------\n'));

      if (estimatedCompletion != null) {
        bytes.addAll(_encodeText('Estimasi Selesai:\n'));
        bytes.addAll(_encodeText('$estimatedCompletion\n\n'));
      }

      bytes.addAll([0x1B, 0x61, 0x01]);
      bytes.addAll(_encodeText('Terima Kasih\n'));
      bytes.addAll(_encodeText('Atas Kepercayaan Anda\n\n'));
      bytes.addAll(
        _encodeText(
          '${DateFormat('dd/MM/yyyy HH:mm:ss').format(DateTime.now())}\n',
        ),
      );
      bytes.addAll([0x1B, 0x64, 0x05]);
      bytes.addAll([0x1D, 0x56, 0x41, 0x00]);

      await _writeBytesOrThrow(
        bytes,
        'Printer tidak menerima data struk. Pastikan printer menyala, tidak dipakai aplikasi lain, dan masih terhubung.',
      );
    } catch (e) {
      throw Exception('Gagal mencetak struk: $e');
    }
  }

  Future<void> printLabelFromData({
    required String outletName,
    required String orderNumber,
    required String orderDate,
    required String customerName,
    required String customerPhone,
    required List<PrintItemData> items,
    String? estimatedCompletion,
  }) async {
    try {
      await _ensureConnected();

      final bytes = <int>[];
      bytes.addAll([0x1B, 0x40]);
      bytes.addAll([0x1B, 0x61, 0x01]);
      bytes.addAll([0x1B, 0x45, 0x01]);
      bytes.addAll(_encodeText('$outletName\n'));
      bytes.addAll([0x1B, 0x45, 0x00]);
      bytes.addAll(_encodeText('--------------------------------\n'));

      bytes.addAll([0x1B, 0x61, 0x00]);
      bytes.addAll([0x1B, 0x45, 0x01]);
      bytes.addAll(_encodeText('#$orderNumber\n'));
      bytes.addAll([0x1B, 0x45, 0x00]);
      bytes.addAll(_encodeText('$orderDate\n'));
      bytes.addAll(_encodeText('--------------------------------\n'));

      bytes.addAll([0x1B, 0x45, 0x01]);
      bytes.addAll(_encodeText('$customerName\n'));
      bytes.addAll([0x1B, 0x45, 0x00]);
      if (customerPhone != '-') {
        bytes.addAll(_encodeText('$customerPhone\n'));
      }
      bytes.addAll(_encodeText('--------------------------------\n'));

      if (items.isNotEmpty) {
        bytes.addAll([0x1B, 0x45, 0x01]);
        bytes.addAll(_encodeText('LAYANAN:\n'));
        bytes.addAll([0x1B, 0x45, 0x00]);
        for (final item in items) {
          final qty = item.quantity % 1 == 0
              ? item.quantity.toInt().toString()
              : item.quantity.toString();
          bytes.addAll(_encodeText('* ${item.serviceName}\n'));
          bytes.addAll(_encodeText('  $qty ${item.unitName}\n'));
        }
        bytes.addAll(_encodeText('--------------------------------\n'));
      }

      if (estimatedCompletion != null) {
        bytes.addAll(_encodeText('Est: $estimatedCompletion\n'));
      }

      bytes.addAll([0x1B, 0x64, 0x05]);
      bytes.addAll([0x1D, 0x56, 0x41, 0x00]);

      await _writeBytesOrThrow(
        bytes,
        'Printer tidak menerima data label. Pastikan printer menyala, tidak dipakai aplikasi lain, dan masih terhubung.',
      );
    } catch (e) {
      throw Exception('Gagal mencetak label: $e');
    }
  }

  Future<void> testPrint() async {
    try {
      await _ensureConnected();

      final bytes = <int>[];
      bytes.addAll([0x1B, 0x40]);
      bytes.addAll([0x1B, 0x61, 0x01]);
      bytes.addAll([0x1B, 0x45, 0x01]);
      bytes.addAll(_encodeText('TEST PRINT\n'));
      bytes.addAll([0x1B, 0x45, 0x00]);
      bytes.addAll(_encodeText('Printer Thermal Bluetooth\n'));
      bytes.addAll(
        _encodeText(
          '${DateFormat('dd/MM/yyyy HH:mm:ss').format(DateTime.now())}\n',
        ),
      );
      bytes.addAll([0x1B, 0x64, 0x05]);
      bytes.addAll([0x1D, 0x56, 0x41, 0x00]);

      await _writeBytesOrThrow(
        bytes,
        'Printer tidak menerima data test print. Pastikan printer menyala, kertas tersedia, dan koneksi Bluetooth aktif.',
      );
    } catch (e) {
      throw Exception('Test print gagal: $e');
    }
  }

  Future<void> _ensureConnected() async {
    final hasPermission = await requestPermissions();
    if (!hasPermission) throw Exception('Izin Bluetooth diperlukan');

    final bluetoothEnabled = await isBluetoothEnabled();
    if (!bluetoothEnabled) {
      throw Exception(
        'Bluetooth belum aktif. Aktifkan Bluetooth lalu coba lagi.',
      );
    }

    final connected = await isConnected();
    if (!connected) {
      final success = await connectToPrinter();
      if (!success) throw Exception('Gagal menghubungi printer');
    }
  }

  Future<void> _writeBytesOrThrow(
    List<int> bytes,
    String failureMessage,
  ) async {
    final success = await PrintBluetoothThermal.writeBytes(bytes);
    if (!success) {
      throw Exception(failureMessage);
    }
  }

  List<int> _encodeText(String text) {
    return text.codeUnits;
  }

  String _formatCurrency(double amount) {
    final format = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp',
      decimalDigits: 0,
    );
    return format.format(amount);
  }

  String _padRow(String label, String value, {int width = 32}) {
    final totalPadding = width - label.length - value.length;
    final padding = totalPadding > 0 ? ' ' * totalPadding : ' ';
    return '$label$padding$value\n';
  }
}
