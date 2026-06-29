import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class OrderReviewNotesField extends StatelessWidget {
  final TextEditingController controller;

  const OrderReviewNotesField({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      maxLines: 2,
      decoration: InputDecoration(
        labelText: 'Catatan Order (Opsional)',
        hintText: 'Cth: Antar jemput, titip satpam...',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
        ),
      ),
    );
  }
}

