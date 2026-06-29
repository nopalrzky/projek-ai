import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../domain/entities/discovery_service.dart';
import 'discovery_outlet_horizontal_list_widget.dart';
import 'discovery_section_header_widget.dart';
import 'discovery_service_horizontal_list_widget.dart';

class DiscoveryRecommendationsContentWidget extends StatelessWidget {
  final List<DiscoveryService> bestServices;
  final List<DiscoveryService> cheapestServices;
  final List<DiscoveryService> freeShippingServices;
  final List<DiscoveryService> popularServices;
  final List<Outlet> topOutlets;
  final VoidCallback onRefresh;
  final void Function(DiscoveryService service) onServiceTap;
  final void Function(Outlet outlet) onOutletTap;

  const DiscoveryRecommendationsContentWidget({
    super.key,
    required this.bestServices,
    required this.cheapestServices,
    required this.freeShippingServices,
    required this.popularServices,
    required this.topOutlets,
    required this.onRefresh,
    required this.onServiceTap,
    required this.onOutletTap,
  });

  @override
  Widget build(BuildContext context) {
    final isEmpty =
        bestServices.isEmpty &&
        cheapestServices.isEmpty &&
        freeShippingServices.isEmpty &&
        popularServices.isEmpty &&
        topOutlets.isEmpty;

    if (isEmpty) {
      return AppEmptyState.search(
        title: 'Layanan Belum Tersedia',
        description: 'Coba muat ulang discovery layanan.',
        action: AppButton.primary(label: 'Muat Ulang', onPressed: onRefresh),
      );
    }

    return RefreshIndicator(
      onRefresh: () async => onRefresh(),
      color: context.colors.primary,
      backgroundColor: context.colors.surface,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: EdgeInsets.fromLTRB(
          context.space.lg,
          context.space.md,
          context.space.lg,
          context.space.xxl,
        ),
        children: [
          _Section(
            title: 'Layanan Terbaik',
            subtitle: 'Pilihan dengan rating dan ulasan terbaik',
            services: bestServices,
            onServiceTap: onServiceTap,
          ),
          _Section(
            title: 'Paling Murah',
            subtitle: 'Urut dari harga layanan terendah',
            services: cheapestServices,
            onServiceTap: onServiceTap,
          ),
          _Section(
            title: 'Diskon Ongkir',
            subtitle: 'Layanan dari outlet dengan gratis ongkir tanpa syarat',
            services: freeShippingServices,
            onServiceTap: onServiceTap,
          ),
          _Section(
            title: 'Populer',
            subtitle: 'Sering dipilih customer lain',
            services: popularServices,
            onServiceTap: onServiceTap,
          ),
          if (topOutlets.isNotEmpty) ...[
            const DiscoverySectionHeaderWidget(
              title: 'Outlet Terbaik',
              subtitle: 'Outlet aktif dengan performa terbaik',
            ),
            DiscoveryOutletHorizontalListWidget(
              outlets: topOutlets,
              onOutletTap: onOutletTap,
            ),
          ],
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  final String subtitle;
  final List<DiscoveryService> services;
  final void Function(DiscoveryService service) onServiceTap;

  const _Section({
    required this.title,
    required this.subtitle,
    required this.services,
    required this.onServiceTap,
  });

  @override
  Widget build(BuildContext context) {
    if (services.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: EdgeInsets.only(bottom: context.space.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          DiscoverySectionHeaderWidget(title: title, subtitle: subtitle),
          DiscoveryServiceHorizontalListWidget(
            services: services,
            onServiceTap: onServiceTap,
          ),
        ],
      ),
    );
  }
}
