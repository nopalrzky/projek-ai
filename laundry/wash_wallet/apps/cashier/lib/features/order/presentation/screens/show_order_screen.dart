import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../../core/helpers/online_guard.dart';
import '../../../print/presentation/widgets/print_modal.dart';
import '../../domain/usecases/reject_usecase.dart';
import '../widgets/wa_notification_modal.dart';
import '../bloc/order_cubit.dart';
import '../bloc/order_state.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import '../widgets/order_detail/order_detail_header.dart';
import '../widgets/order_detail/order_customer_card.dart';
import '../widgets/order_detail/order_items_list.dart';
import '../widgets/order_detail/order_timeline.dart';
import '../widgets/order_detail/order_financial_summary.dart';
import '../widgets/order_detail/order_notes_card.dart';
import '../widgets/order_detail/order_action_buttons.dart';
import 'weigh_order_screen.dart';

class ShowOrderScreen extends StatefulWidget {
  final int orderId;
  final int outletId;
  final bool isEmbedded;

  const ShowOrderScreen({
    super.key,
    required this.orderId,
    required this.outletId,
    this.isEmbedded = false,
  });

  @override
  State<ShowOrderScreen> createState() => _ShowOrderScreenState();
}

class _ShowOrderScreenState extends State<ShowOrderScreen> {
  Order? _localOrder;
  bool _isLoading = false;
  String? _error;

  static const Set<String> _printableStatuses = {
    'ready_to_process',
    'priced',
    'in_progress',
    'processing',
    'ready',
    'completed',
    'delivered',
  };

  @override
  void initState() {
    super.initState();
    _loadOrderDetail();
  }

  @override
  void didUpdateWidget(ShowOrderScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.orderId != widget.orderId) {
      _loadOrderDetail();
    }
  }

  Future<void> _loadOrderDetail() async {
    if (widget.isEmbedded) {
      setState(() {
        _isLoading = true;
        _error = null;
      });
      final order = await context.read<OrderCubit>().fetchOrderSilently(
        widget.orderId,
      );
      if (mounted) {
        setState(() {
          _localOrder = order;
          _isLoading = false;
          if (order == null) {
            _error = 'Gagal memuat pesanan';
          }
        });
      }
    } else {
      context.read<OrderCubit>().getById(widget.orderId);
    }
  }

  bool _isOrderStuck(Order order) {
    // Order dianggap "stuck" jika sudah > 7 hari sejak perubahan status terakhir
    // dan statusnya bukan final (completed, delivered, cancelled)
    const stuckThreshold = Duration(days: 7);
    const finalStatuses = ['completed', 'delivered', 'cancelled'];

    if (finalStatuses.contains(order.status)) return false;

    final lastUpdate = order.lastStatusUpdate ?? order.createdAt;
    if (lastUpdate == null) return false;

    return DateTime.now().difference(lastUpdate) > stuckThreshold;
  }

  bool _showCompleteButton(Order order) {
    return _isOrderStuck(order);
  }

  String? _completeButtonHint(Order order) {
    if (_isOrderStuck(order)) {
      return 'Order ini sudah > 7 hari tanpa perubahan status. Selesaikan secara manual.';
    }
    return null;
  }

  bool _canShowPrintActions(Order order) {
    return _printableStatuses.contains(order.status);
  }

  Future<void> _handleAcceptOrder(Order order) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Terima Pesanan?'),
        content: Text(
          'Pesanan #${order.orderNumber} akan diterima. Kurir akan menjemput cucian dari customer.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Terima'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      OnlineGuard.requireOnline(
        actionName: 'Menerima Pesanan',
        action: () async => context.read<OrderCubit>().accept(order.id),
        onOffline: (message) => AppSnackbar.error(context, message: message),
      );
    }
  }

  Future<void> _handleRejectOrder(Order order) async {
    final reasonController = TextEditingController();
    final confirmed = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom,
          left: context.space.md,
          right: context.space.md,
          top: context.space.md,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Tolak Pesanan', style: Theme.of(ctx).textTheme.titleLarge),
            SizedBox(height: context.space.md),
            AppTextField(
              controller: reasonController,
              label: 'Alasan Penolakan',
              hint: 'Contoh: Layanan tidak tersedia',
              maxLines: 3,
            ),
            SizedBox(height: context.space.lg),
            Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: () => Navigator.pop(ctx, false),
                    child: const Text('Batal'),
                  ),
                ),
                SizedBox(width: context.space.sm),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(ctx, true),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: context.colors.error,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('Tolak Pesanan'),
                  ),
                ),
              ],
            ),
            SizedBox(height: context.space.xl),
          ],
        ),
      ),
    );

    if (confirmed == true && mounted) {
      OnlineGuard.requireOnline(
        actionName: 'Menolak Pesanan',
        action: () async => context.read<OrderCubit>().reject(
          RejectParams(
            orderId: order.id,
            reason: reasonController.text.trim().isNotEmpty
                ? reasonController.text.trim()
                : null,
          ),
        ),
        onOffline: (message) => AppSnackbar.error(context, message: message),
      );
    }
  }

  Future<void> _handleWeighOrder(Order order) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => WeighOrderScreen(order: order)),
    );

    if (result == true && mounted) {
      _loadOrderDetail();
    }
  }

  Future<void> _handleCompleteOrder(Order order) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Selesaikan Pesanan?'),
        content: Text(
          'Pesanan #${order.orderNumber} akan ditandai sebagai selesai. '
          'Tindakan ini tidak dapat dibatalkan.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Selesaikan'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      OnlineGuard.requireOnline(
        actionName: 'Menyelesaikan Pesanan',
        action: () async => context.read<OrderCubit>().complete(order.id),
        onOffline: (message) => AppSnackbar.error(context, message: message),
      );
    }
  }

  void _handlePrintReceipt(Order order) {
    showPrintModal(context, orderId: order.id);
  }

  void _handleSendWaNotification(Order order) {
    showWaNotificationModal(context, orderId: order.id);
  }

  @override
  Widget build(BuildContext context) {
    if (widget.isEmbedded) {
      return BlocListener<OrderCubit, OrderState>(
        listener: _blocListener,
        child: Column(
          children: [
            _buildEmbeddedHeader(),
            Expanded(
              child: _isLoading
                  ? const AppLoadingIndicator()
                  : _error != null
                  ? AppErrorState(message: _error!, onRetry: _loadOrderDetail)
                  : _localOrder != null
                  ? _buildDetailContent(
                      _localOrder!,
                      context.watch<OrderCubit>().state is OrderLoading,
                    )
                  : const SizedBox.shrink(),
            ),
          ],
        ),
      );
    }

    final sizeClass = AppBreakpoints.of(context);
    final isCompact = sizeClass == WindowSizeClass.compact;

    final content = BlocConsumer<OrderCubit, OrderState>(
      listener: _blocListener,
      builder: (context, state) {
        if (state is OrderLoading) {
          return const AppLoadingIndicator();
        }
        if (state is OrderFailure) {
          return AppErrorState(
            message: state.failure.message,
            onRetry: _loadOrderDetail,
          );
        }
        if (state is OrderDetailLoaded) {
          return _buildDetailContent(state.order, false);
        }
        return const SizedBox.shrink();
      },
    );

    final actionsBuilder = BlocBuilder<OrderCubit, OrderState>(
      builder: (context, state) {
        if (state is OrderDetailLoaded) {
          return _buildHeaderActions(state.order);
        }
        return const SizedBox.shrink();
      },
    );

    if (isCompact) {
      return AppLayout(
        header: AppHeader(
          title: 'Detail Pesanan',
          onBackPressed: () => Navigator.pop(context),
          actions: [actionsBuilder],
        ),
        body: content,
      );
    }

    return Column(
      children: [
        PageContentHeader(
          title: 'Detail Pesanan',
          breadcrumbs: [
            const BreadcrumbItem(label: 'Pesanan'),
            BreadcrumbItem(
              label: 'Detail Pesanan',
              onTap: () => Navigator.pop(context),
            ),
          ],
          actions: [actionsBuilder],
        ),
        Expanded(child: ContentConstraint(child: content)),
      ],
    );
  }

  Widget _buildEmbeddedHeader() {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.md,
        vertical: context.space.sm,
      ),
      decoration: BoxDecoration(
        color: context.colors.surface,
        border: Border(
          bottom: BorderSide(color: context.colors.outlineVariant),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              'Detail Pesanan',
              style: context.typography.titleMedium,
            ),
          ),
          if (_localOrder != null) _buildHeaderActions(_localOrder!),
        ],
      ),
    );
  }

  Widget _buildHeaderActions(Order order) {
    final canShowPrintActions = _canShowPrintActions(order);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (order.status != 'requested') ...[
          IconButton(
            icon: const Icon(Icons.chat_rounded),
            onPressed: () => _handleSendWaNotification(order),
            tooltip: 'Kirim Notifikasi WhatsApp',
          ),
        ],
        if (canShowPrintActions) ...[
          IconButton(
            icon: const Icon(Icons.print),
            onPressed: () => _handlePrintReceipt(order),
            tooltip: 'Cetak Struk / Label',
          ),
        ],
      ],
    );
  }

  void _blocListener(BuildContext context, OrderState state) {
    if (state is OrderActionSuccess) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle, color: Colors.white),
              SizedBox(width: context.space.sm),
              Text(state.message),
            ],
          ),
          backgroundColor: context.colors.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(context.radius.md),
          ),
        ),
      );
      _loadOrderDetail();
    }
    if (state is OrderFailure) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.error, color: Colors.white),
              SizedBox(width: context.space.sm),
              Expanded(child: Text(state.failure.message)),
            ],
          ),
          backgroundColor: context.colors.error,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(context.radius.md),
          ),
        ),
      );
    }
  }

  Widget _buildDetailContent(Order order, bool isProcessing) {
    return RefreshIndicator(
      onRefresh: () async => _loadOrderDetail(),
      child: SingleChildScrollView(
        padding: EdgeInsets.all(context.space.md),
        child: ResponsiveLayout(
          compactLayout: _buildCompactDetail(order, isProcessing),
          mediumLayout: _buildMediumDetail(order, isProcessing),
        ),
      ),
    );
  }

  Widget _buildCompactDetail(Order order, bool isProcessing) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        OrderDetailHeader(order: order),
        SizedBox(height: context.space.md),

        if (order.customer != null) ...[
          OrderCustomerCard(customer: order.customer!),
          SizedBox(height: context.space.md),
        ],

        if (order.orderItems != null && order.orderItems!.isNotEmpty)
          OrderItemsList(items: order.orderItems!),
        if (order.orderItems != null && order.orderItems!.isNotEmpty)
          SizedBox(height: context.space.md),

        OrderTimeline(order: order),
        SizedBox(height: context.space.md),

        OrderFinancialSummary(order: order),
        SizedBox(height: context.space.md),

        if (order.notes != null && order.notes!.isNotEmpty)
          OrderNotesCard(notes: order.notes!),

        SizedBox(height: context.space.xl),

        OrderActionButtons(
          onPrintReceipt: () => _handlePrintReceipt(order),
          onSendWaNotification: () => _handleSendWaNotification(order),
          onBack: widget.isEmbedded ? null : () => Navigator.pop(context),
          showAcceptRejectButtons: order.status == 'requested',
          onAcceptOrder: () => _handleAcceptOrder(order),
          onRejectOrder: () => _handleRejectOrder(order),
          showWeighButton: order.status == 'received',
          onWeighOrder: () => _handleWeighOrder(order),
          showStartButton: false,
          showCompleteButton: _showCompleteButton(order),
          onCompleteOrder: () => _handleCompleteOrder(order),
          completeButtonHint: _completeButtonHint(order),
          showPrintButton: _canShowPrintActions(order),
          showWaButton: order.status != 'requested',
          isProcessing: isProcessing,
        ),

        SizedBox(height: context.space.xxl),
      ],
    );
  }

  Widget _buildMediumDetail(Order order, bool isProcessing) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 3,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              OrderDetailHeader(order: order),
              SizedBox(height: context.space.md),

              if (order.customer != null) ...[
                OrderCustomerCard(customer: order.customer!),
                SizedBox(height: context.space.md),
              ],

              if (order.orderItems != null && order.orderItems!.isNotEmpty) ...[
                OrderItemsList(items: order.orderItems!),
                SizedBox(height: context.space.md),
              ],

              if (order.notes != null && order.notes!.isNotEmpty) ...[
                OrderNotesCard(notes: order.notes!),
                SizedBox(height: context.space.md),
              ],
            ],
          ),
        ),
        SizedBox(width: context.space.lg),
        Expanded(
          flex: 2,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              OrderTimeline(order: order),
              SizedBox(height: context.space.md),

              OrderFinancialSummary(order: order),
              SizedBox(height: context.space.xl),

              OrderActionButtons(
                onPrintReceipt: () => _handlePrintReceipt(order),
                onSendWaNotification: () => _handleSendWaNotification(order),
                onBack: widget.isEmbedded ? null : () => Navigator.pop(context),
                showAcceptRejectButtons: order.status == 'requested',
                onAcceptOrder: () => _handleAcceptOrder(order),
                onRejectOrder: () => _handleRejectOrder(order),
                showWeighButton: order.status == 'received',
                onWeighOrder: () => _handleWeighOrder(order),
                showStartButton: false,
                showCompleteButton: _showCompleteButton(order),
                onCompleteOrder: () => _handleCompleteOrder(order),
                completeButtonHint: _completeButtonHint(order),
                showPrintButton: _canShowPrintActions(order),
                showWaButton: order.status != 'requested',
                isProcessing: isProcessing,
              ),

              SizedBox(height: context.space.xxl),
            ],
          ),
        ),
      ],
    );
  }
}
