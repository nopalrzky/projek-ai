import 'package:flutter/material.dart';
import 'package:wash_wallet_cashier/features/home/presentation/widgets/employee_profile_card.dart';

class EmployeeInfoSection extends StatelessWidget {
  final String employeeName;
  final String employeePhone;

  const EmployeeInfoSection({
    super.key,
    required this.employeeName,
    required this.employeePhone,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        EmployeeProfileCard(
          employeeName: employeeName,
          employeePhone: employeePhone,
        ),
      ],
    );
  }
}
