import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../core/services/location_service.dart';
import '../../../customer_address/domain/entities/customer_address.dart';
import '../../../customer_address/presentation/bloc/customer_address_list_cubit.dart';
import '../../../customer_address/presentation/bloc/customer_address_list_state.dart';
import '../bloc/outlet_cubit.dart';
import '../bloc/outlet_state.dart';
import '../widgets/location_status_banner.dart';
import '../widgets/outlet_card.dart';
import '../widgets/outlet_search_bar.dart';

class IndexOutletScreen extends StatefulWidget {
  const IndexOutletScreen({super.key});

  @override
  State<IndexOutletScreen> createState() => _IndexOutletScreenState();
}

class _IndexOutletScreenState extends State<IndexOutletScreen> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();
  double? _activeLatitude;
  double? _activeLongitude;
  bool _useNearbyEndpoint = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initLocation();
    });
  }

  void _initLocation() async {
    final locationService = LocationService();
    final result = await locationService.getCurrentPosition();

    if (!mounted) return;

    final position = result.dataOrNull;
    if (position != null) {
      _activeLatitude = position.latitude;
      _activeLongitude = position.longitude;
      _useNearbyEndpoint = true;
      context.read<OutletCubit>().fetch(
        lat: position.latitude,
        lng: position.longitude,
      );
      return;
    }

    final address = await _resolveAddressContext();
    if (!mounted) return;

    _activeLatitude = address?.latitude;
    _activeLongitude = address?.longitude;
    _useNearbyEndpoint = false;
    context.read<OutletCubit>().fetch(
      lat: _activeLatitude,
      lng: _activeLongitude,
      useNearby: false,
    );
  }

  Future<CustomerAddress?> _resolveAddressContext() async {
    final addressCubit = context.read<CustomerAddressListCubit>();
    var addressState = addressCubit.state;

    if (addressState is! CustomerAddressListSuccess) {
      await addressCubit.getAll(sortDirection: 'asc');
      addressState = addressCubit.state;
    }

    if (addressState is! CustomerAddressListSuccess) return null;

    final addresses = addressState.addresses.where(_hasCoordinate).toList();
    if (addresses.isEmpty) return null;

    for (final address in addresses) {
      if (address.isPrimary) return address;
    }

    addresses.sort(_compareCreatedAt);
    return addresses.first;
  }

  bool _hasCoordinate(CustomerAddress address) {
    return address.latitude != null && address.longitude != null;
  }

  int _compareCreatedAt(CustomerAddress a, CustomerAddress b) {
    final aCreatedAt = DateTime.tryParse(a.createdAt ?? '');
    final bCreatedAt = DateTime.tryParse(b.createdAt ?? '');

    if (aCreatedAt != null && bCreatedAt != null) {
      return aCreatedAt.compareTo(bCreatedAt);
    }

    if (aCreatedAt != null) return -1;
    if (bCreatedAt != null) return 1;
    return a.id.compareTo(b.id);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.8) {
      context.read<OutletCubit>().loadMore();
    }
  }

  void _onSearchChanged(String query) {
    context.read<OutletCubit>().fetch(
      lat: _activeLatitude,
      lng: _activeLongitude,
      search: query,
      useNearby: _useNearbyEndpoint,
    );
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      header: AppHeader(
        title: 'Daftar Outlet',
        onBackPressed: () => context.pop(),
        actions: [
          IconButton(
            onPressed: () => context.read<OutletCubit>().refresh(),
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Muat Ulang',
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: context.space.lg,
              vertical: context.space.md,
            ),
            child: OutletSearchBar(
              controller: _searchController,
              onChanged: _onSearchChanged,
            ),
          ),
          Expanded(
            child: BlocBuilder<OutletCubit, OutletState>(
              builder: (context, state) {
                if (state is OutletInitial || state is OutletLoading) {
                  return const Center(child: AppLoadingIndicator());
                }

                if (state is OutletFailure) {
                  return AppEmptyState.error(
                    title: 'Gagal Memuat Outlet',
                    description: state.failure.message,
                    action: AppButton.primary(
                      label: 'Coba Lagi',
                      onPressed: () => context.read<OutletCubit>().refresh(),
                    ),
                  );
                }

                if (state is OutletsLoaded) {
                  if (state.outlets.isEmpty) {
                    return AppEmptyState.search(
                      title: 'Outlet Tidak Ditemukan',
                      description: 'Coba cari dengan kata kunci lain',
                      action: AppButton.primary(
                        label: 'Muat Ulang',
                        onPressed: () => context.read<OutletCubit>().refresh(),
                      ),
                    );
                  }

                  return Column(
                    children: [
                      LocationStatusBanner(
                        isGpsActive: state.isGpsActive,
                        onActivate: state.isGpsActive ? null : _initLocation,
                      ),
                      Expanded(child: _buildSuccessState(state)),
                    ],
                  );
                }

                return const SizedBox.shrink();
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccessState(OutletsLoaded state) {
    return RefreshIndicator(
      onRefresh: () => context.read<OutletCubit>().refresh(),
      color: context.colors.primary,
      backgroundColor: context.colors.surface,
      child: ListView.separated(
        controller: _scrollController,
        padding: EdgeInsets.all(context.space.lg),
        itemCount: state.outlets.length + (state.hasReachedMax ? 0 : 1),
        separatorBuilder: (_, _) => SizedBox(height: context.space.md),
        itemBuilder: (context, index) {
          if (index >= state.outlets.length) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 16),
                child: AppLoadingIndicator(),
              ),
            );
          }

          final outlet = state.outlets[index];
          return OutletCard(
            outlet: outlet,
            onTap: () => context.push(
              '/outlets/${outlet.id}',
              extra: {
                'latitude': _activeLatitude,
                'longitude': _activeLongitude,
              },
            ),
          );
        },
      ),
    );
  }
}
