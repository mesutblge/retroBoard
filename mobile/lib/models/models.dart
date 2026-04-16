class AuthResponse {
  final String token;
  final String email;
  final String fullName;
  final String role;
  final int companyId;
  final String companyName;
  final String? inviteCode;

  AuthResponse({required this.token, required this.email, required this.fullName, required this.role, required this.companyId, required this.companyName, this.inviteCode});

  factory AuthResponse.fromJson(Map<String, dynamic> j) => AuthResponse(
        token: j['token'],
        email: j['email'],
        fullName: j['fullName'],
        role: j['role'],
        companyId: j['companyId'],
        companyName: j['companyName'],
        inviteCode: j['inviteCode'],
      );

  bool get isAdmin => role == 'ADMIN' || role == 'SUPER_ADMIN';
}

class Team {
  final int id;
  final String name;
  final List<dynamic> members;

  Team({required this.id, required this.name, required this.members});

  factory Team.fromJson(Map<String, dynamic> j) => Team(
        id: j['id'],
        name: j['name'],
        members: j['members'] ?? [],
      );
}

class Board {
  final int id;
  final String name;
  final int teamId;
  final String teamName;
  bool revealed;
  final String createdAt;
  List<CardModel> cards;

  Board({required this.id, required this.name, required this.teamId, required this.teamName, required this.revealed, required this.createdAt, required this.cards});

  factory Board.fromJson(Map<String, dynamic> j) => Board(
        id: j['id'],
        name: j['name'],
        teamId: j['teamId'],
        teamName: j['teamName'],
        revealed: j['revealed'] ?? false,
        createdAt: j['createdAt'] ?? '',
        cards: (j['cards'] as List? ?? []).map((c) => CardModel.fromJson(c)).toList(),
      );
}

class CardModel {
  final int id;
  final String content;
  final String columnType;
  final int voteCount;
  final int sortOrder;
  final String createdBy;
  final bool anonymous;
  final bool mine;
  final String createdAt;

  CardModel({required this.id, required this.content, required this.columnType, required this.voteCount, required this.sortOrder, required this.createdBy, required this.anonymous, required this.mine, required this.createdAt});

  factory CardModel.fromJson(Map<String, dynamic> j) => CardModel(
        id: j['id'],
        content: j['content'],
        columnType: j['columnType'],
        voteCount: j['voteCount'] ?? 0,
        sortOrder: j['sortOrder'] ?? 0,
        createdBy: j['createdBy'] ?? '',
        anonymous: j['anonymous'] ?? false,
        mine: j['mine'] ?? false,
        createdAt: j['createdAt'] ?? '',
      );

  CardModel copyWith({int? voteCount, bool? mine}) => CardModel(
        id: id, content: content, columnType: columnType,
        voteCount: voteCount ?? this.voteCount,
        sortOrder: sortOrder, createdBy: createdBy,
        anonymous: anonymous, mine: mine ?? this.mine,
        createdAt: createdAt,
      );
}
