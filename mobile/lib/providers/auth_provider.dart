import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService api;
  AuthResponse? _auth;

  AuthProvider(this.api);

  AuthResponse? get auth => _auth;
  bool get isLoggedIn => _auth != null;
  bool get isAdmin => _auth?.isAdmin ?? false;
  String get fullName => _auth?.fullName ?? '';

  Future<void> loadFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null) return;
    _auth = AuthResponse(
      token: token,
      email: prefs.getString('email') ?? '',
      fullName: prefs.getString('fullName') ?? '',
      role: prefs.getString('role') ?? 'USER',
      companyId: prefs.getInt('companyId') ?? 0,
      companyName: prefs.getString('companyName') ?? '',
      inviteCode: prefs.getString('inviteCode'),
    );
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final auth = await api.login(email, password);
    await _save(auth);
  }

  Future<void> register({required String email, required String password, required String fullName, String? companyName, String? inviteCode}) async {
    final auth = await api.register(email: email, password: password, fullName: fullName, companyName: companyName, inviteCode: inviteCode);
    await _save(auth);
  }

  Future<void> _save(AuthResponse auth) async {
    _auth = auth;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', auth.token);
    await prefs.setString('email', auth.email);
    await prefs.setString('fullName', auth.fullName);
    await prefs.setString('role', auth.role);
    await prefs.setInt('companyId', auth.companyId);
    await prefs.setString('companyName', auth.companyName);
    if (auth.inviteCode != null) await prefs.setString('inviteCode', auth.inviteCode!);
    notifyListeners();
  }

  Future<void> logout() async {
    _auth = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    notifyListeners();
  }

  void updateName(String name) {
    if (_auth == null) return;
    _auth = AuthResponse(token: _auth!.token, email: _auth!.email, fullName: name, role: _auth!.role, companyId: _auth!.companyId, companyName: _auth!.companyName, inviteCode: _auth!.inviteCode);
    SharedPreferences.getInstance().then((p) => p.setString('fullName', name));
    notifyListeners();
  }
}
