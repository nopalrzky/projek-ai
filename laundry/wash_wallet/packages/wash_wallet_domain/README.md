# wash_wallet_domain

Shared domain models and entities for WashWallet apps.

## Contents

### Models (Freezed)

Models are data transfer objects from the API. They use Freezed for immutability and JSON serialization.

- **auth_employee_model.dart** - Authenticated employee data
- **category_model.dart** - Service category
- **laundry_service_model.dart** - Laundry service
- **order_model.dart** - Order (superset of cashier + production)
- **order_item_model.dart** - Individual item in an order
- **outlet_model.dart** - Business outlet
- **unit_model.dart** - Measurement unit
- **customer_model.dart** - Customer data
- **employee_model.dart** - Employee data
- And more...

### Entities (Equatable)

Entities are domain objects representing business logic. They are simpler than models and contain business-related data.

- **auth_employee.dart** - Authenticated employee
- **category.dart** - Service category
- **order.dart** - Order in domain
- And more...

### Helpers

- **json_converters.dart** - Utility functions for safe type conversions (toInt, toDouble, toDateTime, etc.)

## Usage

```dart
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

// Using models (from API)
final orderModel = OrderModel.fromJson(apiResponse);

// Using entities (in business logic)
final order = orderModel.toEntity();
```

## Freezed Code Generation

After adding this package to your app, run build_runner:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```
