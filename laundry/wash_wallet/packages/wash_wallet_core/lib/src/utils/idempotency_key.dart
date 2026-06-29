import 'package:uuid/uuid.dart';

class IdempotencyKey {
  static String generate() => const Uuid().v4();
}
