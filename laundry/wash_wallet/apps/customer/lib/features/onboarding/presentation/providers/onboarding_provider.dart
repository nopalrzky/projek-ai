import 'package:shared_preferences/shared_preferences.dart';

import '../bloc/onboarding_cubit.dart';

class OnboardingProvider {
  static Future<OnboardingCubit> create() async {
    final prefs = await SharedPreferences.getInstance();
    return OnboardingCubit(prefs);
  }
}
