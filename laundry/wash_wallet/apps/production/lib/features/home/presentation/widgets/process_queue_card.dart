import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class ProcessQueueCard extends StatelessWidget {
  final List<ProcessQueue> processQueue;

  const ProcessQueueCard({super.key, required this.processQueue});

  @override
  Widget build(BuildContext context) {
    if (processQueue.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Antrian Proses',
          style: context.typography.headlineLarge.copyWith(
            fontWeight: FontWeight.bold,
            color: context.colors.textPrimary,
          ),
        ),
        SizedBox(height: context.space.md),
        SizedBox(
          height: 120,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: processQueue.length,
            separatorBuilder: (context, index) =>
                SizedBox(width: context.space.md),
            itemBuilder: (context, index) {
              final process = processQueue[index];
              return _ProcessCard(process: process);
            },
          ),
        ),
      ],
    );
  }
}

class _ProcessCard extends StatelessWidget {
  final ProcessQueue process;

  const _ProcessCard({required this.process});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Container(
        width: 160,
        padding: context.space.insetsAll.md,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              padding: context.space.insetsAll.xs,
              decoration: BoxDecoration(
                color: context.colors.primaryLight,
                borderRadius: context.radius.all.sm,
              ),
              child: Icon(
                Icons.local_laundry_service_rounded,
                color: context.colors.primary,
                size: 18,
              ),
            ),
            SizedBox(width: context.space.sm),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    process.totalOrders.toString(),
                    style: context.typography.headlineLarge.copyWith(
                      fontWeight: FontWeight.bold,
                      color: context.colors.primary,
                    ),
                  ),
                  SizedBox(height: context.space.xs / 2),
                  Text(
                    process.processName,
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
