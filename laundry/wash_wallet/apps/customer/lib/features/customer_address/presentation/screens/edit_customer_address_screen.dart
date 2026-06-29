import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../core/widgets/map_picker_bottom_sheet.dart';
import '../../../../core/widgets/address_autocomplete_field.dart';
import '../../domain/entities/customer_address.dart';
import '../bloc/customer_address_action_cubit.dart';
import '../bloc/customer_address_action_state.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class EditCustomerAddressScreen extends StatefulWidget {
  final CustomerAddress address;

  const EditCustomerAddressScreen({super.key, required this.address});

  @override
  State<EditCustomerAddressScreen> createState() =>
      _EditCustomerAddressScreenState();
}

class _EditCustomerAddressScreenState extends State<EditCustomerAddressScreen> {
  final _formKey = GlobalKey<FormState>();

  late final TextEditingController _labelController;
  late final TextEditingController _recipientNameController;
  late final TextEditingController _recipientPhoneController;
  late final TextEditingController _streetController;
  late final TextEditingController _notesController;
  double? _latitude;
  double? _longitude;
  String? _villageName;
  String? _districtName;
  String? _regencyName;
  String? _provinceName;

  late bool _isPrimary;

  @override
  void initState() {
    super.initState();
    _labelController = TextEditingController(text: widget.address.label);
    _recipientNameController = TextEditingController(
      text: widget.address.recipientName,
    );
    _recipientPhoneController = TextEditingController(
      text: widget.address.recipientPhone,
    );
    _streetController = TextEditingController(text: widget.address.street);
    _notesController = TextEditingController(text: widget.address.notes ?? '');
    _latitude = widget.address.latitude;
    _longitude = widget.address.longitude;
    _villageName = widget.address.villageName;
    _districtName = widget.address.districtName;
    _regencyName = widget.address.regencyName;
    _provinceName = widget.address.provinceName;
    _isPrimary = widget.address.isPrimary;
  }

  @override
  void dispose() {
    _labelController.dispose();
    _recipientNameController.dispose();
    _recipientPhoneController.dispose();
    _streetController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  String? _requiredValidator(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Field ini wajib diisi';
    }
    return null;
  }

  String? _labelValidator(String? value) {
    final requiredResult = _requiredValidator(value);
    if (requiredResult != null) return requiredResult;
    if (value!.trim().length > 50) {
      return 'Maksimal 50 karakter';
    }
    return null;
  }

  String? _recipientNameValidator(String? value) {
    final requiredResult = _requiredValidator(value);
    if (requiredResult != null) return requiredResult;
    if (value!.trim().length > 255) {
      return 'Maksimal 255 karakter';
    }
    return null;
  }

  String? _phoneValidator(String? value) {
    final requiredResult = _requiredValidator(value);
    if (requiredResult != null) return requiredResult;

    final cleaned = value!.trim();
    if (!RegExp(r'^\d+$').hasMatch(cleaned)) {
      return 'Nomor HP hanya boleh angka';
    }
    if (cleaned.length < 9) {
      return 'Nomor HP minimal 9 digit';
    }
    if (cleaned.length > 20) {
      return 'Nomor HP maksimal 20 digit';
    }

    return null;
  }

  String? _notesValidator(String? value) {
    if (value != null && value.trim().length > 500) {
      return 'Maksimal 500 karakter';
    }
    return null;
  }

  Future<void> _showMapPicker() async {
    final result = await MapPickerBottomSheet.show(
      context,
      initialLocation:
          _latitude != null && _longitude != null
              ? LatLng(_latitude!, _longitude!)
              : null,
    );

    if (result != null) {
      setState(() {
        _latitude = result['latitude'] as double?;
        _longitude = result['longitude'] as double?;
        _streetController.text = result['address'];
        _villageName = result['villageName'] as String?;
        _districtName = result['districtName'] as String?;
        _regencyName = result['regencyName'] as String?;
        _provinceName = result['provinceName'] as String?;
      });
    }
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;

    context.read<CustomerAddressActionCubit>().update(
      id: widget.address.id,
      label: _labelController.text.trim(),
      recipientName: _recipientNameController.text.trim(),
      recipientPhone: _recipientPhoneController.text.trim(),
      street: _streetController.text.trim(),
      notes:
          _notesController.text.trim().isEmpty
              ? null
              : _notesController.text.trim(),
      latitude: _latitude,
      longitude: _longitude,
      isPrimary: _isPrimary,
      villageName: _villageName,
      districtName: _districtName,
      regencyName: _regencyName,
      provinceName: _provinceName,
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<CustomerAddressActionCubit, CustomerAddressActionState>(
      listener: (context, state) {
        if (state is CustomerAddressActionSuccess) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(state.message)));
          Navigator.of(context).pop(true);
        }

        if (state is CustomerAddressActionFailure) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(state.failure.message)));
        }
      },
      builder: (context, state) {
        final isLoading = state is CustomerAddressActionLoading;

        return Scaffold(
          appBar: AppBar(title: const Text('Ubah Alamat')),
          body: SingleChildScrollView(
            padding: EdgeInsets.all(context.space.lg),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  AppTextField.outlined(
                    label: 'Label',
                    hint: 'Contoh: Rumah, Kantor',
                    controller: _labelController,
                    textInputAction: TextInputAction.next,
                    enabled: !isLoading,
                    validator: _labelValidator,
                  ),
                  SizedBox(height: context.space.md),
                  AppTextField.outlined(
                    label: 'Nama Penerima',
                    controller: _recipientNameController,
                    textInputAction: TextInputAction.next,
                    enabled: !isLoading,
                    validator: _recipientNameValidator,
                  ),
                  SizedBox(height: context.space.md),
                  AppTextField.outlined(
                    label: 'Nomor HP Penerima',
                    controller: _recipientPhoneController,
                    keyboardType: TextInputType.phone,
                    textInputAction: TextInputAction.next,
                    enabled: !isLoading,
                    validator: _phoneValidator,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  ),
                  SizedBox(height: context.space.md),
                  AddressAutocompleteField(
                    label: 'Alamat Lengkap / Jalan',
                    controller: _streetController,
                    enabled: !isLoading,
                    validator: _requiredValidator,
                    onPlaceSelected: (lat, lng, address) {
                      setState(() {
                        _latitude = lat;
                        _longitude = lng;
                      });
                    },
                  ),
                  SizedBox(height: context.space.md),
                  AppTextField.outlined(
                    label: 'Catatan (Opsional)',
                    hint: 'Contoh: pagar hitam, dekat minimarket',
                    controller: _notesController,
                    keyboardType: TextInputType.multiline,
                    textInputAction: TextInputAction.newline,
                    maxLines: 3,
                    enabled: !isLoading,
                    validator: _notesValidator,
                  ),
                  SizedBox(height: context.space.sm),
                  AppButton.outline(
                    label: 'Pilih di Peta',
                    onPressed: isLoading ? null : _showMapPicker,
                    icon: const Icon(Icons.map_outlined),
                    isFullWidth: true,
                  ),
                  SizedBox(height: context.space.md),
                  SwitchListTile.adaptive(
                    value: _isPrimary,
                    onChanged: isLoading
                        ? null
                        : (value) => setState(() => _isPrimary = value),
                    contentPadding: EdgeInsets.zero,
                    title: Text(
                      'Jadikan Alamat Utama',
                      style: context.typography.bodyMedium.copyWith(
                        color: context.colors.textPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  SizedBox(height: context.space.lg),
                  AppButton.primary(
                    label: 'Simpan Perubahan',
                    isLoading: isLoading,
                    isFullWidth: true,
                    onPressed: isLoading ? null : _submit,
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
