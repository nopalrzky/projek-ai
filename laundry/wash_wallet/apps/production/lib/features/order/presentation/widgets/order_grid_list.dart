import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'order_item_card.dart';

class OrderGridList extends StatelessWidget {
  final List<Order> orders;
  final Future<void> Function() onRefresh;
  final void Function(Order order)? onDetail;
  final void Function(Order order)? onProcess;
  final bool showProcessButton;

  const OrderGridList({
    super.key,
    required this.orders,
    required this.onRefresh,
    this.onDetail,
    this.onProcess,
    this.showProcessButton = false,
  });

  @override
  Widget build(BuildContext context) {
    final isTablet = !AppBreakpoints.isCompact(context);

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: isTablet ? _buildTabletGrid(context) : _buildMobileList(context),
    );
  }

  Widget _buildMobileList(BuildContext context) {
    return ListView.separated(
      padding: EdgeInsets.all(context.space.md),
      itemCount: orders.length,
      separatorBuilder: (context, index) => SizedBox(height: context.space.md),
      itemBuilder: (context, index) {
        final order = orders[index];
        return OrderItemCard(
          order: order,
          showProcessButton: showProcessButton,
          onDetail: () => onDetail?.call(order),
          onProcess: () => onProcess?.call(order),
        );
      },
    );
  }

  Widget _buildTabletGrid(BuildContext context) {
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: EdgeInsets.all(context.space.md),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final sizeClass = AppBreakpoints.of(context);
          final columns = ResponsiveGrid.columnsFor(sizeClass);
          final spacing = context.space.md;
          
          final width = (constraints.maxWidth - (spacing * (columns - 1))) / columns;
          // Sub-pixel error prevention
          final adjustedWidth = width.floorToDouble();

          return Wrap(
            spacing: spacing,
            runSpacing: spacing,
            children: orders.map((order) {
              return SizedBox(
                width: adjustedWidth,
                child: OrderItemCard(
                  order: order,
                  showProcessButton: showProcessButton,
                  onDetail: () => onDetail?.call(order),
                  onProcess: () => onProcess?.call(order),
                ),
              );
            }).toList(),
          );
        },
      ),
    );
  }
}
