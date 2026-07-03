import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/order_item_cubit.dart';
import '../../../order_item_process/presentation/bloc/order_item_process_cubit.dart';
import '../../../order_item_process/presentation/bloc/order_item_process_state.dart';

class OrderItemProcessList extends StatelessWidget {
  final OrderItem orderItem;

  const OrderItemProcessList({super.key, required this.orderItem});

  @override
  Widget build(BuildContext context) {
    final processes = orderItem.orderItemProcesses ?? [];
    final isOrderItemStarted = orderItem.status.toLowerCase() != 'pending';

    if (processes.isEmpty) {
      return Container(
        margin: EdgeInsets.all(context.space.md),
        padding: EdgeInsets.all(context.space.lg),
        decoration: BoxDecoration(
          color: context.colors.surfaceVariant,
          borderRadius: context.radius.all.lg,
        ),
        child: Center(
          child: Text(
            'Tidak ada proses',
            style: context.typography.bodyLarge.copyWith(
              color: context.colors.textSecondary,
            ),
          ),
        ),
      );
    }

    return Container(
      margin: EdgeInsets.symmetric(horizontal: context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: context.radius.all.lg,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.all(context.space.md),
            child: Row(
              children: [
                Icon(Icons.list_alt, color: context.colors.primary, size: 24),
                SizedBox(width: context.space.sm),
                Text(
                  'Proses Pengerjaan',
                  style: context.typography.headlineMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: context.colors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
          const AppDivider(),
          BlocConsumer<OrderItemProcessCubit, OrderItemProcessState>(
            listener: (context, state) {
              if (state is OrderItemProcessStarted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text('Proses berhasil dimulai'),
                    backgroundColor: context.colors.success,
                  ),
                );
                context.read<OrderItemCubit>().getById(orderItem.id);
              } else if (state is OrderItemProcessCompleted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text('Proses berhasil diselesaikan'),
                    backgroundColor: context.colors.success,
                  ),
                );
                context.read<OrderItemCubit>().getById(orderItem.id);
              } else if (state is OrderItemProcessError) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(state.message),
                    backgroundColor: context.colors.error,
                  ),
                );
              }
            },
            builder: (context, state) {
              return ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                padding: EdgeInsets.all(context.space.md),
                itemCount: processes.length,
                separatorBuilder: (context, index) =>
                    SizedBox(height: context.space.md),
                itemBuilder: (context, index) {
                  final process = processes[index];
                  final canStartAction = isOrderItemStarted && process.canStart;
                  final canCompleteAction =
                      isOrderItemStarted && process.canComplete;
                  final canAct = canStartAction || canCompleteAction;

                  return _buildProcessCard(
                    context,
                    process,
                    index + 1,
                    canAct,
                    isOrderItemStarted: isOrderItemStarted,
                    canStartAction: canStartAction,
                    canCompleteAction: canCompleteAction,
                  );
                },
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildProcessCard(
    BuildContext context,
    OrderItemProcess process,
    int displayNumber,
    bool canAct, {
    required bool isOrderItemStarted,
    required bool canStartAction,
    required bool canCompleteAction,
  }) {
    final isCompleted = process.isCompleted;
    final isInProgress = process.isInProgress;
    final isDisabled = !canAct && !isCompleted && !isInProgress;

    Color statusColor;
    IconData statusIcon;

    if (isCompleted) {
      statusColor = context.colors.success;
      statusIcon = Icons.check_circle;
    } else if (isInProgress) {
      statusColor = context.colors.info;
      statusIcon = Icons.play_circle;
    } else if (canAct) {
      statusColor = context.colors.warning;
      statusIcon = Icons.radio_button_unchecked;
    } else {
      statusColor = context.colors.textTertiary;
      statusIcon = Icons.lock_outline;
    }

    return InkWell(
      onTap: canAct
          ? () {
              if (canStartAction) {
                _showStartProcessDialog(context, process);
              } else if (canCompleteAction) {
                _showCompleteProcessDialog(context, process);
              }
            }
          : null,
      borderRadius: context.radius.all.md,
      child: Container(
        padding: EdgeInsets.all(context.space.md),
        decoration: BoxDecoration(
          color: context.colors.surfaceVariant.withValues(alpha: 0.3),
          borderRadius: context.radius.all.md,
          border: Border.all(
            color: canAct ? statusColor : context.colors.border,
            width: canAct ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: statusColor,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      '$displayNumber',
                      style: context.typography.bodyMedium.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                SizedBox(width: context.space.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        process.processName ?? 'Proses $displayNumber',
                        style: context.typography.bodyLarge.copyWith(
                          fontWeight: FontWeight.w600,
                          color: isDisabled
                              ? context.colors.textTertiary
                              : context.colors.textPrimary,
                        ),
                      ),
                      SizedBox(height: context.space.xs),
                      Row(
                        children: [
                          Icon(statusIcon, size: 14, color: statusColor),
                          SizedBox(width: context.space.xs),
                          Text(
                            process.statusLabel ?? process.status ?? '-',
                            style: context.typography.bodySmall.copyWith(
                              color: statusColor,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                if (canAct) Icon(Icons.chevron_right, color: statusColor),
              ],
            ),
            if (isInProgress || isCompleted) ...[
              SizedBox(height: context.space.sm),
              const AppDivider(),
              SizedBox(height: context.space.sm),
              if (process.employeeName != null)
                Padding(
                  padding: EdgeInsets.only(bottom: context.space.xs),
                  child: Row(
                    children: [
                      Icon(
                        Icons.person_outline,
                        size: 14,
                        color: context.colors.textSecondary,
                      ),
                      SizedBox(width: context.space.xs),
                      Text(
                        process.employeeName!,
                        style: context.typography.bodySmall.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              if (process.startedAt != null)
                Padding(
                  padding: EdgeInsets.only(bottom: context.space.xs),
                  child: Row(
                    children: [
                      Icon(
                        Icons.access_time,
                        size: 14,
                        color: context.colors.textSecondary,
                      ),
                      SizedBox(width: context.space.xs),
                      Text(
                        'Dimulai: ${DateFormat('dd MMM yyyy HH:mm').format(process.startedAt!)}',
                        style: context.typography.bodySmall.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              if (process.completedAt != null)
                Row(
                  children: [
                    Icon(
                      Icons.check_circle_outline,
                      size: 14,
                      color: context.colors.success,
                    ),
                    SizedBox(width: context.space.xs),
                    Text(
                      'Selesai: ${DateFormat('dd MMM yyyy HH:mm').format(process.completedAt!)}',
                      style: context.typography.bodySmall.copyWith(
                        color: context.colors.success,
                      ),
                    ),
                  ],
                ),
            ],
            if (isDisabled) ...[
              SizedBox(height: context.space.sm),
              Container(
                padding: EdgeInsets.all(context.space.sm),
                decoration: BoxDecoration(
                  color: context.colors.surfaceVariant,
                  borderRadius: context.radius.all.sm,
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.lock_outline,
                      size: 16,
                      color: context.colors.textTertiary,
                    ),
                    SizedBox(width: context.space.xs),
                    Expanded(
                      child: Text(
                        !isOrderItemStarted
                            ? 'Mulai order item terlebih dahulu'
                            : (process.actionDeniedReason?.isNotEmpty ?? false)
                            ? process.actionDeniedReason!
                            : 'Proses belum dapat dikerjakan',
                        style: context.typography.bodySmall.copyWith(
                          color: context.colors.textTertiary,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showStartProcessDialog(BuildContext context, OrderItemProcess process) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Mulai Proses'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Apakah Anda yakin ingin mulai proses "${process.processName ?? 'ini'}"?',
            ),
            SizedBox(height: context.space.md),
            // Placeholder UI for image input
            Container(
              width: double.infinity,
              height: 120,
              decoration: BoxDecoration(
                color: context.colors.surfaceVariant,
                borderRadius: context.radius.all.md,
                border: Border.all(
                  color: context.colors.border,
                  style: BorderStyle.solid,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.camera_alt,
                    size: 32,
                    color: context.colors.textSecondary,
                  ),
                  SizedBox(height: context.space.xs),
                  Text(
                    'Ambil Gambar Bukti',
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(dialogContext).pop();
              _startProcess(context, process);
            },
            child: const Text('Mulai'),
          ),
        ],
      ),
    );
  }

  void _showCompleteProcessDialog(
    BuildContext context,
    OrderItemProcess process,
  ) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Selesaikan Proses'),
        content: Text(
          'Apakah proses "${process.processName ?? 'ini'}" sudah selesai dikerjakan?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Belum'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(dialogContext).pop();
              _completeProcess(context, process);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: context.colors.success,
            ),
            child: const Text('Selesai'),
          ),
        ],
      ),
    );
  }

  void _startProcess(BuildContext context, OrderItemProcess process) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: AppLoadingIndicator(message: 'Memulai proses...'),
      ),
    );

    await context.read<OrderItemProcessCubit>().start(process.id);

    if (context.mounted) {
      Navigator.of(context).pop(); // Close loading
    }
  }

  void _completeProcess(BuildContext context, OrderItemProcess process) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: AppLoadingIndicator(message: 'Menyelesaikan proses...'),
      ),
    );

    await context.read<OrderItemProcessCubit>().complete(process.id);

    if (context.mounted) {
      Navigator.of(context).pop(); // Close loading
    }
  }
}
