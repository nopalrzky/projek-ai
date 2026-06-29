import '../../features/auth/presentation/bloc/auth_state.dart';

class AuthGuard {
  final AuthState Function() getAuthState;

  AuthGuard(this.getAuthState);

  bool canActivate() {
    final state = getAuthState();
    return state is Authenticated;
  }

  bool isLoading() {
    final state = getAuthState();
    return state is AuthInitial || state is AuthLoading;
  }

  bool isUnauthenticated() {
    final state = getAuthState();
    return state is Unauthenticated || state is AuthFailureState;
  }
}
