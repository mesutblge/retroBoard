import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late TextEditingController _nameC, _emailC, _curPassC, _newPassC;
  bool _loading = false;
  String? _error, _success;

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthProvider>().auth;
    _nameC = TextEditingController(text: auth?.fullName ?? '');
    _emailC = TextEditingController(text: auth?.email ?? '');
    _curPassC = TextEditingController();
    _newPassC = TextEditingController();
  }

  @override
  void dispose() {
    _nameC.dispose(); _emailC.dispose(); _curPassC.dispose(); _newPassC.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() { _loading = true; _error = null; _success = null; });
    try {
      await context.read<ApiService>().updateProfile(
        _nameC.text.trim(), _emailC.text.trim(),
        currentPassword: _curPassC.text.isNotEmpty ? _curPassC.text : null,
        newPassword: _newPassC.text.isNotEmpty ? _newPassC.text : null,
      );
      context.read<AuthProvider>().updateName(_nameC.text.trim());
      setState(() => _success = 'Profil güncellendi');
    } catch (_) {
      setState(() => _error = 'Güncelleme başarısız');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final initials = auth.fullName.split(' ').map((n) => n.isNotEmpty ? n[0] : '').join().toUpperCase();

    return Scaffold(
      backgroundColor: const Color(0xFF0f0c29),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0f0c29),
        elevation: 0,
        leading: IconButton(icon: const Icon(Icons.arrow_back, color: Colors.white), onPressed: () => context.pop()),
        title: const Text('Profil', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
        actions: [
          TextButton(
            onPressed: () { auth.logout(); context.go('/login'); },
            child: const Text('Çıkış', style: TextStyle(color: Color(0xFFf87171))),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Container(
              width: 72, height: 72,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFFa855f7), Color(0xFF6366f1)]),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Center(child: Text(initials, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800))),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: auth.isAdmin ? const Color(0xFF6366f1).withOpacity(0.2) : Colors.white.withOpacity(0.06),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(auth.isAdmin ? '⚡ Admin' : '👤 Kullanıcı',
                  style: TextStyle(color: auth.isAdmin ? const Color(0xFF818cf8) : Colors.white38, fontSize: 12, fontWeight: FontWeight.w600)),
            ),
            const SizedBox(height: 8),
            Text(auth.auth?.companyName ?? '', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 13)),
            if (auth.isAdmin && auth.auth?.inviteCode != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(color: const Color(0xFFa855f7).withOpacity(0.1), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFa855f7).withOpacity(0.3))),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  const Icon(Icons.vpn_key, color: Color(0xFFc084fc), size: 16),
                  const SizedBox(width: 6),
                  Text('Davet: ${auth.auth!.inviteCode}', style: const TextStyle(color: Color(0xFFc084fc), fontSize: 13, fontWeight: FontWeight.w600)),
                ]),
              ),
            ],
            const SizedBox(height: 28),
            _section('Bilgiler'),
            _Field(controller: _nameC, label: 'Ad Soyad', icon: Icons.person_outline),
            const SizedBox(height: 12),
            _Field(controller: _emailC, label: 'Email', icon: Icons.email_outlined, keyboardType: TextInputType.emailAddress),
            const SizedBox(height: 20),
            _section('Şifre Değiştir'),
            _Field(controller: _curPassC, label: 'Mevcut Şifre', icon: Icons.lock_outline, obscure: true),
            const SizedBox(height: 12),
            _Field(controller: _newPassC, label: 'Yeni Şifre', icon: Icons.lock_open_outlined, obscure: true),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: Colors.red.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                  child: Text(_error!, style: const TextStyle(color: Color(0xFFf87171), fontSize: 13))),
            ],
            if (_success != null) ...[
              const SizedBox(height: 12),
              Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                  child: Text(_success!, style: const TextStyle(color: Color(0xFF34d399), fontSize: 13))),
            ],
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _save,
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), backgroundColor: const Color(0xFFa855f7)),
                child: _loading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Kaydet', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _section(String title) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Align(alignment: Alignment.centerLeft, child: Text(title, style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600))),
  );
}

class _Field extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final IconData icon;
  final bool obscure;
  final TextInputType? keyboardType;
  const _Field({required this.controller, required this.label, required this.icon, this.obscure = false, this.keyboardType});

  @override
  Widget build(BuildContext context) => TextField(
    controller: controller, obscureText: obscure, keyboardType: keyboardType,
    style: const TextStyle(color: Colors.white, fontSize: 14),
    decoration: InputDecoration(
      labelText: label,
      labelStyle: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 13),
      prefixIcon: Icon(icon, color: Colors.white.withOpacity(0.3), size: 18),
      filled: true, fillColor: Colors.white.withOpacity(0.07),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFa855f7))),
    ),
  );
}
