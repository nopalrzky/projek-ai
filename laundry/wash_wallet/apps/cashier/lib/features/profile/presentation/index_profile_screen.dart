import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';


import '../../auth/presentation/bloc/auth_cubit.dart';
import '../../auth/presentation/bloc/auth_state.dart';

class IndexProfileScreen extends StatelessWidget {
  const IndexProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isCompact = AppBreakpoints.of(context) == WindowSizeClass.compact;

    return isCompact
          ? AppLayout(
              header: AppHeader(
                title: 'Profil Saya',
                type: AppHeaderType.standard,
                onBackPressed: () =>
                    context.canPop() ? context.pop() : context.go('/settings'),
              ),
              scrollable: true,
              body: _ProfileBody(isTablet: false),
            )
          : const Column(
              children: [
                PageContentHeader(
                  title: 'Profil Saya',
                  breadcrumbs: [BreadcrumbItem(label: 'Profil')],
                ),
                Expanded(child: _ProfileBody(isTablet: true)),
              ],
            );
  }
}

class _ProfileBody extends StatelessWidget {
  final bool isTablet;

  const _ProfileBody({required this.isTablet});

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthCubit>().state;
    final employee = _resolveEmployee(authState);

    if (employee == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return ContentConstraint(
      child: SingleChildScrollView(
        padding: EdgeInsets.all(isTablet ? context.space.xl : context.space.lg),
        child: isTablet
            ? Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(flex: 4, child: _ProfileSummary(employee: employee)),
                  SizedBox(width: context.space.lg),
                  Expanded(flex: 6, child: _ProfileDetails(employee: employee)),
                ],
              )
            : Column(
                children: [
                  _ProfileSummary(employee: employee),
                  SizedBox(height: context.space.lg),
                  _ProfileDetails(employee: employee),
                ],
              ),
      ),
    );
  }

  AuthEmployee? _resolveEmployee(AuthState state) {
    return switch (state) {
      Authenticated(:final employee) => employee,
      AuthenticatedStale(:final employee) => employee,
      _ => null,
    };
  }
}

class _ProfileSummary extends StatelessWidget {
  final AuthEmployee employee;

  const _ProfileSummary({required this.employee});

  @override
  Widget build(BuildContext context) {
    return _ProfileCard(
      child: Column(
        children: [
          CircleAvatar(
            radius: 52,
            backgroundColor: context.colors.primaryContainer,
            child: Icon(Icons.person, size: 52, color: context.colors.primary),
          ),
          SizedBox(height: context.space.lg),
          Text(
            employee.name,
            style: context.typography.headlineSmall,
            textAlign: TextAlign.center,
          ),
          SizedBox(height: context.space.xs),
          Text(
            employee.email?.isNotEmpty == true
                ? employee.email!
                : employee.username,
            style: context.typography.bodyMedium.copyWith(
              color: context.colors.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: context.space.xl),
          AppButton.primary(
            label: 'Edit Profil',
            icon: const Icon(Icons.edit_outlined),
            isFullWidth: true,
            onPressed: () => context.push('/profile/edit'),
          ),
        ],
      ),
    );
  }
}

class _ProfileDetails extends StatelessWidget {
  final AuthEmployee employee;

  const _ProfileDetails({required this.employee});

  @override
  Widget build(BuildContext context) {
    return _ProfileCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Informasi Akun', style: context.typography.headlineSmall),
          SizedBox(height: context.space.xl),
          _ProfileInfoRow(
            icon: Icons.badge_outlined,
            label: 'Nama Lengkap',
            value: employee.name,
          ),
          _ProfileInfoRow(
            icon: Icons.alternate_email,
            label: 'Username',
            value: employee.username,
          ),
          _ProfileInfoRow(
            icon: Icons.email_outlined,
            label: 'Email',
            value: employee.email,
          ),
          _ProfileInfoRow(
            icon: Icons.phone_outlined,
            label: 'No. Handphone',
            value: employee.phone,
          ),
          _ProfileInfoRow(
            icon: Icons.people_outline,
            label: 'Jenis Kelamin',
            value: _genderLabel(employee.gender),
          ),
          _ProfileInfoRow(
            icon: Icons.location_on_outlined,
            label: 'Alamat',
            value: employee.address,
            isLast: true,
          ),
        ],
      ),
    );
  }

  String? _genderLabel(String? gender) {
    return switch (gender) {
      'l' => 'Laki-laki',
      'p' => 'Perempuan',
      _ => null,
    };
  }
}

class _ProfileInfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? value;
  final bool isLast;

  const _ProfileInfoRow({
    required this.icon,
    required this.label,
    required this.value,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    final displayValue = value?.trim().isNotEmpty == true
        ? value!.trim()
        : 'Belum diisi';

    return Padding(
      padding: EdgeInsets.only(bottom: isLast ? 0 : context.space.lg),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: EdgeInsets.all(context.space.xs),
            decoration: BoxDecoration(
              color: context.colors.primary.withAlpha(18),
              borderRadius: BorderRadius.circular(context.radius.sm),
            ),
            child: Icon(icon, color: context.colors.primary),
          ),
          SizedBox(width: context.space.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: context.typography.bodySmall.copyWith(
                    color: context.colors.onSurfaceVariant,
                  ),
                ),
                SizedBox(height: context.space.xs),
                Text(displayValue, style: context.typography.titleMedium),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileCard extends StatelessWidget {
  final Widget child;

  const _ProfileCard({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(context.space.xl),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(context.radius.lg),
        border: Border.all(color: context.colors.outlineVariant),
      ),
      child: child,
    );
  }
}
