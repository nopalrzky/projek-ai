import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:wash_wallet_data/wash_wallet_data.dart';
class SwitchEmployeeScreen extends StatefulWidget {
  const SwitchEmployeeScreen({super.key});

  @override
  State<SwitchEmployeeScreen> createState() => _SwitchEmployeeScreenState();
}

class _SwitchEmployeeScreenState extends State<SwitchEmployeeScreen> {
  List<RememberedEmployeeAccount> _accounts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAccounts();
  }

  Future<void> _loadAccounts() async {
    final prefs = await SharedPreferences.getInstance();
    final ds = RememberedEmployeeLocalDatasourceImpl(prefs);
    final accounts = await ds.getAccounts();
    setState(() {
      _accounts = accounts;
      _isLoading = false;
    });
  }

  Future<void> _removeAccount(int employeeId) async {
    final prefs = await SharedPreferences.getInstance();
    final ds = RememberedEmployeeLocalDatasourceImpl(prefs);
    await ds.removeAccount(employeeId);
    _loadAccounts();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pilih Akun Kasir')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _accounts.isEmpty
              ? _buildEmpty()
              : _buildList(),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('Belum ada akun yang tersimpan.'),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => context.go('/login'),
            child: const Text('Login dengan Password'),
          ),
        ],
      ),
    );
  }

  Widget _buildList() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ..._accounts.map((acc) => ListTile(
              leading: const CircleAvatar(child: Icon(Icons.person)),
              title: Text(acc.name),
              subtitle: Text(acc.outletName),
              trailing: IconButton(
                icon: const Icon(Icons.delete, color: Colors.red),
                onPressed: () => _removeAccount(acc.employeeId),
              ),
              onTap: () {
                if (acc.hasPin) {
                  context.push('/pin-entry', extra: {
                    'employeeId': acc.employeeId,
                    'username': acc.username,
                    'name': acc.name,
                  });
                } else {
                  context.go('/login');
                }
              },
            )),
        const Divider(),
        ListTile(
          leading: const Icon(Icons.add),
          title: const Text('Login akun lain (Password)'),
          onTap: () => context.go('/login'),
        ),
      ],
    );
  }
}
