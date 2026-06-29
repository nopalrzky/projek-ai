import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:print_bluetooth_thermal/print_bluetooth_thermal.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'printer_setting_state.dart';

class PrinterSettingCubit extends Cubit<PrinterSettingState> {
  final ThermalPrinterService _printerService;
  final SharedPreferences _sharedPreferences;
  static const String _defaultPrinterKey = 'default_printer_mac';

  PrinterSettingCubit({
    required ThermalPrinterService printerService,
    required SharedPreferences sharedPreferences,
  }) : _printerService = printerService,
       _sharedPreferences = sharedPreferences,
       super(PrinterSettingInitial()) {
    final defaultMac = _sharedPreferences.getString(_defaultPrinterKey);
    _printerService.setSelectedPrinterAddress(defaultMac);
  }

  Future<void> loadPrinterSettings() async {
    emit(PrinterSettingLoading());
    try {
      final devices = await _printerService.getAvailableDevices();
      final defaultMac = _sharedPreferences.getString(_defaultPrinterKey);
      _printerService.setSelectedPrinterAddress(defaultMac);
      final isConnected = await _printerService.isConnected();

      String? connectedAddress;
      if (isConnected) {
        connectedAddress = defaultMac;
      }

      emit(
        PrinterSettingLoaded(
          devices: devices,
          defaultAddress: defaultMac,
          connectedAddress: connectedAddress,
        ),
      );

      if (!isConnected && defaultMac != null) {
        final device = devices
            .where((d) => d.macAdress == defaultMac)
            .firstOrNull;
        if (device != null) {
          await connectToDevice(device);
        }
      }
    } catch (e) {
      emit(PrinterSettingError(e.toString()));
    }
  }

  Future<void> scanDevices() async {
    final currentState = state;
    String? defaultMac;
    String? connectedMac;

    if (currentState is PrinterSettingLoaded) {
      defaultMac = currentState.defaultAddress;
      connectedMac = currentState.connectedAddress;
    }

    emit(PrinterSettingScanning());
    try {
      final devices = await _printerService.getAvailableDevices();
      emit(
        PrinterSettingLoaded(
          devices: devices,
          defaultAddress: defaultMac,
          connectedAddress: connectedMac,
        ),
      );
    } catch (e) {
      emit(PrinterSettingError(e.toString()));
      if (currentState is PrinterSettingLoaded) {
        emit(currentState);
      }
    }
  }

  Future<void> connectToDevice(BluetoothInfo device) async {
    final currentState = state;
    if (currentState is! PrinterSettingLoaded) return;

    emit(PrinterSettingLoading());
    try {
      await _printerService.connectToDevice(device);
      // Save as default
      await _sharedPreferences.setString(_defaultPrinterKey, device.macAdress);

      final devices = await _printerService.getAvailableDevices();
      emit(
        PrinterSettingLoaded(
          devices: devices,
          defaultAddress: device.macAdress,
          connectedAddress: device.macAdress,
        ),
      );
    } catch (e) {
      emit(PrinterSettingError('Gagal terhubung ke ${device.name}: $e'));
    }
  }

  Future<void> disconnect() async {
    final currentState = state;
    if (currentState is! PrinterSettingLoaded) return;

    try {
      await _printerService.disconnect();
      emit(
        PrinterSettingLoaded(
          devices: currentState.devices,
          defaultAddress: currentState.defaultAddress,
          connectedAddress: null,
        ),
      );
    } catch (e) {
      emit(PrinterSettingError(e.toString()));
    }
  }

  Future<void> testPrint() async {
    final currentState = state;

    try {
      await _printerService.testPrint();
      emit(const PrinterSettingTestPrintSuccess());
    } catch (e) {
      emit(PrinterSettingError(e.toString()));
    }

    if (currentState is PrinterSettingLoaded) {
      emit(currentState);
    }
  }
}
