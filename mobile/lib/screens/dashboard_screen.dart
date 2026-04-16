import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../models/models.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<Board> _boards = [];
  List<Team> _teams = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final api = context.read<ApiService>();
    try {
      final boards = await api.getBoards();
      final teams = await api.getTeams();
      if (mounted) setState(() { _boards = boards; _teams = teams; _loading = false; });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _createBoard() async {
    if (_teams.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Önce bir takım oluştur')));
      return;
    }
    final nameC = TextEditingController();
    Team? selectedTeam = _teams.first;

    await showDialog(context: context, builder: (ctx) => StatefulBuilder(
      builder: (ctx, setSt) => AlertDialog(
        backgroundColor: const Color(0xFF1a1730),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Yeni Board', style: TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _DialogField(controller: nameC, label: 'Board Adı'),
            const SizedBox(height: 12),
            DropdownButtonFormField<Team>(
              value: selectedTeam,
              dropdownColor: const Color(0xFF1a1730),
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Takım',
                labelStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
                filled: true, fillColor: Colors.white.withOpacity(0.07),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
              ),
              items: _teams.map((t) => DropdownMenuItem(value: t, child: Text(t.name))).toList(),
              onChanged: (t) => setSt(() => selectedTeam = t),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text('İptal', style: TextStyle(color: Colors.white.withOpacity(0.5)))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFa855f7)),
            onPressed: () async {
              if (nameC.text.trim().isEmpty || selectedTeam == null) return;
              Navigator.pop(ctx);
              final board = await context.read<ApiService>().createBoard(nameC.text.trim(), selectedTeam!.id);
              setState(() => _boards.insert(0, board));
            },
            child: const Text('Oluştur', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    ));
  }

  Future<void> _deleteBoard(Board board) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1a1730),
        title: const Text('Board Sil', style: TextStyle(color: Colors.white)),
        content: Text('"${board.name}" silinecek. Emin misin?', style: TextStyle(color: Colors.white.withOpacity(0.7))),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('İptal')),
          ElevatedButton(style: ElevatedButton.styleFrom(backgroundColor: Colors.red), onPressed: () => Navigator.pop(ctx, true), child: const Text('Sil', style: TextStyle(color: Colors.white))),
        ],
      ),
    );
    if (confirm == true) {
      await context.read<ApiService>().deleteBoard(board.id);
      setState(() => _boards.removeWhere((b) => b.id == board.id));
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    return Scaffold(
      backgroundColor: const Color(0xFF0f0c29),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('RetroBoard', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18)),
            Text(auth.auth?.companyName ?? '', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11)),
          ],
        ),
        actions: [
          if (auth.isAdmin)
            IconButton(icon: const Icon(Icons.group, color: Color(0xFF818cf8)), onPressed: () => context.push('/teams')),
          IconButton(icon: const Icon(Icons.person_outline, color: Colors.white54), onPressed: () => context.push('/profile')),
          IconButton(
            icon: const Icon(Icons.logout, color: Color(0xFFf87171)),
            onPressed: () { auth.logout(); context.go('/login'); },
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFa855f7)))
          : RefreshIndicator(
              onRefresh: _load,
              child: _boards.isEmpty
                  ? Center(child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('📋', style: TextStyle(fontSize: 48)),
                        const SizedBox(height: 12),
                        Text('Henüz board yok', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 15)),
                      ],
                    ))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _boards.length,
                      itemBuilder: (_, i) => _BoardCard(
                        board: _boards[i],
                        isAdmin: auth.isAdmin,
                        onTap: () => context.push('/board/${_boards[i].id}'),
                        onDelete: () => _deleteBoard(_boards[i]),
                      ),
                    ),
            ),
      floatingActionButton: auth.isAdmin
          ? FloatingActionButton.extended(
              onPressed: _createBoard,
              backgroundColor: const Color(0xFFa855f7),
              icon: const Icon(Icons.add, color: Colors.white),
              label: const Text('Yeni Board', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
            )
          : null,
    );
  }
}

class _BoardCard extends StatelessWidget {
  final Board board;
  final bool isAdmin;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const _BoardCard({required this.board, required this.isAdmin, required this.onTap, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Row(
          children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFFa855f7), Color(0xFF6366f1)]), borderRadius: BorderRadius.circular(12)),
              child: const Center(child: Text('🔄', style: TextStyle(fontSize: 20))),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(board.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
                  const SizedBox(height: 2),
                  Row(children: [
                    Text('👥 ${board.teamName}', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12)),
                    const SizedBox(width: 8),
                    Text('${board.cards.length} kart', style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 11)),
                  ]),
                ],
              ),
            ),
            if (isAdmin)
              IconButton(
                icon: const Icon(Icons.delete_outline, color: Color(0xFFf87171), size: 20),
                onPressed: onDelete,
              ),
            const Icon(Icons.chevron_right, color: Colors.white24),
          ],
        ),
      ),
    );
  }
}

class _DialogField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  const _DialogField({required this.controller, required this.label});

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
        filled: true, fillColor: Colors.white.withOpacity(0.07),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFa855f7))),
      ),
    );
  }
}
