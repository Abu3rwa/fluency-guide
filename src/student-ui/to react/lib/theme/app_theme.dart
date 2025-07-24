import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class AppTheme {
  // Define your color palette
  static const Color primaryLight = Color(0xFF009688); // Teal 500
  static const Color primaryDark = Color(0xFF00796B); // Teal 700
  static const Color surfaceLight = Color(0xFFFAFAFA);
  static const Color surfaceDark = Color(0xFF121212);
  static const Color backgroundLight = Color(0xFFFFFFFF);
  static const Color backgroundDark = Color.fromARGB(255, 0, 5, 1);
  static const BoxShadow boxShadow = BoxShadow(
    color: Color.fromARGB(17, 0, 110, 77),
    blurRadius: 10,
    offset: Offset(2, 2),
  );
  // Light Theme
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primaryLight,
      brightness: Brightness.light,
      surface: surfaceLight,
      background: backgroundLight,
      primary: primaryLight,
      secondary: const Color(0xFF80CBC4), // Teal 200 for secondary
    ),
    textTheme: TextTheme(
      displayLarge: GoogleFonts.poppins(
        fontSize: 32,
        fontWeight: FontWeight.bold,
      ),
      headlineLarge: GoogleFonts.poppins(
        fontSize: 28,
        fontWeight: FontWeight.w600,
      ),
      bodyLarge: GoogleFonts.inter(fontSize: 16),
      bodyMedium: GoogleFonts.inter(fontSize: 14),
      bodySmall: GoogleFonts.inter(fontSize: 12),
      labelSmall: GoogleFonts.inter(fontSize: 10),
      labelMedium: GoogleFonts.inter(fontSize: 12),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      iconTheme: IconThemeData(color: Colors.black87),
      titleTextStyle: TextStyle(
        color: Colors.black87,
        fontSize: 18,
        fontWeight: FontWeight.w600,
      ),
    ),
    cardTheme: CardThemeData(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: Colors.white,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: primaryLight, width: 2),
      ),
      filled: true,
      fillColor: Colors.grey.shade50,
    ),
  );

  // Dark Theme
  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF26A69A), // Teal 400
      brightness: Brightness.dark,
      primary: const Color(0xFF26A69A), // Teal 400
      secondary: const Color(0xFF80CBC4), // Teal 200
      surface: const Color(0xFF1E1E1E),
      background: const Color(0xFF121212),
      onPrimary: Colors.white,
      onSecondary: Colors.black,
      onSurface: const Color(0xFFE0E0E0),
      onBackground: const Color(0xFFE0E0E0),
      error: const Color(0xFFCF6679),
      onError: Colors.black,
    ),
    textTheme: TextTheme(
      displayLarge: GoogleFonts.poppins(
        fontSize: 32,
        fontWeight: FontWeight.bold,
        color: const Color(0xFFE0E0E0),
      ),
      headlineLarge: GoogleFonts.poppins(
        fontSize: 28,
        fontWeight: FontWeight.w600,
        color: const Color(0xFFE0E0E0),
      ),
      bodyLarge: GoogleFonts.inter(fontSize: 16, color: const Color(0xFFE0E0E0)),
      bodyMedium: GoogleFonts.inter(fontSize: 14, color: const Color(0xFFE0E0E0)),
      bodySmall: GoogleFonts.inter(fontSize: 12, color: const Color(0xFFE0E0E0)),
      labelSmall: GoogleFonts.inter(fontSize: 10, color: const Color(0xFFE0E0E0)),
      labelMedium: GoogleFonts.inter(fontSize: 12, color: const Color(0xFFE0E0E0)),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      iconTheme: IconThemeData(color: Color(0xFFE0E0E0)),
      titleTextStyle: TextStyle(
        color: Color(0xFFE0E0E0),
        fontSize: 18,
        fontWeight: FontWeight.w600,
      ),
    ),
    cardTheme: CardThemeData(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: const Color(0xFF1E1E1E),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Colors.grey),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Color(0xFF26A69A), width: 2),
      ),
      filled: true,
      fillColor: const Color(0xFF2C2C2C),
    ),
  );
}
