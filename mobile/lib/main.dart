import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'providers/auth_provider.dart';
import 'services/api_service.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/board_screen.dart';
import 'screens/teams_screen.dart';
import 'screens/profile_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final api = ApiService();
  final auth = AuthProvider(api);
  await auth.loadFromPrefs();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: auth),
        Provider.value(value: api),
      ],
      child: RetroApp(auth: auth),
    ),
  );
}

class RetroApp extends StatelessWidget {
  final AuthProvider auth;
  const RetroApp({super.key, required this.auth});

  @override
  Widget build(BuildContext context) {
    final router = GoRouter(
      initialLocation: auth.isLoggedIn ? '/dashboard' : '/login',
      routes: [
        GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
        GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
        GoRoute(path: '/dashboard', builder: (_, __) => const DashboardScreen()),
        GoRoute(path: '/board/:id', builder: (_, state) => BoardScreen(boardId: int.parse(state.pathParameters['id']!))),
        GoRoute(path: '/teams', builder: (_, __) => const TeamsScreen()),
        GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
      ],
    );

    return MaterialApp.router(
      title: 'RetroBoard',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: const ColorScheme.dark(primary: Color(0xFFa855f7), surface: Color(0xFF0f0c29)),
        scaffoldBackgroundColor: const Color(0xFF0f0c29),
      ),
      routerConfig: router,
    );
  }
}
