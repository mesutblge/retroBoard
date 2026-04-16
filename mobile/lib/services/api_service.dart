import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:8080/api';
  late final Dio _dio;

  ApiService() {
    _dio = Dio(BaseOptions(baseUrl: baseUrl, connectTimeout: const Duration(seconds: 10)));
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('token');
        if (token != null) options.headers['Authorization'] = 'Bearer $token';
        handler.next(options);
      },
    ));
  }

  Future<AuthResponse> login(String email, String password) async {
    final res = await _dio.post('/auth/login', data: {'email': email, 'password': password});
    return AuthResponse.fromJson(res.data);
  }

  Future<AuthResponse> register({required String email, required String password, required String fullName, String? companyName, String? inviteCode}) async {
    final res = await _dio.post('/auth/register', data: {
      'email': email, 'password': password, 'fullName': fullName,
      if (companyName != null) 'companyName': companyName,
      if (inviteCode != null) 'inviteCode': inviteCode,
    });
    return AuthResponse.fromJson(res.data);
  }

  Future<List<Board>> getBoards() async {
    final res = await _dio.get('/boards');
    return (res.data as List).map((b) => Board.fromJson(b)).toList();
  }

  Future<Board> getBoard(int id) async {
    final res = await _dio.get('/boards/$id');
    return Board.fromJson(res.data);
  }

  Future<Board> createBoard(String name, int teamId) async {
    final res = await _dio.post('/boards', data: {'name': name, 'teamId': teamId});
    return Board.fromJson(res.data);
  }

  Future<void> deleteBoard(int id) => _dio.delete('/boards/$id');

  Future<CardModel> addCard(int boardId, String content, String columnType, bool anonymous) async {
    final res = await _dio.post('/boards/$boardId/cards', data: {'content': content, 'columnType': columnType, 'anonymous': anonymous});
    return CardModel.fromJson(res.data);
  }

  Future<CardModel> voteCard(int cardId) async {
    final res = await _dio.post('/boards/cards/$cardId/vote');
    return CardModel.fromJson(res.data);
  }

  Future<void> deleteCard(int cardId) => _dio.delete('/boards/cards/$cardId');

  Future<void> toggleReveal(int boardId) => _dio.post('/boards/$boardId/reveal');

  Future<void> reorderCards(int boardId, List<Map<String, int>> orders) =>
      _dio.put('/boards/$boardId/cards/reorder', data: orders);

  Future<List<Team>> getTeams() async {
    final res = await _dio.get('/teams');
    return (res.data as List).map((t) => Team.fromJson(t)).toList();
  }

  Future<Team> createTeam(String name) async {
    final res = await _dio.post('/teams', data: {'name': name});
    return Team.fromJson(res.data);
  }

  Future<void> deleteTeam(int id) => _dio.delete('/teams/$id');

  Future<void> addMember(int teamId, int userId) => _dio.post('/teams/$teamId/members/$userId');
  Future<void> removeMember(int teamId, int userId) => _dio.delete('/teams/$teamId/members/$userId');

  Future<void> updateProfile(String fullName, String email, {String? currentPassword, String? newPassword}) =>
      _dio.patch('/users/me', data: {
        'fullName': fullName, 'email': email,
        if (currentPassword != null) 'currentPassword': currentPassword,
        if (newPassword != null) 'newPassword': newPassword,
      });
}
