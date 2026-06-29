import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../auth/presentation/bloc/customer_auth_cubit.dart';
import '../../../auth/presentation/bloc/customer_auth_state.dart';
import '../../../home/presentation/bloc/home_dashboard_cubit.dart';
import '../../../home/presentation/bloc/home_dashboard_state.dart';
import '../widgets/profile_account_header_widget.dart';
import '../widgets/profile_logout_button_widget.dart';
import '../widgets/profile_menu_section_widget.dart';
import '../widgets/profile_password_setup_card_widget.dart';
import '../widgets/profile_quick_actions_widget.dart';
import '../widgets/profile_recent_activity_widget.dart';
import '../widgets/profile_status_card_widget.dart';
import '../widgets/profile_summary_card_widget.dart';
import '../widgets/profile_wallet_card_widget.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  String? _dismissedStatusCardSignature;
  String? _dismissedPasswordCardSignature;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final dashboardState = context.read<HomeDashboardCubit>().state;
      if (dashboardState is HomeDashboardInitial ||
          dashboardState is HomeDashboardFailure) {
        context.read<HomeDashboardCubit>().getHomeDashboard();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CustomerAuthCubit, CustomerAuthState>(
      builder: (context, authState) {
        if (authState is! CustomerAuthAuthenticated) {
          return Scaffold(
            backgroundColor: context.colors.background,
            body: const Center(child: AppLoadingIndicator()),
          );
        }

        final customer = authState.customer;
        final statusSignature = _buildStatusSignature(customer);
        final showStatusCard =
            statusSignature != null &&
            statusSignature != _dismissedStatusCardSignature;
        final passwordCardSignature = _buildPasswordCardSignature(customer);
        final showPasswordCard =
            passwordCardSignature != null &&
            passwordCardSignature != _dismissedPasswordCardSignature;

        return Scaffold(
          backgroundColor: context.colors.background,
          body: SafeArea(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const ProfileAccountHeaderWidget(),
                  if (showStatusCard)
                    ProfileStatusCardWidget(
                      customer: customer,
                      onDismiss: () {
                        setState(() {
                          _dismissedStatusCardSignature = statusSignature;
                        });
                      },
                    ),
                  ProfileSummaryCardWidget(
                    customer: customer,
                    onEditTap: () => context.push('/profile/edit'),
                  ),
                  if (showPasswordCard)
                    ProfilePasswordSetupCardWidget(
                      onDismiss: () {
                        setState(() {
                          _dismissedPasswordCardSignature =
                              passwordCardSignature;
                        });
                      },
                    ),
                  ProfileWalletCardWidget(customer: customer),
                  const ProfileQuickActionsWidget(),
                  const ProfileRecentActivityWidget(),
                  const ProfileMenuSectionWidget(),
                  const ProfileLogoutButtonWidget(),
                  SizedBox(height: context.space.xxl),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  String? _buildStatusSignature(CustomerAccount customer) {
    final conditions = <String>[];
    if (customer.email == null || customer.email!.trim().isEmpty) {
      conditions.add('missing_email');
    }
    if (customer.dateOfBirth == null || customer.dateOfBirth!.trim().isEmpty) {
      conditions.add('missing_birthdate');
    }
    if (customer.gender == null || customer.gender!.trim().isEmpty) {
      conditions.add('missing_gender');
    }
    if (!customer.isVerified) {
      conditions.add('not_verified');
    }
    if (!customer.isActive) {
      conditions.add('inactive');
    }

    return conditions.isEmpty ? null : conditions.join('|');
  }

  String? _buildPasswordCardSignature(CustomerAccount customer) {
    if (customer.hasPassword == null) return null;
    if (customer.hasPassword == true) return null;
    return 'missing_password';
  }
}
