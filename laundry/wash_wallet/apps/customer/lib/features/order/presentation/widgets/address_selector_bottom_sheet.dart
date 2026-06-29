import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../customer_address/domain/entities/customer_address.dart';
import '../../../customer_address/presentation/bloc/customer_address_list_cubit.dart';
import '../../../customer_address/presentation/bloc/customer_address_list_state.dart';

class AddressSelectorBottomSheet extends StatelessWidget {
  final CustomerAddress? selectedAddress;
  final Function(CustomerAddress) onAddressSelected;
  final VoidCallback? onAddAddress;

  const AddressSelectorBottomSheet({
    super.key,
    this.selectedAddress,
    required this.onAddressSelected,
    this.onAddAddress,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(context.space.lg),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(context.radius.xl),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Pilih Alamat Pengambilan',
                style: context.typography.headlineSmall.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close),
              ),
            ],
          ),
          SizedBox(height: context.space.md),
          BlocBuilder<CustomerAddressListCubit, CustomerAddressListState>(
            builder: (context, state) {
              if (state is CustomerAddressListLoading) {
                return const Center(child: AppLoadingIndicator());
              }

              if (state is CustomerAddressListFailure) {
                return Center(child: Text(state.failure.message));
              }

              if (state is CustomerAddressListSuccess) {
                if (state.addresses.isEmpty) {
                  return AppEmptyState(
                    title: 'Alamat Kosong',
                    description: 'Silakan tambah alamat terlebih dahulu.',
                    action: AppButton.primary(
                      label: 'Tambah Alamat',
                      onPressed: () {
                        onAddAddress?.call();
                      },
                    ),
                  );
                }

                return ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: state.addresses.length,
                  separatorBuilder: (context, index) =>
                      SizedBox(height: context.space.sm),
                  itemBuilder: (context, index) {
                    final address = state.addresses[index];
                    final isSelected = selectedAddress?.id == address.id;

                    return AppCard(
                      onTap: () {
                        onAddressSelected(address);
                        Navigator.pop(context);
                      },
                      child: Padding(
                        padding: EdgeInsets.all(context.space.md),
                        child: Row(
                          children: [
                            Icon(
                              address.label.toLowerCase().contains('rumah')
                                  ? Icons.home
                                  : Icons.work,
                              color: isSelected
                                  ? context.colors.primary
                                  : context.colors.textSecondary,
                            ),
                            SizedBox(width: context.space.md),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    address.label,
                                    style: context.typography.titleMedium
                                        .copyWith(fontWeight: FontWeight.bold),
                                  ),
                                  Text(
                                    address.street,
                                    style: context.typography.bodyMedium,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                            if (isSelected)
                              Icon(
                                Icons.check_circle,
                                color: context.colors.primary,
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              }

              return const SizedBox.shrink();
            },
          ),
          SizedBox(height: context.space.xl),
        ],
      ),
    );
  }
}
