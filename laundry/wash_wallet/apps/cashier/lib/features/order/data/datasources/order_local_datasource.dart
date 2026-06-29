import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wash_wallet_core/wash_wallet_core.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

abstract class OrderLocalDatasource {
  Future<void> saveDraft(OrderDraftModel draft);
  Future<OrderDraftModel?> getDraft({
    required int customerId,
    required int outletId,
    required int employeeId,
  });
  Future<void> clearDraft({
    required int customerId,
    required int outletId,
    required int employeeId,
  });

  Future<void> saveWeighingDraft(WeighingDraftModel draft);
  Future<WeighingDraftModel?> getWeighingDraft({
    required int orderId,
    required int employeeId,
    required int outletId,
  });
  Future<void> clearWeighingDraft({
    required int orderId,
    required int employeeId,
    required int outletId,
  });
}

class OrderLocalDatasourceImpl implements OrderLocalDatasource {
  final SharedPreferences _sharedPreferences;

  OrderLocalDatasourceImpl(this._sharedPreferences);

  String _generateKey(int customerId, {int? outletId, int? employeeId}) {
    if (outletId != null && employeeId != null) {
      return 'cashier_order_draft_v2_${outletId}_${employeeId}_$customerId';
    }
    return 'draft_order_customer_$customerId';
  }

  String _generateWeighingKey(int orderId, int employeeId, int outletId) {
    return 'cashier_weighing_draft_v2_${outletId}_${orderId}_$employeeId';
  }

  @override
  Future<void> saveDraft(OrderDraftModel draft) async {
    try {
      final key = _generateKey(draft.customerId, outletId: draft.outletId, employeeId: draft.employeeId);
      final jsonString = json.encode(draft.toJson());
      await _sharedPreferences.setString(key, jsonString);
    } catch (e) {
      throw LocalStorageException(message: 'Failed to save draft locally');
    }
  }

  @override
  Future<OrderDraftModel?> getDraft({
    required int customerId,
    required int outletId,
    required int employeeId,
  }) async {
    try {
      final v2Key = _generateKey(customerId, outletId: outletId, employeeId: employeeId);
      final v1Key = _generateKey(customerId);

      String? jsonString = _sharedPreferences.getString(v2Key);

      jsonString ??= _sharedPreferences.getString(v1Key);

      if (jsonString != null) {
        final jsonMap = json.decode(jsonString) as Map<String, dynamic>;
        return OrderDraftModel.fromJson(jsonMap);
      }
      return null;
    } catch (e) {
      throw LocalStorageException(message: 'Failed to load draft locally');
    }
  }

  @override
  Future<void> clearDraft({
    required int customerId,
    required int outletId,
    required int employeeId,
  }) async {
    try {
      final v2Key = _generateKey(customerId, outletId: outletId, employeeId: employeeId);
      final v1Key = _generateKey(customerId);
      
      await _sharedPreferences.remove(v2Key);
      await _sharedPreferences.remove(v1Key);
    } catch (e) {
      throw LocalStorageException(message: 'Failed to clear draft');
    }
  }

  @override
  Future<void> saveWeighingDraft(WeighingDraftModel draft) async {
    try {
      final key = _generateWeighingKey(draft.orderId, draft.employeeId, draft.outletId);
      final jsonString = json.encode(draft.toJson());
      await _sharedPreferences.setString(key, jsonString);
    } catch (e) {
      throw LocalStorageException(message: 'Failed to save weighing draft locally');
    }
  }

  @override
  Future<WeighingDraftModel?> getWeighingDraft({
    required int orderId,
    required int employeeId,
    required int outletId,
  }) async {
    try {
      final key = _generateWeighingKey(orderId, employeeId, outletId);
      final jsonString = _sharedPreferences.getString(key);

      if (jsonString != null) {
        final jsonMap = json.decode(jsonString) as Map<String, dynamic>;
        return WeighingDraftModel.fromJson(jsonMap);
      }
      return null;
    } catch (e) {
      throw LocalStorageException(message: 'Failed to load weighing draft locally');
    }
  }

  @override
  Future<void> clearWeighingDraft({
    required int orderId,
    required int employeeId,
    required int outletId,
  }) async {
    try {
      final key = _generateWeighingKey(orderId, employeeId, outletId);
      await _sharedPreferences.remove(key);
    } catch (e) {
      throw LocalStorageException(message: 'Failed to clear weighing draft');
    }
  }
}

