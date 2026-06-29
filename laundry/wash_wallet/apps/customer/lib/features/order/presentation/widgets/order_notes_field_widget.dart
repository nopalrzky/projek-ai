import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../bloc/order_cubit.dart';

class OrderNotesFieldWidget extends StatelessWidget {
  final TextEditingController controller;

  const OrderNotesFieldWidget({
    super.key,
    required this.controller,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      maxLines: 3,
      decoration: InputDecoration(
        hintText: 'Contoh: Jemput di depan pagar warna hitam',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(context.radius.md),
        ),
        contentPadding: EdgeInsets.all(context.space.md),
      ),
      onChanged: (val) => context.read<OrderCubit>().setNotes(val),
    );
  }
}
