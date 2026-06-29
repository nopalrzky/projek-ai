import 'package:shared_preferences/shared_preferences.dart';

class OnboardingService {
  static const String _onboardingKey = 'is_onboarding_done';
  final SharedPreferences _prefs;

  OnboardingService(this._prefs);

  bool isCompleted() {
    return _prefs.getBool(_onboardingKey) ?? false;
  }

  Future<void> complete() async {
    await _prefs.setBool(_onboardingKey, true);
  }

  Future<void> reset() async {
    await _prefs.remove(_onboardingKey);
  }
}
