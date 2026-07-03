import 'dart:convert';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'cart_state.dart';

enum AddServiceResult { added, alreadyExists, conflictOutlet }

class CartCubit extends Cubit<CartState> {
  static const String _cartKey = 'active_cart_state';

  CartCubit() : super(const CartInitial()) {
    loadCart();
  }

  Future<void> loadCart() async {
    final prefs = await SharedPreferences.getInstance();
    final cartJson = prefs.getString(_cartKey);

    if (cartJson != null) {
      try {
        final Map<String, dynamic> decoded = json.decode(cartJson);
        final int? activeOutletId = decoded['activeOutletId'] as int?;
        final String? activeOutletName = decoded['activeOutletName'] as String?;
        final List<dynamic>? servicesList =
            decoded['activeServices'] as List<dynamic>?;
        final List<dynamic>? nonCourierServicesList =
            decoded['nonCourierServiceIds'] as List<dynamic>?;

        final Set<int> activeServices =
            servicesList?.map((e) => e as int).toSet() ?? {};
        final Set<int> nonCourierServiceIds =
            nonCourierServicesList?.map((e) => e as int).toSet() ?? {};

        emit(
          CartLoaded(
            activeOutletId: activeOutletId,
            activeOutletName: activeOutletName,
            activeServices: activeServices,
            nonCourierServiceIds: nonCourierServiceIds,
          ),
        );
      } catch (e) {
        emit(const CartLoaded(activeServices: {}));
      }
    } else {
      emit(const CartLoaded(activeServices: {}));
    }
  }

  Future<void> _saveCart(
    int? outletId,
    String? outletName,
    Set<int> services,
    Set<int> nonCourierIds,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    final Map<String, dynamic> serializableState = {
      'activeOutletId': outletId,
      'activeOutletName': outletName,
      'activeServices': services.toList(),
      'nonCourierServiceIds': nonCourierIds.toList(),
    };
    await prefs.setString(_cartKey, json.encode(serializableState));
  }

  void setActiveOutlet(int outletId, String outletName) {
    emit(
      state.copyWith(activeOutletId: outletId, activeOutletName: outletName),
    );
  }

  Future<AddServiceResult> addService(
    int serviceId,
    int outletId,
    String outletName, {
    bool supportsCourier = true,
  }) async {
    final currentState = state;

    if (currentState.hasItems &&
        currentState.activeOutletId != null &&
        currentState.activeOutletId != outletId) {
      return AddServiceResult.conflictOutlet;
    }

    if (currentState.activeServices.contains(serviceId) &&
        currentState.activeOutletId == outletId) {
      return AddServiceResult.alreadyExists;
    }

    await _addServiceDirect(
      serviceId,
      outletId,
      outletName,
      supportsCourier: supportsCourier,
    );
    return AddServiceResult.added;
  }

  Future<void> _addServiceDirect(
    int serviceId,
    int outletId,
    String outletName, {
    bool supportsCourier = true,
  }) async {
    final newServices = Set<int>.from(state.activeServices)..add(serviceId);
    final newNonCourierIds = Set<int>.from(state.nonCourierServiceIds);
    if (!supportsCourier) {
      newNonCourierIds.add(serviceId);
    }

    emit(
      CartLoaded(
        activeOutletId: outletId,
        activeOutletName: outletName,
        activeServices: newServices,
        nonCourierServiceIds: newNonCourierIds,
      ),
    );
    await _saveCart(outletId, outletName, newServices, newNonCourierIds);
  }

  Future<void> switchOutletAndAdd(
    int serviceId,
    int newOutletId,
    String newOutletName, {
    bool supportsCourier = true,
  }) async {
    final nonCourierIds = supportsCourier ? <int>{} : {serviceId};

    emit(
      CartLoaded(
        activeOutletId: newOutletId,
        activeOutletName: newOutletName,
        activeServices: {serviceId},
        nonCourierServiceIds: nonCourierIds,
      ),
    );
    await _saveCart(newOutletId, newOutletName, {serviceId}, nonCourierIds);
  }

  Future<void> removeFromCart(int serviceId) async {
    final currentState = state;
    final newServices = Set<int>.from(currentState.activeServices)
      ..remove(serviceId);
    final newNonCourierIds = Set<int>.from(currentState.nonCourierServiceIds)
      ..remove(serviceId);

    emit(
      CartLoaded(
        activeOutletId: currentState.activeOutletId,
        activeOutletName: currentState.activeOutletName,
        activeServices: newServices,
        nonCourierServiceIds: newNonCourierIds,
      ),
    );
    await _saveCart(
      currentState.activeOutletId,
      currentState.activeOutletName,
      newServices,
      newNonCourierIds,
    );
  }

  Future<void> clearCart() async {
    emit(
      CartLoaded(
        activeOutletId: state.activeOutletId,
        activeOutletName: state.activeOutletName,
        activeServices: const {},
        nonCourierServiceIds: const {},
      ),
    );
    await _saveCart(
      state.activeOutletId,
      state.activeOutletName,
      const {},
      const {},
    );
  }

  Future<void> clearAllCarts() async {
    emit(const CartLoaded(activeServices: {}));
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_cartKey);
  }
}
