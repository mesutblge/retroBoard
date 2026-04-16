import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../models/models.dart';

class TeamsScreen extends StatefulWidget {
  const TeamsScreen({super.key});
  @override
  State<TeamsScreen> createState() => _TeamsScreenState();
}

class _TeamsScreenState extends State<TeamsScreen> {
  List<Team> _teams = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final t = await context.read<ApiService>().getTeams();
    if (mounted) setState(() { _teams = t; _loading = false; });
  }

  Future<void> _create() async {
    final c = TextEditingController();
    await showDialog(context: context, builder: (ctx) => AlertDialog(
      backgroundColor: const Color(0xFF1a1730),
      title: const Text('Yeni Takım', style: TextStyle(color: Colors.white)),
      content: TextField(
        controller: c,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          labelText: 'Takım Adı',
          labelStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
          filled: true, fillColor: Colors.white.withOpacity(0.07),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFa855f7))),
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('İptal')),
        ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFa855f7)),
          onPressed: () async {
            if (c.text.trim().isEmpty) return;
            Navigator.pop(ctx);
            final team = await context.read<ApiService>().createTeam(c.text.trim());
            setState(() => _teams.add(team));
          },
          child: const Text('Oluştur', style: TextStyle(color: Colors.white)),
        ),
      ],
    ));
  }

  Future<void> _delete(Team team) async {
    await context.read<ApiService>().deleteTeam(team.id);
    setState(() => _teams.removeWhere((t) => t.id == team.id));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0f0c29),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0f0c29),
        elevation: 0,
        leading: IconButton(icon: const Icon(Icons.arrow_back, color: Colors.white), onPressed: () => Navigator.pop(context)),
        title: const Text('Takımlar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFa855f7)))
          : _teams.isEmpty
              ? Center(child: Text('Henüz takım yok', style: TextStyle(color: Colors.white.withOpacity(0.4))))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _teams.length,
                  itemBuilder: (_, i) => Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.white.withOpacity(0.08)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 40, height: 40,
                          decoration: BoxDecoration(color: const Color(0xFF6366f1).withOpacity(0.2), borderRadius: BorderRadius.circular(10)),
                          child: const Center(child: Icon(Icons.group, color: Color(0xFF818cf8), size: 20)),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(_teams[i].name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
                              Text('${_teams[i].members.length} üye', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12)),
                            ],
                          ),
                        ),
                        IconButton(icon: const Icon(Icons.delete_outline, color: Color(0xFFf87171), size: 20), onPressed: () => _delete(_teams[i])),
                      ],
                    ),
                  ),
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: _create,
        backgroundColor: const Color(0xFFa855f7),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}
