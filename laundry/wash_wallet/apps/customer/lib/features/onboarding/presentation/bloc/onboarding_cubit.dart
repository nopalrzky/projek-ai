import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'onboarding_state.dart';

class OnboardingCubit extends Cubit<OnboardingState> {
  static const onboardingCompletedKey = 'onboarding_completed';

  final SharedPreferences _prefs;

  OnboardingCubit(this._prefs) : super(OnboardingInitial());

  Future<void> checkOnboardingStatus() async {
    emit(OnboardingChecking());
    final completed = _prefs.getBool(onboardingCompletedKey) ?? false;
    await Future.delayed(const Duration(milliseconds: 100));
    emit(completed ? OnboardingAlreadyCompleted() : OnboardingRequired());
  }

  Future<void> completeOnboarding() async {
    await _prefs.setBool(onboardingCompletedKey, true);
    emit(OnboardingCompleted());
  }
}
