import 'dart:async';
import 'package:flutter/material.dart';

class SessionTimerProvider extends ChangeNotifier {
  int _minutes = 0;
  Timer? _timer;

  int get minutes => _minutes;

  void start() {
    _timer?.cancel();
    _minutes = 0;
    _timer = Timer.periodic(const Duration(minutes: 1), (timer) {
      _minutes++;
      notifyListeners();
    });
  }

  void stop() {
    _timer?.cancel();
    _minutes = 0;
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
