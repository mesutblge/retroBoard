import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../models/models.dart';

const _columns = [
  {'type': 'WENT_WELL', 'label': 'Went Well', 'emoji': '✅', 'color': Color(0xFF10b981)},
  {'type': 'TO_IMPROVE', 'label': 'To Improve', 'emoji': '⚠️', 'color': Color(0xFFf59e0b)},
  {'type': 'ACTION_ITEMS', 'label': 'Action Items', 'emoji': '⚡', 'color': Color(0xFF6366f1)},
];

const _emojiList = ['🔥', '🎉', '👏', '💜', '🚀', '😂', '❤️', '⭐', '💡', '🎯'];

class BoardScreen extends StatefulWidget {
  final int boardId;
  const BoardScreen({super.key, required this.boardId});
  @override
  State<BoardScreen> createState() => _BoardScreenState();
}

class _BoardScreenState extends State<BoardScreen> with SingleTickerProviderStateMixin {
  Board? _board;
  bool _anonymous = false;
  bool _loading = true;
  StompClient? _stomp;
  late TabController _tabController;
  final Map<String, TextEditingController> _inputs = {
    'WENT_WELL': TextEditingController(),
    'TO_IMPROVE': TextEditingController(),
    'ACTION_ITEMS': TextEditingController(),
  };
  List<_EmojiParticle> _particles = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadBoard();
    _connectWs();
  }

  @override
  void dispose() {
    _stomp?.deactivate();
    _tabController.dispose();
    for (final c in _inputs.values) c.dispose();
    super.dispose();
  }

  Future<void> _loadBoard() async {
    try {
      final b = await context.read<ApiService>().getBoard(widget.boardId);
      if (mounted) setState(() { _board = b; _loading = false; });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _connectWs() {
    final token = context.read<AuthProvider>().auth?.token ?? '';
    _stomp = StompClient(
      config: StompConfig.sockJS(
        url: 'http://localhost:8080/ws',
        onConnect: (frame) {
          _stomp!.subscribe(
            destination: '/topic/board/${widget.boardId}',
            callback: (frame) {
              if (frame.body == null) return;
              final data = jsonDecode(frame.body!);
              if (!mounted) return;
              setState(() => _handleWs(data));
            },
          );
        },
        webSocketConnectHeaders: {'Authorization': 'Bearer $token'},
      ),
    );
    _stomp!.activate();
  }

  void _handleWs(dynamic data) {
    if (data is Map) {
      final type = data['type'];
      if (type == 'card_deleted') {
        final id = data['cardId'];
        _board?.cards.removeWhere((c) => c.id == id);
      } else if (type == 'reorder') {
        final orders = data['orders'] as List;
        for (final o in orders) {
          final idx = _board?.cards.indexWhere((c) => c.id == o['cardId']) ?? -1;
          if (idx != -1) {
            final old = _board!.cards[idx];
            _board!.cards[idx] = CardModel(id: old.id, content: old.content, columnType: old.columnType, voteCount: old.voteCount, sortOrder: o['sortOrder'], createdBy: old.createdBy, anonymous: old.anonymous, mine: old.mine, createdAt: old.createdAt);
          }
        }
      } else if (type == 'board_revealed') {
        _board?.revealed = data['revealed'];
      } else if (type == 'emoji') {
        _spawnEmoji(data['emoji']);
      }
    } else if (data is Map && data.containsKey('id')) {
      _updateCard(CardModel.fromJson(Map<String, dynamic>.from(data)));
    } else {
      try { _updateCard(CardModel.fromJson(Map<String, dynamic>.from(data))); } catch (_) {}
    }
  }

  void _updateCard(CardModel card) {
    if (_board == null) return;
    final idx = _board!.cards.indexWhere((c) => c.id == card.id);
    if (idx != -1) {
      _board!.cards[idx] = card.copyWith(mine: _board!.cards[idx].mine);
    } else {
      _board!.cards.add(card);
    }
  }

  void _spawnEmoji(String emoji) {
    final particles = List.generate(15, (i) => _EmojiParticle(
      emoji: emoji,
      x: (i / 15 + (i % 3) * 0.1) % 1.0,
      duration: Duration(milliseconds: 2000 + (i * 150) % 1500),
    ));
    setState(() => _particles = [..._particles, ...particles]);
    Future.delayed(const Duration(milliseconds: 4000), () {
      if (mounted) setState(() => _particles = _particles.where((p) => !particles.contains(p)).toList());
    });
  }

  Future<void> _addCard(String columnType) async {
    final content = _inputs[columnType]!.text.trim();
    if (content.isEmpty) return;
    final card = await context.read<ApiService>().addCard(widget.boardId, content, columnType, _anonymous);
    _inputs[columnType]!.clear();
    if (mounted) setState(() {
      final idx = _board?.cards.indexWhere((c) => c.id == card.id) ?? -1;
      if (idx != -1) { _board!.cards[idx] = card; } else { _board?.cards.add(card); }
    });
  }

  Future<void> _vote(CardModel card) async {
    final updated = await context.read<ApiService>().voteCard(card.id);
    if (mounted) setState(() => _updateCard(updated.copyWith(mine: card.mine)));
  }

  Future<void> _delete(CardModel card) async {
    await context.read<ApiService>().deleteCard(card.id);
    if (mounted) setState(() => _board?.cards.removeWhere((c) => c.id == card.id));
  }

  Future<void> _toggleReveal() async {
    setState(() => _board?.revealed = !(_board?.revealed ?? false));
    try { await context.read<ApiService>().toggleReveal(widget.boardId); }
    catch (_) { setState(() => _board?.revealed = !(_board?.revealed ?? false)); }
  }

  void _sendEmoji(String emoji) {
    _stomp?.send(destination: '/app/board/${widget.boardId}/emoji', body: jsonEncode(emoji));
    Navigator.pop(context);
  }

  List<CardModel> _cardsOf(String type) {
    final cards = _board?.cards.where((c) => c.columnType == type).toList() ?? [];
    cards.sort((a, b) => a.sortOrder != b.sortOrder ? a.sortOrder.compareTo(b.sortOrder) : a.createdAt.compareTo(b.createdAt));
    return cards;
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    if (_loading) return Scaffold(backgroundColor: const Color(0xFF0f0c29), body: const Center(child: CircularProgressIndicator(color: Color(0xFFa855f7))));
    if (_board == null) return Scaffold(backgroundColor: const Color(0xFF0f0c29), body: const Center(child: Text('Board bulunamadı', style: TextStyle(color: Colors.white))));

    return Scaffold(
      backgroundColor: const Color(0xFF0f0c29),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0f0c29),
        elevation: 0,
        leading: IconButton(icon: const Icon(Icons.arrow_back, color: Colors.white), onPressed: () => Navigator.pop(context)),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(_board!.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
            Text('👥 ${_board!.teamName}', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11)),
          ],
        ),
        actions: [
          if (auth.isAdmin)
            IconButton(
              icon: Icon(_board!.revealed ? Icons.visibility_off : Icons.visibility, color: _board!.revealed ? const Color(0xFFfbbf24) : const Color(0xFF818cf8)),
              tooltip: _board!.revealed ? 'Gizle' : 'Göster',
              onPressed: _toggleReveal,
            ),
          IconButton(
            icon: const Text('🎉', style: TextStyle(fontSize: 20)),
            onPressed: () => _showEmojiPicker(),
          ),
          IconButton(
            icon: Icon(_anonymous ? Icons.theater_comedy : Icons.person_outline, color: _anonymous ? const Color(0xFFc084fc) : Colors.white54),
            onPressed: () => setState(() => _anonymous = !_anonymous),
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Color(0xFFf87171)),
            onPressed: () { auth.logout(); context.go('/login'); },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFFa855f7),
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white38,
          tabs: _columns.map((col) => Tab(
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Text(col['emoji'] as String),
              const SizedBox(width: 4),
              Text(_cardsOf(col['type'] as String).length.toString(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
            ]),
          )).toList(),
        ),
      ),
      body: Stack(
        children: [
          TabBarView(
            controller: _tabController,
            children: _columns.map((col) => _ColumnView(
              col: col,
              cards: _cardsOf(col['type'] as String),
              isAdmin: auth.isAdmin,
              revealed: _board!.revealed,
              fullName: auth.fullName,
              inputController: _inputs[col['type'] as String]!,
              anonymous: _anonymous,
              onAdd: () => _addCard(col['type'] as String),
              onVote: _vote,
              onDelete: _delete,
            )).toList(),
          ),
          // Emoji rain
          ..._particles.map((p) => _EmojiRainWidget(particle: p)),
        ],
      ),
    );
  }

  void _showEmojiPicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1a1730),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Emoji Gönder', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 16)),
            const SizedBox(height: 16),
            Wrap(
              spacing: 12, runSpacing: 12,
              children: _emojiList.map((e) => GestureDetector(
                onTap: () => _sendEmoji(e),
                child: Container(
                  width: 52, height: 52,
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.07), borderRadius: BorderRadius.circular(14)),
                  child: Center(child: Text(e, style: const TextStyle(fontSize: 26))),
                ),
              )).toList(),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}

class _ColumnView extends StatelessWidget {
  final Map col;
  final List<CardModel> cards;
  final bool isAdmin, revealed, anonymous;
  final String fullName;
  final TextEditingController inputController;
  final VoidCallback onAdd;
  final Function(CardModel) onVote, onDelete;

  const _ColumnView({required this.col, required this.cards, required this.isAdmin, required this.revealed, required this.fullName, required this.inputController, required this.anonymous, required this.onAdd, required this.onVote, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    final color = col['color'] as Color;
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            itemCount: cards.length,
            itemBuilder: (_, i) {
              final card = cards[i];
              final canDelete = isAdmin || (!card.anonymous && card.createdBy == fullName);
              final showContent = isAdmin || revealed || card.mine;
              return _CardWidget(card: card, color: color, canDelete: canDelete, showContent: showContent, onVote: onVote, onDelete: onDelete);
            },
          ),
        ),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withOpacity(0.05),
            border: Border(top: BorderSide(color: color.withOpacity(0.2))),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: inputController,
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                  onSubmitted: (_) => onAdd(),
                  decoration: InputDecoration(
                    hintText: anonymous ? '🎭 Anonim kart...' : 'Kart ekle...',
                    hintStyle: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 13),
                    filled: true, fillColor: Colors.white.withOpacity(0.06),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: color, width: 1.5)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: onAdd,
                child: Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(gradient: LinearGradient(colors: [const Color(0xFFa855f7), color]), borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.add, color: Colors.white, size: 22),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _CardWidget extends StatelessWidget {
  final CardModel card;
  final Color color;
  final bool canDelete, showContent;
  final Function(CardModel) onVote, onDelete;

  const _CardWidget({required this.card, required this.color, required this.canDelete, required this.showContent, required this.onVote, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    if (!showContent) {
      return Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.03),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withOpacity(0.08), style: BorderStyle.solid),
        ),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          const Text('🔒', style: TextStyle(fontSize: 16)),
          const SizedBox(width: 8),
          Text('gizli', style: TextStyle(color: Colors.white.withOpacity(0.2), fontStyle: FontStyle.italic, fontSize: 13)),
        ]),
      );
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(card.content, style: const TextStyle(color: Color(0xFFe2e8f0), fontSize: 14, height: 1.5)),
          const SizedBox(height: 10),
          Row(
            children: [
              Text(
                card.anonymous ? '🎭 Anonim' : card.createdBy,
                style: TextStyle(color: card.anonymous ? const Color(0xFF7c3aed) : Colors.white38, fontSize: 11),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () => onVote(card),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: card.voteCount > 0 ? color.withOpacity(0.2) : Colors.white.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text('👍 ${card.voteCount}', style: TextStyle(color: card.voteCount > 0 ? color : Colors.white38, fontSize: 12, fontWeight: FontWeight.w700)),
                ),
              ),
              if (canDelete) ...[
                const SizedBox(width: 6),
                GestureDetector(
                  onTap: () => onDelete(card),
                  child: Container(
                    width: 28, height: 28,
                    decoration: BoxDecoration(color: Colors.red.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                    child: const Icon(Icons.close, color: Color(0xFFf87171), size: 16),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

class _EmojiParticle {
  final String emoji;
  final double x;
  final Duration duration;
  _EmojiParticle({required this.emoji, required this.x, required this.duration});
}

class _EmojiRainWidget extends StatefulWidget {
  final _EmojiParticle particle;
  const _EmojiRainWidget({required this.particle});
  @override
  State<_EmojiRainWidget> createState() => _EmojiRainWidgetState();
}

class _EmojiRainWidgetState extends State<_EmojiRainWidget> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: widget.particle.duration);
    _anim = Tween<double>(begin: -0.1, end: 1.1).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeIn));
    _ctrl.forward();
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) => Positioned(
        left: widget.particle.x * size.width,
        top: _anim.value * size.height,
        child: IgnorePointer(child: Text(widget.particle.emoji, style: const TextStyle(fontSize: 28))),
      ),
    );
  }
}
