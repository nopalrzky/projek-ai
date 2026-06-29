import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../widgets/pickup/pickup_address_section.dart';
import '../widgets/pickup/pickup_confirm_button.dart';
import '../widgets/pickup/pickup_customer_section.dart';
import '../widgets/pickup/pickup_items_section.dart';
import '../widgets/pickup/pickup_notes_section.dart';
import '../widgets/pickup/pickup_outlet_section.dart';
import '../widgets/pickup/pickup_schedule_section.dart';
import '../widgets/pickup/pickup_wa_button.dart';

class PickupOrderDetailScreen extends StatelessWidget {
  final Order order;

  const PickupOrderDetailScreen({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final hasOutlet = order.outlet != null;
    final hasSchedule = order.pickupSchedule != null;
    final hasNotes = order.notes?.trim().isNotEmpty == true;
    final canSendWa =
        order.status.toLowerCase() == 'picking_up' &&
        order.customer?.phone?.trim().isNotEmpty == true;

    return AppLayout(
      header: AppHeader(
        title: 'Detail Penjemputan',
        subtitle: order.orderNumber,
        onBackPressed: () => Navigator.pop(context),
        type: AppHeaderType.standard,
        showMenuButton: false,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(context.space.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            PickupCustomerSection(order: order),
            SizedBox(height: context.space.lg),
            PickupAddressSection(order: order),
            if (hasOutlet) ...[
              SizedBox(height: context.space.lg),
              PickupOutletSection(order: order),
            ],
            if (hasSchedule) ...[
              SizedBox(height: context.space.lg),
              PickupScheduleSection(order: order),
            ],
            SizedBox(height: context.space.lg),
            PickupItemsSection(order: order),
            if (hasNotes) ...[
              SizedBox(height: context.space.lg),
              PickupNotesSection(order: order),
            ],
            SizedBox(height: context.space.xxl),
            if (canSendWa) ...[
              PickupWaButton(orderId: order.id),
              SizedBox(height: context.space.md),
            ],
            PickupConfirmButton(order: order),
            SizedBox(height: context.space.md),
          ],
        ),
      ),
    );
  }
}
