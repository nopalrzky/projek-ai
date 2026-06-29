import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/topup_cubit.dart';
import '../widgets/payment_instruction_card.dart';

class TopupPaymentScreen extends StatefulWidget {
  final int topupId;

  const TopupPaymentScreen({super.key, required this.topupId});

  @override
  State<TopupPaymentScreen> createState() => _TopupPaymentScreenState();
}

class _TopupPaymentScreenState extends State<TopupPaymentScreen> {
  Timer? _pollingTimer;
  StreamSubscription<RemoteMessage>? _fcmSubscription;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TopupCubit>().getDetail(widget.topupId);
    });

    // Auto-polling every 10 seconds as a fallback
    _pollingTimer = Timer.periodic(const Duration(seconds: 10), (timer) {
      if (mounted) {
        context.read<TopupCubit>().getDetail(widget.topupId);
      }
    });

    // Listen for FCM messages in foreground
    _fcmSubscription = FirebaseMessaging.onMessage.listen((message) {
      if (!mounted) return;
      if (message.data['type'] == 'topup_success' &&
          message.data['topup_id'] == widget.topupId.toString()) {
        context.read<TopupCubit>().getDetail(widget.topupId);
      }
    });
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    _fcmSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<TopupCubit, TopupState>(
      listener: (context, state) {
        if (state.status == TopupStatus.detailLoaded && state.detail?.status == 'success') {
          _pollingTimer?.cancel();
        }
      },
      child: AppLayout(
        header: AppHeader(
          title: 'Pembayaran',
          onBackPressed: () => context.go('/topup'),
        ),
        body: BlocBuilder<TopupCubit, TopupState>(
          builder: (context, state) {
            if (state.isLoading && _pollingTimer == null && state.detail == null) {
              return const Center(child: AppLoadingIndicator());
            }

            if (state.detail != null) {
              final topup = state.detail!;

              if (topup.status == 'success') {
                return _buildSuccessState(context);
              }

              return SingleChildScrollView(
                padding: EdgeInsets.all(context.space.lg),
                child: Column(
                  children: [
                    PaymentInstructionCard(topup: topup),
                    SizedBox(height: context.space.xl),
                    AppButton.outline(
                      label: 'Cek Status Pembayaran',
                      onPressed: () =>
                          context.read<TopupCubit>().getDetail(widget.topupId),
                      isFullWidth: true,
                    ),
                  ],
                ),
              );
            }

            if (state.status == TopupStatus.error) {
              return Center(child: Text(state.errorMessage ?? 'Terjadi kesalahan'));
            }

            return const Center(child: AppLoadingIndicator());
          },
        ),
      ),
    );
  }

  Widget _buildSuccessState(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(context.space.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.check_circle_rounded,
              size: 80,
              color: context.colors.success,
            ),
            SizedBox(height: context.space.lg),
            Text(
              'Topup Berhasil!',
              style: context.typography.headlineMedium.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: context.space.sm),
            Text(
              'Saldo kamu sudah bertambah. Selamat melanjutkan transaksi.',
              textAlign: TextAlign.center,
              style: context.typography.bodyLarge.copyWith(
                color: context.colors.textSecondary,
              ),
            ),
            SizedBox(height: context.space.xxl),
            AppButton.primary(
              label: 'Kembali ke Riwayat',
              onPressed: () => context.go('/topup'),
              isFullWidth: true,
            ),
          ],
        ),
      ),
    );
  }
}
