import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class SelectedServicesListWidget extends StatelessWidget {
  final List<LaundryService> selectedServices;

  const SelectedServicesListWidget({super.key, required this.selectedServices});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: selectedServices.map((service) {
        return Padding(
          padding: EdgeInsets.only(bottom: context.space.sm),
          child: AppCard(
            child: Padding(
              padding: EdgeInsets.all(context.space.md),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          service.name,
                          style: context.typography.titleMedium.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Estimasi: ±${service.durationHours} jam',
                          style: context.typography.bodySmall.copyWith(
                            color: context.colors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    'Estimasi Harga Menyusul',
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.primary,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
