import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../domain/entities/customer_address.dart';
import '../bloc/customer_address_list_cubit.dart';
import '../bloc/customer_address_list_state.dart';
import '../widgets/customer_address_card.dart';
import '../widgets/customer_address_filter_panel.dart';
import '../widgets/customer_address_search_bar.dart';

class IndexCustomerAddressScreen extends StatefulWidget {
  const IndexCustomerAddressScreen({super.key});

  @override
  State<IndexCustomerAddressScreen> createState() =>
      _IndexCustomerAddressScreenState();
}

class _IndexCustomerAddressScreenState extends State<IndexCustomerAddressScreen>
    with TickerProviderStateMixin {
  final TextEditingController _searchController = TextEditingController();
  bool _isFilterVisible = false;
  bool? _isPrimaryFilter;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _loadAddresses() {
    context.read<CustomerAddressListCubit>().getAll(
      search: _searchController.text.trim().isEmpty
          ? null
          : _searchController.text.trim(),
      isPrimary: _isPrimaryFilter,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Alamat Saya'),
        centerTitle: false,
        elevation: 0,
        backgroundColor: context.colors.background,
        foregroundColor: context.colors.textPrimary,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final result = await context.push('/customer-addresses/create');
          if (result != null && mounted) {
            _loadAddresses();
          }
        },
        label: const Text('Tambah Alamat'),
        icon: const Icon(Icons.add_rounded),
        backgroundColor: context.colors.primary,
        foregroundColor: context.colors.onPrimary,
      ),
      body: Column(
        children: [
          _buildSearchAndFilter(context),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async => _loadAddresses(),
              color: context.colors.primary,
              backgroundColor: context.colors.surface,
              child:
                  BlocBuilder<
                    CustomerAddressListCubit,
                    CustomerAddressListState
                  >(
                    builder: (context, state) {
                      if (state is CustomerAddressListLoading) {
                        return _buildLoadingState(context);
                      }

                      if (state is CustomerAddressListFailure) {
                        return SingleChildScrollView(
                          physics: const AlwaysScrollableScrollPhysics(),
                          child: Container(
                            height: MediaQuery.of(context).size.height * 0.6,
                            alignment: Alignment.center,
                            child: _ErrorView(
                              message: state.failure.message,
                              onRetry: _loadAddresses,
                            ),
                          ),
                        );
                      }

                      if (state is CustomerAddressListSuccess) {
                        if (state.addresses.isEmpty) {
                          return SingleChildScrollView(
                            physics: const AlwaysScrollableScrollPhysics(),
                            child: Container(
                              height: MediaQuery.of(context).size.height * 0.6,
                              alignment: Alignment.center,
                              child: _EmptyStateView(onRetry: _loadAddresses),
                            ),
                          );
                        }

                        return ListView.separated(
                          physics: const AlwaysScrollableScrollPhysics(),
                          padding: EdgeInsets.fromLTRB(
                            context.space.lg,
                            context.space.sm,
                            context.space.lg,
                            context.space.xxl * 3,
                          ),
                          itemBuilder: (context, index) {
                            final address = state.addresses[index];
                            return CustomerAddressCard(
                              address: address,
                              onMorePressed: () =>
                                  _showActionSheet(context, address),
                            );
                          },
                          separatorBuilder: (context, index) =>
                              SizedBox(height: context.space.md),
                          itemCount: state.addresses.length,
                        );
                      }

                      return const SizedBox.shrink();
                    },
                  ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndFilter(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
        context.space.lg,
        context.space.xs,
        context.space.lg,
        context.space.sm,
      ),
      decoration: BoxDecoration(
        color: context.colors.background,
        boxShadow: [
          BoxShadow(
            color: context.colors.textPrimary.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: CustomerAddressSearchBar(
                  controller: _searchController,
                  onChanged: (_) => _loadAddresses(),
                ),
              ),
              SizedBox(width: context.space.sm),
              _FilterToggleButton(
                isActive: _isFilterVisible || _isPrimaryFilter != null,
                onTap: () {
                  setState(() {
                    _isFilterVisible = !_isFilterVisible;
                  });
                },
              ),
            ],
          ),
          AnimatedSize(
            duration: const Duration(milliseconds: 250),
            curve: Curves.easeInOut,
            child: Column(
              children: [
                if (_isFilterVisible) ...[
                  SizedBox(height: context.space.sm),
                  CustomerAddressFilterPanel(
                    selectedIsPrimary: _isPrimaryFilter,
                    onFilterChanged: (value) {
                      setState(() {
                        _isPrimaryFilter = value;
                      });
                      _loadAddresses();
                    },
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState(BuildContext context) {
    return ListView.separated(
      padding: EdgeInsets.all(context.space.lg),
      itemCount: 5,
      separatorBuilder: (_, _) => SizedBox(height: context.space.md),
      itemBuilder: (_, _) => Container(
        height: 100,
        decoration: BoxDecoration(
          color: context.colors.surface,
          borderRadius: BorderRadius.circular(context.radius.lg),
          border: Border.all(color: context.colors.border),
        ),
        child: Padding(
          padding: EdgeInsets.all(context.space.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 120,
                height: 16,
                decoration: BoxDecoration(
                  color: context.colors.border.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(context.radius.sm),
                ),
              ),
              const Spacer(),
              Container(
                width: 200,
                height: 12,
                decoration: BoxDecoration(
                  color: context.colors.border.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(context.radius.sm),
                ),
              ),
              SizedBox(height: context.space.xs),
              Container(
                width: double.infinity,
                height: 12,
                decoration: BoxDecoration(
                  color: context.colors.border.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(context.radius.sm),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showActionSheet(BuildContext context, CustomerAddress address) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: BoxDecoration(
          color: context.colors.surface,
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(context.radius.xl),
          ),
        ),
        padding: EdgeInsets.symmetric(vertical: context.space.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: context.colors.border,
                borderRadius: BorderRadius.circular(context.radius.full),
              ),
            ),
            SizedBox(height: context.space.lg),
            ListTile(
              leading: Container(
                padding: EdgeInsets.all(context.space.xs),
                decoration: BoxDecoration(
                  color: context.colors.primarySurface,
                  borderRadius: BorderRadius.circular(context.radius.md),
                ),
                child: Icon(
                  Icons.edit_outlined,
                  color: context.colors.primary,
                  size: 20,
                ),
              ),
              title: Text(
                'Ubah Alamat',
                style: context.typography.bodyMedium.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              onTap: () {
                context.pop();
                context
                    .push(
                      '/customer-addresses/edit/${address.id}',
                      extra: address,
                    )
                    .then((result) {
                      if (result == true && mounted) {
                        _loadAddresses();
                      }
                    });
              },
            ),
            ListTile(
              leading: Container(
                padding: EdgeInsets.all(context.space.xs),
                decoration: BoxDecoration(
                  color: context.colors.error.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(context.radius.md),
                ),
                child: Icon(
                  Icons.delete_outline_rounded,
                  color: context.colors.error,
                  size: 20,
                ),
              ),
              title: Text(
                'Hapus Alamat',
                style: context.typography.bodyMedium.copyWith(
                  fontWeight: FontWeight.w600,
                  color: context.colors.error,
                ),
              ),
              onTap: () {
                context.pop();
                // Implement delete logic here
              },
            ),
            SizedBox(height: context.space.md),
          ],
        ),
      ),
    );
  }
}

class _FilterToggleButton extends StatelessWidget {
  final bool isActive;
  final VoidCallback onTap;

  const _FilterToggleButton({required this.isActive, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final iconSize = context.space.xl + context.space.xs;

    return InkWell(
      borderRadius: BorderRadius.circular(context.radius.lg),
      onTap: onTap,
      child: Ink(
        width: context.space.xxl * 2,
        height: context.space.xxl * 2,
        decoration: BoxDecoration(
          color: isActive ? context.colors.primary : context.colors.surface,
          border: Border.all(
            color: isActive ? context.colors.primary : context.colors.border,
          ),
          borderRadius: BorderRadius.circular(context.radius.lg),
          boxShadow: isActive
              ? [
                  BoxShadow(
                    color: context.colors.primary.withValues(alpha: 0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Icon(
          Icons.tune_rounded,
          size: iconSize,
          color: isActive
              ? context.colors.onPrimary
              : context.colors.textPrimary,
        ),
      ),
    );
  }
}

class _EmptyStateView extends StatelessWidget {
  final VoidCallback onRetry;

  const _EmptyStateView({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(context.space.xl),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: EdgeInsets.all(context.space.xxl),
            decoration: BoxDecoration(
              color: context.colors.primarySurface.withValues(alpha: 0.5),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.location_on_outlined,
              size: 80,
              color: context.colors.primary,
            ),
          ),
          SizedBox(height: context.space.xl),
          Text(
            'Belum Ada Alamat',
            style: context.typography.headlineSmall.copyWith(
              fontWeight: FontWeight.w800,
              color: context.colors.textPrimary,
            ),
          ),
          SizedBox(height: context.space.sm),
          Text(
            'Simpan alamat pengiriman Anda untuk memudahkan proses pemesanan laundry.',
            textAlign: TextAlign.center,
            style: context.typography.bodyMedium.copyWith(
              color: context.colors.textSecondary,
              height: 1.5,
            ),
          ),
          SizedBox(height: context.space.xxl),
          SizedBox(
            width: double.infinity,
            child: AppButton.primary(
              label: 'Tambah Alamat Baru',
              onPressed: () async {
                final result = await context.push('/customer-addresses/create');
                if (result != null) {
                  onRetry();
                }
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(context.space.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: EdgeInsets.all(context.space.lg),
              decoration: BoxDecoration(
                color: context.colors.error.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.location_off_outlined,
                color: context.colors.error,
                size: 48,
              ),
            ),
            SizedBox(height: context.space.lg),
            Text(
              'Gagal Memuat Data',
              style: context.typography.headlineLarge.copyWith(
                fontWeight: FontWeight.w700,
                color: context.colors.textPrimary,
              ),
            ),
            SizedBox(height: context.space.xs),
            Text(
              message,
              textAlign: TextAlign.center,
              style: context.typography.bodyMedium.copyWith(
                color: context.colors.textSecondary,
              ),
            ),
            SizedBox(height: context.space.xl),
            AppButton.outline(label: 'Coba Lagi', onPressed: onRetry),
          ],
        ),
      ),
    );
  }
}
