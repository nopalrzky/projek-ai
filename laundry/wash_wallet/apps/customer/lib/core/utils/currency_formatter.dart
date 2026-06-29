import 'package:intl/intl.dart';

String formatRupiah(double amount) {
  final formatter = NumberFormat('#,##0', 'id_ID');
  return 'Rp ${formatter.format(amount.toInt())}';
}
