import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/printer_setting_cubit.dart';
import '../bloc/printer_setting_state.dart';

class PrinterSettingScreen extends StatefulWidget {
  const PrinterSettingScreen({super.key});

  @override
  State<PrinterSettingScreen> createState() => _PrinterSettingScreenState();
}

class _PrinterSettingScreenState extends State<PrinterSettingScreen> {
  @override
  void initState() {
    super.initState();
    context.read<PrinterSettingCubit>().loadPrinterSettings();
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<PrinterSettingCubit, PrinterSettingState>(
      listener: (context, state) {
        if (state is PrinterSettingError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: context.colors.error,
            ),
          );
        } else if (state is PrinterSettingTestPrintSuccess) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Test print berhasil dikirim ke printer.'),
              backgroundColor: context.colors.primary,
            ),
          );
        }
      },
      builder: (context, state) {
        return AppLayout(
          header: AppHeader(
            title: 'Pengaturan Printer',
            type: AppHeaderType.standard,
            onBackPressed: () => Navigator.pop(context),
            actions: [
              if (state is PrinterSettingLoaded)
                IconButton(
                  onPressed: () =>
                      context.read<PrinterSettingCubit>().scanDevices(),
                  icon: const Icon(Icons.refresh),
                ),
            ],
          ),
          body: ContentConstraint(child: _buildBody(context, state)),
        );
      },
    );
  }

  Widget _buildBody(BuildContext context, PrinterSettingState state) {
    if (state is PrinterSettingLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state is PrinterSettingLoaded) {
      if (state.devices.isEmpty) {
        return AppEmptyState(
          icon: Icons.print_disabled_outlined,
          title: 'Tidak Ada Printer Terpasang',
          description:
              'Pastikan printer thermal Anda sudah terhubung (paired) di pengaturan Bluetooth HP Anda.',
          action: AppButton.primary(
            label: 'Pindai Perangkat',
            icon: const Icon(Icons.search, size: 18.0),
            onPressed: () => context.read<PrinterSettingCubit>().scanDevices(),
          ),
        );
      }

      return ListView.separated(
        padding: EdgeInsets.all(context.space.md),
        itemCount: state.devices.length,
        separatorBuilder: (context, index) =>
            SizedBox(height: context.space.sm),
        itemBuilder: (context, index) {
          final device = state.devices[index];
          final isConnected = state.connectedAddress == device.macAdress;
          final isDefault = state.defaultAddress == device.macAdress;

          return Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(context.radius.md),
              side: BorderSide(
                color: isConnected
                    ? context.colors.primary
                    : context.colors.outlineVariant,
                width: isConnected ? 2.0 : 1.0,
              ),
            ),
            child: Padding(
              padding: EdgeInsets.all(context.space.md),
              child: Column(
                children: [
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Container(
                      padding: EdgeInsets.all(context.space.xs),
                      decoration: BoxDecoration(
                        color: isConnected
                            ? context.colors.primaryContainer
                            : context.colors.surfaceVariant,
                        borderRadius: BorderRadius.circular(context.radius.sm),
                      ),
                      child: Icon(
                        Icons.print_outlined,
                        color: isConnected
                            ? context.colors.primary
                            : context.colors.onSurfaceVariant,
                      ),
                    ),
                    title: Text(
                      device.name,
                      style: context.typography.titleMedium,
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(device.macAdress),
                        if (isConnected || isDefault)
                          Padding(
                            padding: const EdgeInsets.only(top: 4.0),
                            child: Row(
                              children: [
                                if (isConnected)
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 6,
                                      vertical: 2,
                                    ),
                                    decoration: BoxDecoration(
                                      color: context.colors.primary.withValues(
                                        alpha: 0.1,
                                      ),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      'Terhubung',
                                      style: TextStyle(
                                        color: context.colors.primary,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                if (isConnected && isDefault)
                                  const SizedBox(width: 4),
                                if (isDefault)
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 6,
                                      vertical: 2,
                                    ),
                                    decoration: BoxDecoration(
                                      color: context.colors.secondary
                                          .withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      'Default',
                                      style: TextStyle(
                                        color: context.colors.secondary,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                      ],
                    ),
                    trailing: SizedBox(
                      width: 110,
                      child: isConnected
                          ? AppButton.outline(
                              label: 'Putuskan',
                              onPressed: () => context
                                  .read<PrinterSettingCubit>()
                                  .disconnect(),
                            )
                          : AppButton.primary(
                              label: 'Hubungkan',
                              onPressed: () => context
                                  .read<PrinterSettingCubit>()
                                  .connectToDevice(device),
                            ),
                    ),
                  ),
                  if (isConnected) ...[
                    const Divider(),
                    SizedBox(height: context.space.xs),
                    AppButton.ghost(
                      label: 'Test Print Struk',
                      icon: const Icon(Icons.receipt_long, size: 18),
                      onPressed: () =>
                          context.read<PrinterSettingCubit>().testPrint(),
                      isFullWidth: true,
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      );
    }

    return AppEmptyState(
      icon: Icons.print_disabled_outlined,
      title: 'Siapkan Printer Anda',
      description:
          'Gunakan printer Bluetooth thermal 58mm untuk mencetak struk transaksi.',
      action: AppButton.primary(
        label: 'Cari Printer',
        icon: const Icon(Icons.search, size: 18.0),
        onPressed: () =>
            context.read<PrinterSettingCubit>().loadPrinterSettings(),
      ),
    );
  }
}
