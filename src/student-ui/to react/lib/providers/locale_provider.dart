import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocaleProvider with ChangeNotifier {
  static const String _localeKey = 'locale';
  final SharedPreferences _prefs;
  Locale _locale;

  LocaleProvider(this._prefs) : _locale = _loadLocale(_prefs);

  static Locale _loadLocale(SharedPreferences prefs) {
    final String? languageCode = prefs.getString(_localeKey);
    return languageCode != null ? Locale(languageCode) : const Locale('en');
  }

  Locale get locale => _locale;

  Future<void> setLocale(Locale locale) async {
    if (_locale == locale) return;

    _locale = locale;
    await _prefs.setString(_localeKey, locale.languageCode);
    notifyListeners();
  }

  static const List<Locale> supportedLocales = [
    Locale('en'), // English
    Locale('ar'), // Arabic
  ];

  static String getLanguageName(String languageCode) {
    switch (languageCode) {
      case 'en':
        return 'English';
      case 'ar':
        return 'العربية';
      case 'fr':
        return 'Français';
      case 'es':
        return 'Español';
      default:
        return 'English';
    }
  }
}
