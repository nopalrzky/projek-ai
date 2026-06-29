import 'package:shared_preferences/shared_preferences.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import '../bloc/printer_setting_cubit.dart';

class PrinterSettingProvider {
  static PrinterSettingCubit createCubit(
    ThermalPrinterService printerService,
    SharedPreferences sharedPreferences,
  ) {
    return PrinterSettingCubit(
      printerService: printerService,
      sharedPreferences: sharedPreferences,
    );
  }
}
