import 'package:flutter/material.dart';
import '../../features/auth/presentation/bloc/auth_cubit.dart';

class AppLifecycleObserver extends WidgetsBindingObserver {
  final AuthCubit authCubit;

  AppLifecycleObserver({required this.authCubit});

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      authCubit.checkIfStale();
    } else if (state == AppLifecycleState.paused ||
               state == AppLifecycleState.inactive ||
               state == AppLifecycleState.detached) {
      authCubit.recordActivity();
    }
  }
}
