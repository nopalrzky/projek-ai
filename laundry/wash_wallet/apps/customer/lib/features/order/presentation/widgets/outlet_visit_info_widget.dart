import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:url_launcher/url_launcher.dart';

class OutletVisitInfoWidget extends StatelessWidget {
  final Outlet outlet;

  const OutletVisitInfoWidget({super.key, required this.outlet});

  @override
  Widget build(BuildContext context) {
    final showPhone = outlet.phone != null && outlet.phone!.isNotEmpty;
    final showCoords = outlet.latitude != null && outlet.longitude != null;

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            outlet.name,
            style: context.typography.titleMedium.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: context.space.sm),
          _OutletAddressRow(address: outlet.fullAddress ?? '-'),
          SizedBox(height: context.space.sm),
          _OutletHoursRow(schedule: outlet.todaySchedule),
          if (showPhone) ...[
            SizedBox(height: context.space.sm),
            _OutletContactRow(phone: outlet.phone!),
          ],
          if (showCoords) ...[
            SizedBox(height: context.space.md),
            _OutletMapsButton(
              latitude: outlet.latitude!,
              longitude: outlet.longitude!,
            ),
          ],
        ],
      ),
    );
  }
}

class _OutletAddressRow extends StatelessWidget {
  final String address;

  const _OutletAddressRow({required this.address});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          Icons.location_on_outlined,
          size: 20,
          color: context.colors.textSecondary,
        ),
        SizedBox(width: context.space.xs),
        Expanded(
          child: Text(
            address,
            style: context.typography.bodyMedium.copyWith(
              color: context.colors.textSecondary,
            ),
          ),
        ),
      ],
    );
  }
}

class _OutletHoursRow extends StatelessWidget {
  final Map<String, dynamic>? schedule;

  const _OutletHoursRow({required this.schedule});

  @override
  Widget build(BuildContext context) {
    String hoursText = 'Jam Operasional Tidak Tersedia';
    if (schedule != null) {
      final isOpen = schedule!['isOpen'] as bool? ?? false;
      if (isOpen) {
        final openTime = schedule!['openTime'] as String? ?? '';
        final closeTime = schedule!['closeTime'] as String? ?? '';
        final formattedOpen = openTime.length >= 5
            ? openTime.substring(0, 5)
            : openTime;
        final formattedClose = closeTime.length >= 5
            ? closeTime.substring(0, 5)
            : closeTime;
        hoursText = 'Buka Hari Ini: $formattedOpen - $formattedClose';
      } else {
        hoursText = 'Tutup Hari Ini';
      }
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(Icons.access_time, size: 20, color: context.colors.textSecondary),
        SizedBox(width: context.space.xs),
        Expanded(
          child: Text(
            hoursText,
            style: context.typography.bodyMedium.copyWith(
              color: context.colors.textSecondary,
            ),
          ),
        ),
      ],
    );
  }
}

class _OutletContactRow extends StatelessWidget {
  final String phone;

  const _OutletContactRow({required this.phone});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () async {
        final uri = Uri(scheme: 'tel', path: phone);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri);
        }
      },
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.phone_outlined, size: 20, color: context.colors.primary),
          SizedBox(width: context.space.xs),
          Expanded(
            child: Text(
              phone,
              style: context.typography.bodyMedium.copyWith(
                color: context.colors.primary,
                decoration: TextDecoration.underline,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OutletMapsButton extends StatelessWidget {
  final double latitude;
  final double longitude;

  const _OutletMapsButton({required this.latitude, required this.longitude});

  @override
  Widget build(BuildContext context) {
    return AppButton.outline(
      label: 'Petunjuk Arah (Google Maps)',
      icon: const Icon(Icons.map_outlined),
      onPressed: () async {
        final uri = Uri.parse(
          'https://www.google.com/maps/search/?api=1&query=$latitude,$longitude',
        );
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri);
        }
      },
    );
  }
}
