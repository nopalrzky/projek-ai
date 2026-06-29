import 'package:equatable/equatable.dart';
import 'package:print_bluetooth_thermal/print_bluetooth_thermal.dart';

abstract class PrinterSettingState extends Equatable {
  const PrinterSettingState();

  @override
  List<Object?> get props => [];
}

class PrinterSettingInitial extends PrinterSettingState {}

class PrinterSettingLoading extends PrinterSettingState {}

class PrinterSettingScanning extends PrinterSettingState {}

class PrinterSettingLoaded extends PrinterSettingState {
  final List<BluetoothInfo> devices;
  final String? connectedAddress;
  final String? defaultAddress;

  const PrinterSettingLoaded({
    required this.devices,
    this.connectedAddress,
    this.defaultAddress,
  });

  @override
  List<Object?> get props => [devices, connectedAddress, defaultAddress];
}

class PrinterSettingError extends PrinterSettingState {
  final String message;

  const PrinterSettingError(this.message);

  @override
  List<Object?> get props => [message];
}

class PrinterSettingTestPrintSuccess extends PrinterSettingState {
  const PrinterSettingTestPrintSuccess();
}
