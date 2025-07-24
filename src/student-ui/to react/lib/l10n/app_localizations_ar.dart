// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get appTitle => 'EFG';

  @override
  String get selectLanguage => 'اختر اللغة';

  @override
  String get todaysProgress => 'تقدم اليوم';

  @override
  String dayStreak(int days) {
    return 'سلسلة $days أيام!';
  }

  @override
  String get dayStreakLabel => 'سلسلة الأيام';

  @override
  String progressCompleted(int percent) {
    return 'تم إنجاز $percent% من الهدف اليومي';
  }

  @override
  String minutesCompleted(int completed, int total) {
    return '$completed/$total دقيقة';
  }

  @override
  String get minutesToday => 'دقائق اليوم';

  @override
  String get achievements => 'الإنجازات';

  @override
  String get xpPoints => 'نقاط الخبرة';

  @override
  String get practiceNow => 'تدرب الآن';

  @override
  String get continueLesson => 'متابعة الدرس';

  @override
  String get dailyQuiz => 'الاختبار اليومي';

  @override
  String get testKnowledge => 'اختبر معرفتك';

  @override
  String get recentAchievements => 'الإنجازات الأخيرة';

  @override
  String get viewAll => 'عرض الكل';

  @override
  String get learningPath => 'مسار التعلم';

  @override
  String get seeAll => 'عرض الكل';

  @override
  String get welcome => 'مرحباً';

  @override
  String get signIn => 'تسجيل الدخول';

  @override
  String get signUp => 'إنشاء حساب';

  @override
  String get email => 'البريد الإلكتروني';

  @override
  String get password => 'كلمة المرور';

  @override
  String get forgotPassword => 'نسيت كلمة المرور؟';

  @override
  String get courses => 'الدورات';

  @override
  String get enrollNow => 'التسجيل الآن';

  @override
  String get enrollmentPending => 'التسجيل قيد المراجعة';

  @override
  String get startLearning => 'ابدأ التعلم';

  @override
  String get reapply => 'إعادة التقديم';

  @override
  String get alreadyEnrolled => 'أنت مسجل بالفعل في هذه الدورة';

  @override
  String get enrollmentPendingMessage =>
      'طلب التسجيل الخاص بك قيد مراجعة الموافقة';

  @override
  String get enrollmentSuccess => 'تم إرسال طلب التسجيل بنجاح';

  @override
  String get enrollmentFailed => 'فشل في إرسال طلب التسجيل';

  @override
  String get signInRequired => 'يرجى تسجيل الدخول للتسجيل في الدورات';

  @override
  String get errorOccurred => 'حدث خطأ أثناء معالجة طلبك';

  @override
  String get profile => 'الملف الشخصي';

  @override
  String get settings => 'الإعدادات';

  @override
  String get language => 'اللغة';

  @override
  String get theme => 'السمة';

  @override
  String get darkMode => 'الوضع الداكن';

  @override
  String get lightMode => 'الوضع الفاتح';

  @override
  String get overview => 'نظرة عامة';

  @override
  String get modules => 'الوحدات';

  @override
  String get students => 'الطلاب';

  @override
  String get totalStudents => 'إجمالي الطلاب';

  @override
  String get completionRate => 'معدل الإنجاز';

  @override
  String get averageScore => 'المتوسط';

  @override
  String get totalTimeSpent => 'إجمالي الوقت المستغرق';

  @override
  String get noModulesAvailable => 'لا توجد وحدات متاحة لهذه الدورة';

  @override
  String get refresh => 'تحديث';

  @override
  String get errorLoadingModules => 'خطأ في تحميل الوحدات';

  @override
  String get lessonDetails => 'تفاصيل الدرس';

  @override
  String get content => 'المحتوى';

  @override
  String get learningObjectives => 'أهداف التعلم';

  @override
  String get skillsYoullLearn => 'المهارات التي ستتعلمها';

  @override
  String get resources => 'الموارد';

  @override
  String get assessment => 'التقييم';

  @override
  String get startAssessment => 'ابدأ التقييم';

  @override
  String get quiz => 'الاختبار';

  @override
  String get startQuiz => 'ابدأ الاختبار';

  @override
  String get lessonInformation => 'معلومات الدرس';

  @override
  String get tasks => 'المهام';

  @override
  String get noTasksAvailable => 'لا توجد مهام متاحة لهذا الدرس';

  @override
  String get achievementDayStreak => '7 يوم متابعة';

  @override
  String get achievementSpeedLearner => 'متعلم سريع';

  @override
  String get achievementPerfectScore => 'درجة مثالية';

  @override
  String get courseBasicGrammar => 'القواعد الأساسية';

  @override
  String get courseVocabulary => 'المفردات';

  @override
  String get coursePronunciation => 'النطق';

  @override
  String get courseListening => 'الاستماع';

  @override
  String get courseSpeaking => 'الدورة التعليمية للتحديث';

  @override
  String get courseConversation => 'المحادثة';

  @override
  String get analytics => 'التحليلات';

  @override
  String get retry => 'إعادة المحاولة';

  @override
  String get pleaseSignIn => 'يرجى تسجيل الدخول لعرض ملفك الشخصي';

  @override
  String get enrollmentPendingApproval =>
      'طلب التسجيل الخاص بك قيد مراجعة الموافقة';

  @override
  String get enrollmentRequestSent => 'تم إرسال طلب التسجيل بنجاح';

  @override
  String get enrollmentRequestFailed => 'فشل في إرسال طلب التسجيل';

  @override
  String get searchCourses => 'البحث في الدورات...';

  @override
  String get filterCourses => 'تصفية الدورات';

  @override
  String get difficultyLevel => 'مستوى الصعوبة';

  @override
  String get duration => 'المدة';

  @override
  String get price => 'السعر';

  @override
  String get reset => 'إعادة تعيين';

  @override
  String get apply => 'تطبيق';

  @override
  String get noCoursesAvailable => 'لا توجد دورات متاحة';

  @override
  String noCoursesInCategory(String category) {
    return 'لا توجد دورات في فئة $category';
  }

  @override
  String get checkBackLater => 'تحقق لاحقاً من الدورات الجديدة';

  @override
  String get continueProgress => 'متابعة تقدمك';

  @override
  String get resumeLastLesson => 'استئناف آخر درس لك';

  @override
  String get beginJourney => 'ابدأ رحلة تعلم اللغة';

  @override
  String get browseCourses => 'تصفح الدورات';

  @override
  String get enrolled => 'مسجل';

  @override
  String minutes(int minutes) {
    return '$minutes دقيقة';
  }

  @override
  String get featured => 'مميز';

  @override
  String get lessons => 'دروس';

  @override
  String get shortDuration => 'قصيرة (أقل من ساعة)';

  @override
  String get mediumDuration => 'متوسطة (1-3 ساعات)';

  @override
  String get longDuration => 'طويلة (أكثر من 3 ساعات)';

  @override
  String get free => 'مجاني';

  @override
  String get paid => 'مدفوع';

  @override
  String get beginner => 'مبتدئ';

  @override
  String get intermediate => 'متوسط';

  @override
  String get advanced => 'متقدم';

  @override
  String get business => 'الأعمال';

  @override
  String get conversational => 'المحادثة';

  @override
  String get grammar => 'القواعد';

  @override
  String get vocabulary => 'المفردات';

  @override
  String get settingsDataNotAvailable => 'بيانات الإعدادات غير متاحة';

  @override
  String get profileAndAccount => 'الملف الشخصي والحساب';

  @override
  String get guestUser => 'مستخدم ضيف';

  @override
  String get noEmail => 'لا يوجد بريد إلكتروني';

  @override
  String get fluencyLevel => 'مستوى الطلاقة';

  @override
  String get progressSync => 'مزامنة التقدم';

  @override
  String get signOut => 'تسجيل الخروج';

  @override
  String get deleteAccount => 'حذف الحساب';

  @override
  String get exportData => 'تصدير البيانات';

  @override
  String get learningPreferences => 'تفضيلات التعلم';

  @override
  String get dailyStudyGoal => 'الهدف الدراسي اليومي';

  @override
  String get learningFocusAreas => 'مجالات التركيز في التعلم';

  @override
  String get noneSelected => 'لم يتم اختيار أي شيء';

  @override
  String get preferredAccent => 'اللكنة المفضلة';

  @override
  String get selectDailyStudyGoal => 'اختر الهدف الدراسي اليومي';

  @override
  String get selectDifficultyLevel => 'اختر مستوى الصعوبة';

  @override
  String get selectLearningFocusAreas => 'اختر مجالات التركيز في التعلم';

  @override
  String get selectPreferredAccent => 'اختر اللكنة المفضلة';

  @override
  String get cancel => 'إلغاء';

  @override
  String get ok => 'موافق';

  @override
  String get americanAccent => 'أمريكية';

  @override
  String get britishAccent => 'بريطانية';

  @override
  String get australianAccent => 'أسترالية';

  @override
  String get pronunciation => 'النطق';

  @override
  String get conversation => 'المحادثة';

  @override
  String get all => 'الكل';

  @override
  String get navHome => 'الرئيسية';

  @override
  String get navCourses => 'الدورات';

  @override
  String get navProgress => 'التقدم';

  @override
  String get navProfile => 'الملف الشخصي';

  @override
  String get learningStats => 'إحصائيات التعلم';

  @override
  String get currentStreak => 'السلسلة الحالية';

  @override
  String get longestStreak => 'أطول سلسلة';

  @override
  String get studyTime => 'وقت الدراسة';

  @override
  String get completedLessons => 'الدروس المكتملة';

  @override
  String get accountInformation => 'معلومات الحساب';

  @override
  String get appSettings => 'إعدادات التطبيق';

  @override
  String get accountActions => 'إجراءات الحساب';

  @override
  String get downloadLearningData => 'تحميل بيانات التعلم الخاصة بك';

  @override
  String get deleteAccountDescription => 'حذف حسابك نهائياً';

  @override
  String get signOutDescription => 'تسجيل الخروج من حسابك';

  @override
  String get notAvailable => 'غير متاح';

  @override
  String get memberSince => 'عضو منذ';

  @override
  String get lastLogin => 'آخر تسجيل دخول';

  @override
  String get preferredLanguage => 'اللغة المفضلة';

  @override
  String get phoneNumber => 'رقم الهاتف';

  @override
  String get bio => 'السيرة الذاتية';

  @override
  String get notifications => 'الإشعارات';

  @override
  String get sound => 'الصوت';

  @override
  String get enabled => 'مفعل';

  @override
  String get disabled => 'معطل';

  @override
  String get editProfile => 'تعديل الملف الشخصي';

  @override
  String get editProfileComingSoon => 'تعديل الملف الشخصي قريباً!';

  @override
  String errorSigningOut(String error) {
    return 'خطأ في تسجيل الخروج: $error';
  }

  @override
  String get openSettings => 'فتح الإعدادات';

  @override
  String get enableNotificationsSteps =>
      'يرجى اتباع هذه الخطوات لتفعيل الإشعارات:';

  @override
  String get openDeviceSettings => '1. افتح إعدادات الجهاز';

  @override
  String get findApps =>
      '2. ابحث عن \"التطبيقات\" أو \"Applications\" واضغط عليها';

  @override
  String get findEnglishFluency => '3. ابحث عن \"English Fluency\" واضغط عليه';

  @override
  String get tapPermissions => '4. اضغط على \"الأذونات\"';

  @override
  String get enableNotifications => '5. فعل \"الإشعارات\"';

  @override
  String dailyReminderSet(String time) {
    return 'تم تعيين التذكير اليومي للساعة $time';
  }

  @override
  String get accountType => 'نوع الحساب';

  @override
  String get admin => 'مشرف';

  @override
  String get student => 'طالب';

  @override
  String get days => 'أيام';

  @override
  String get administrator => 'مدير';

  @override
  String get fifteenMinutes => '15 دقيقة';

  @override
  String get thirtyMinutes => '30 دقيقة';

  @override
  String get fortyFiveMinutes => '45 دقيقة';

  @override
  String get sixtyMinutes => '60 دقيقة';

  @override
  String get navMessages => 'الرسائل';

  @override
  String get resumeQuizTitle => 'استئناف الاختبار؟';

  @override
  String get resumeQuizContent =>
      'لديك اختبار قيد التقدم. هل ترغب في الاستئناف؟';

  @override
  String get startOver => 'ابدأ من جديد';

  @override
  String get resume => 'استئناف';

  @override
  String get thirtySecondsWarning => '⚠️ تبقى 30 ثانية!';

  @override
  String get quizConfiguration => 'إعدادات الاختبار:';

  @override
  String get close => 'إغلاق';

  @override
  String get soundEffects => 'المؤثرات الصوتية';

  @override
  String get hapticFeedback => 'الاهتزاز';

  @override
  String get previous => 'السابق';

  @override
  String get submitQuiz => 'إرسال الاختبار';

  @override
  String get next => 'التالي';

  @override
  String get reviewAnswers => 'مراجعة الإجابات';

  @override
  String get tryAgain => 'حاول مرة أخرى';

  @override
  String get finish => 'إنهاء';

  @override
  String get lessonDetailsError => 'خطأ';

  @override
  String get lessonNotFound => 'الدرس غير موجود';

  @override
  String get loadingLesson => 'جاري تحميل الدرس...';

  @override
  String errorLoadingTasks(String error) {
    return 'خطأ في تحميل المهام: $error';
  }

  @override
  String questions(int count) {
    return '$count أسئلة';
  }

  @override
  String resource(int number) {
    return 'المورد $number';
  }

  @override
  String get askQuestionAboutLesson => 'اطرح سؤالاً حول هذا الدرس';

  @override
  String get typeYourQuestionHere => 'اكتب سؤالك هنا...';

  @override
  String get sending => 'جاري الإرسال...';

  @override
  String get send => 'إرسال';

  @override
  String get mustBeSignedInToAsk => 'يجب عليك تسجيل الدخول لطرح سؤال.';

  @override
  String get noAdminAvailable => 'لا يوجد مدير متاح لاستقبال سؤالك.';

  @override
  String get questionSentToAdmins => 'تم إرسال سؤالك إلى المدراء!';

  @override
  String get created => 'تم الإنشاء';

  @override
  String get updated => 'تم التحديث';

  @override
  String get author => 'الكاتب';

  @override
  String get discussion => 'النقاش';

  @override
  String get task => 'المهمة';

  @override
  String get estimatedTime => 'الوقت المقدر';

  @override
  String get incompleteTasks => 'المهام غير المكتملة';

  @override
  String get noRecentActivities => 'لا توجد أنشطة حديثة';

  @override
  String get noIncompleteTasks => 'لا توجد مهام غير مكتملة';

  @override
  String get allTasksCompleted => 'تم إكمال جميع المهام! عمل رائع!';

  @override
  String get startLearningToSeeActivities => 'ابدأ التعلم لرؤية أنشطتك هنا';

  @override
  String get notificationSettings => 'إعدادات الإشعارات';

  @override
  String get stayMotivated => 'ابق متحمساً';

  @override
  String get notificationSettingsDescription =>
      'قم بتكوين الإشعارات للحفاظ على استمرارية التعلم والبقاء محدثاً بالمحتوى الجديد.';

  @override
  String get dailyLearningReminders => 'تذكيرات التعلم اليومية';

  @override
  String get dailyRemindersDescription => 'احصل على تذكير للممارسة كل يوم';

  @override
  String get reminderTime => 'وقت التذكير';

  @override
  String get dailyChallenges => 'التحديات اليومية';

  @override
  String get dailyChallengesDescription => 'احصل على تحديات تعلم يومية';

  @override
  String get challengeTime => 'وقت التحدي';

  @override
  String get achievementsAndStreaks => 'الإنجازات والاستمرارية';

  @override
  String get achievementsDescription => 'احتفل بمعالم تعلمك';

  @override
  String get newContent => 'محتوى جديد';

  @override
  String get newContentDescription =>
      'احصل على إشعارات حول الكلمات والدروس الجديدة';

  @override
  String get streakReminders => 'تذكيرات الاستمرارية';

  @override
  String get streakRemindersDescription =>
      'تحذيرات عندما تكون استمراريتك في خطر';

  @override
  String get testNotifications => 'اختبار الإشعارات';

  @override
  String get testNotificationsDescription =>
      'أرسل إشعارات اختبار للتأكد من أن كل شيء يعمل بشكل صحيح.';

  @override
  String get dailyReminder => 'تذكير يومي';

  @override
  String get achievement => 'إنجاز';

  @override
  String get challenge => 'تحدي';

  @override
  String get manageAllNotifications => 'إدارة جميع الإشعارات';

  @override
  String get dailyLearningReminderTitle => 'تذكير التعلم اليومي';

  @override
  String get dailyLearningReminderDescription =>
      'حان وقت ممارسة اللغة اليومية! حافظ على استمراريتك.';

  @override
  String get achievementUnlockedTitle => 'تم فتح الإنجاز! 🏆';

  @override
  String get achievementUnlockedDescription =>
      'تهانينا! لقد أكملت 7 أيام متتالية. تم كسب شارة سيد الاستمرارية!';

  @override
  String get newVocabularyTitle => 'مفردات جديدة متاحة';

  @override
  String get newVocabularyDescription =>
      'تم إضافة 25 كلمة إنجليزية تجارية جديدة إلى دورتك.';

  @override
  String get dailyChallengeTitle => 'التحدي اليومي جاهز';

  @override
  String get dailyChallengeDescription =>
      'تحدي اليوم: مارس النطق لمدة 10 دقائق!';

  @override
  String get streakWarningTitle => 'تحذير الاستمرارية ⚠️';

  @override
  String get streakWarningDescription =>
      'لا تفقد استمراريتك لمدة 5 أيام! لديك 3 ساعات متبقية للممارسة.';

  @override
  String get lessonCompletedTitle => 'تم إكمال الدرس';

  @override
  String get lessonCompletedDescription =>
      'عمل رائع! لقد أكملت درس \"المحادثات الأساسية\".';

  @override
  String get weeklyProgressReportTitle => 'تقرير التقدم الأسبوعي';

  @override
  String get weeklyProgressReportDescription =>
      'لقد درست لمدة 3.5 ساعة هذا الأسبوع. استمر في العمل الرائع!';

  @override
  String get notificationDeleted => 'تم حذف الإشعار';

  @override
  String get allNotificationsMarkedAsRead => 'تم تحديد جميع الإشعارات كمقروءة';

  @override
  String get clearAllNotificationsDialogTitle => 'مسح جميع الإشعارات';

  @override
  String get clearAllNotificationsDialogContent =>
      'هل أنت متأكد من أنك تريد حذف جميع الإشعارات؟ لا يمكن التراجع عن هذا الإجراء.';

  @override
  String get clearAllNotifications => 'تم مسح جميع الإشعارات';

  @override
  String get clearAll => 'مسح الكل';

  @override
  String get markAllAsRead => 'تحديد الكل كمقروء';

  @override
  String get loadingNotifications => 'جاري تحميل الإشعارات...';

  @override
  String get noNotifications => 'لا توجد إشعارات';

  @override
  String get noNotificationsDescription =>
      'أنت محدث بالكامل! تحقق لاحقاً للحصول على تحديثات وإنجازات جديدة.';

  @override
  String unreadNotifications(int count) {
    return '$count إشعارات غير مقروءة';
  }

  @override
  String get justNow => 'الآن';

  @override
  String minutesAgo(int minutes) {
    return 'منذ $minutes دقيقة';
  }

  @override
  String hoursAgo(int hours) {
    return 'منذ $hours ساعة';
  }

  @override
  String daysAgo(int days) {
    return 'منذ $days يوم';
  }

  @override
  String get openingLessons => 'جاري فتح الدروس...';

  @override
  String get openingAchievements => 'جاري فتح الإنجازات...';

  @override
  String get openingNewContent => 'جاري فتح المحتوى الجديد...';

  @override
  String get openingChallenges => 'جاري فتح التحديات...';

  @override
  String get openingPractice => 'جاري فتح الممارسة...';

  @override
  String get openingProgress => 'جاري فتح التقدم...';

  @override
  String get openingAnalytics => 'جاري فتح التحليلات...';

  @override
  String get setVocabularyGoal => 'تعيين هدف المفردات';

  @override
  String get vocabularyGoalTitle => 'حدد هدف المفردات اليومي';

  @override
  String get vocabularyGoalDescription =>
      'اختر عدد الكلمات الجديدة التي تريد تعلمها كل يوم. هذا سيساعدك على البقاء متحمساً وتتبع تقدمك.';

  @override
  String get chooseGoalPreset => 'اختر هدفاً مسبق التحديد';

  @override
  String get customTarget => 'هدف مخصص';

  @override
  String get enterCustomTarget => 'أدخل الهدف المخصص';

  @override
  String get customTargetHint => 'مثال: 20';

  @override
  String get wordsPerDay => 'كلمات/يوم';

  @override
  String get updateGoal => 'تحديث الهدف';

  @override
  String get setGoal => 'تحديد الهدف';

  @override
  String get deleteGoal => 'حذف الهدف';

  @override
  String get currentGoal => 'الهدف الحالي';

  @override
  String get dailyTarget => 'الهدف اليومي';

  @override
  String get words => 'كلمات';

  @override
  String get progress => 'التقدم';

  @override
  String get goalCompleted => 'تم إكمال الهدف لليوم! 🎉';

  @override
  String remainingWords(int count) {
    return '$count كلمة متبقية';
  }

  @override
  String get invalidTarget => 'يرجى إدخال رقم صحيح أكبر من 0';

  @override
  String get goalSetSuccessfully => 'تم تعيين هدف المفردات بنجاح!';

  @override
  String get deleteGoalConfirmation =>
      'هل أنت متأكد من أنك تريد حذف هدف المفردات؟ لا يمكن التراجع عن هذا الإجراء.';

  @override
  String get delete => 'حذف';

  @override
  String get goalDeleted => 'تم حذف هدف المفردات';

  @override
  String get loadingGoal => 'جاري تحميل الهدف...';

  @override
  String get noVocabularyGoal => 'لم يتم تعيين هدف للمفردات';

  @override
  String get setGoalToTrackProgress =>
      'حدد هدفاً يومياً للمفردات لتتبع تقدم تعلمك والبقاء متحمساً.';

  @override
  String get dailyVocabularyGoal => 'هدف المفردات اليومي';

  @override
  String get editGoal => 'تعديل الهدف';

  @override
  String get learnWords => 'تعلم الكلمات';

  @override
  String get addWords => 'إضافة كلمات';

  @override
  String get congratulationsGoalCompleted =>
      'تهانينا! لقد أكملت هدف المفردات اليومي! 🎉';

  @override
  String get addWordsManually => 'إضافة كلمات يدوياً';

  @override
  String get howManyWordsLearned => 'كم كلمة تعلمت اليوم؟';

  @override
  String get numberOfWords => 'عدد الكلمات';

  @override
  String get add => 'إضافة';

  @override
  String get noVocabularyProgress => 'لا يوجد تقدم في المفردات بعد';

  @override
  String get startLearningWords => 'ابدأ تعلم الكلمات لرؤية تقدمك هنا';

  @override
  String get vocabularyProgress => 'تقدم المفردات';

  @override
  String get totalWords => 'إجمالي الكلمات';

  @override
  String get accuracy => 'الدقة';

  @override
  String get favorites => 'المفضلة';

  @override
  String get noPronunciationPractice => 'لا يوجد تدريب على النطق بعد';

  @override
  String get startPracticingPronunciation =>
      'ابدأ ممارسة النطق لرؤية تقدمك هنا';

  @override
  String get pronunciationProgress => 'تقدم النطق';

  @override
  String get totalAttempts => 'إجمالي المحاولات';

  @override
  String get successRate => 'معدل النجاح';

  @override
  String get avgAccuracy => 'متوسط الدقة';

  @override
  String get bestAccuracy => 'أفضل دقة';

  @override
  String get avgConfidence => 'متوسط الثقة';

  @override
  String get wordsPracticed => 'الكلمات التي تم التدرب عليها';

  @override
  String get recentPractice => 'التدريب الأخير';

  @override
  String get recentActivity => 'النشاط الأخير';

  @override
  String get recentActivities => 'الأنشطة الأخيرة';

  @override
  String get needsPractice => 'يحتاج إلى ممارسة';

  @override
  String get yourGoals => 'أهدافك';

  @override
  String get courseProgress => 'تقدم الدورة';

  @override
  String get allTime => 'كل الوقت';

  @override
  String get thisWeek => 'هذا الأسبوع';

  @override
  String get thisMonth => 'هذا الشهر';

  @override
  String get last30Days => 'آخر 30 يومًا';

  @override
  String get pleaseSignInToViewProgress => 'يرجى تسجيل الدخول لعرض تقدمك';

  @override
  String get learningProgress => 'تقدم التعلم';

  @override
  String get vocabularyAndPronunciation => 'المفردات والنطق';

  @override
  String get completed => 'مكتمل';

  @override
  String get dailyStudy => 'الدراسة اليومية';

  @override
  String get lessonsCompleted => 'الدروس المكتملة';

  @override
  String get firstLesson => 'أول درس';

  @override
  String get completedFirstLesson => 'أكملت أول درس لك!';

  @override
  String get threeDayStreak => 'سلسلة 3 أيام';

  @override
  String get studiedThreeDays => 'درست 3 أيام متتالية!';

  @override
  String get keepUpGreatWork => 'واصل العمل الرائع! أنت تحقق تقدمًا ممتازًا.';

  @override
  String get learningAnalytics => 'تحليلات التعلم';

  @override
  String get timeRange => 'النطاق الزمني';

  @override
  String get category => 'الفئة';

  @override
  String get vocabularyWords => 'كلمات المفردات';

  @override
  String get pronunciationAttempts => 'محاولات النطق';

  @override
  String get vocabularyAccuracy => 'دقة المفردات';

  @override
  String get pronunciationAccuracy => 'دقة النطق';

  @override
  String get progressTrends => 'اتجاهات التقدم';

  @override
  String get vocabVsPronunciation => 'تقدم المفردات مقابل النطق';

  @override
  String get firstAttempt => 'أول محاولة';

  @override
  String get lastAttempt => 'آخر محاولة';

  @override
  String get commonMistakes => 'الأخطاء الشائعة';

  @override
  String get wordFrequency => 'تكرار الكلمة';

  @override
  String get good => 'جيد';

  @override
  String get attempts => 'محاولات';

  @override
  String get success => 'نجاح';

  @override
  String get greatJob => 'عمل رائع!';

  @override
  String get youveBeenLearningForAnother10MinutesKeepItUp =>
      'لقد كنت تتعلم لمدة 10 دقائق إضافية! واصل العمل الجيد! 🎉';

  @override
  String get thanks => 'شكرًا!';

  @override
  String get goalAchieved => 'تم تحقيق الهدف!';

  @override
  String get congratulationsYouHaveReachedYourDailyVocabularyGoalWouldYouLikeToSetANewOne =>
      'تهانينا! لقد وصلت إلى هدفك اليومي في المفردات. هل ترغب في تعيين هدف جديد؟';

  @override
  String get notNow => 'ليس الآن';

  @override
  String get setNewGoal => 'تعيين هدف جديد';

  @override
  String get failedToUpdateFavoriteStatus => 'فشل في تحديث حالة المفضلة';

  @override
  String get addedToFavorites => 'تمت الإضافة إلى المفضلة!';

  @override
  String get removedFromFavorites => 'تمت الإزالة من المفضلة';

  @override
  String get progressTrackingTemporarilyUnavailable =>
      'تتبع التقدم غير متوفر مؤقتًا';

  @override
  String get vocabularyProgressTestSuccessfulCheckConsoleForDetails =>
      'تم اختبار تقدم المفردات بنجاح! تحقق من التفاصيل في وحدة التحكم.';

  @override
  String get vocabularyProgressTestFailed => 'فشل اختبار تقدم المفردات';

  @override
  String get wordPronunciationPractice => 'تدريب نطق الكلمة';

  @override
  String get unableToLoadPronunciationPractice => 'تعذر تحميل تدريب النطق';

  @override
  String get pleaseTryAgainLater => 'يرجى المحاولة لاحقًا.';

  @override
  String get noExampleSentenceAvailableForThisWord =>
      'لا توجد جملة مثال لهذه الكلمة.';

  @override
  String get sentencePronunciationPractice => 'تدريب نطق الجملة';

  @override
  String get exampleSentenceFor => 'جملة مثال لـ';

  @override
  String get unableToLoadSentencePronunciationPractice =>
      'تعذر تحميل تدريب نطق الجملة';

  @override
  String get awesome => 'رائع! 🎉';

  @override
  String get greatPronunciationKeepPracticingAndYoullMasterThisWord =>
      'نطق رائع! استمر في التدريب وستتقن هذه الكلمة.';

  @override
  String get yourBestAccuracy => 'أفضل دقة لديك:';

  @override
  String get average => 'المتوسط';

  @override
  String get nextWord => 'الكلمة التالية';

  @override
  String get excellent => 'ممتاز! 🎊';

  @override
  String get greatSentencePronunciationKeepPracticingAndYoullSoundLikeANative =>
      'نطق جملة رائع! استمر في التدريب وستنطق كأنك متحدث أصلي.';

  @override
  String get learningSessionInProgress => 'جلسة التعلم جارية 📚';

  @override
  String get currentWord => 'الكلمة الحالية';

  @override
  String get timeToPracticeYourVocabularyKeepYourLearningStreakAlive =>
      'حان وقت ممارسة المفردات! حافظ على سلسلة تعلمك.';

  @override
  String get learningSessionStartedCheckYourNotifications =>
      'تم بدء جلسة التعلم! تحقق من الإشعارات.';

  @override
  String get vocabularyBuilder => 'بناء المفردات';

  @override
  String get testFirebaseConnection => 'اختبار اتصال Firebase';

  @override
  String get search => 'بحث';

  @override
  String get toggleFavorite => 'تبديل المفضلة';

  @override
  String get searchWordsOrMeanings => 'ابحث عن كلمات أو معانٍ...';

  @override
  String get setYourDailyVocabularyGoal => 'حدد هدفك اليومي للمفردات';

  @override
  String get trackYourProgressAndStayMotivatedBySettingADailyVocabularyGoal =>
      'تابع تقدمك وابقَ متحفزًا بتحديد هدف يومي للمفردات.';

  @override
  String get todaysGoal => 'هدف اليوم';

  @override
  String get practicePronunciation => 'تدريب النطق';

  @override
  String get meaning => 'المعنى';

  @override
  String get wordPracticed => 'تمت ممارسة الكلمة';

  @override
  String get practiceWord => 'تدريب الكلمة';

  @override
  String get example => 'مثال';

  @override
  String get sentencePracticed => 'تمت ممارسة الجملة';

  @override
  String get practiceSentence => 'تدريب الجملة';

  @override
  String get exampleMeaning => 'معنى المثال';

  @override
  String get usageFrequency => 'تكرار الاستخدام';

  @override
  String get random => 'عشوائي';

  @override
  String get hide => 'إخفاء';

  @override
  String get reveal => 'إظهار';

  @override
  String get veryCommonlyUsedInEverydayEnglish =>
      'شائع جدًا في الإنجليزية اليومية';

  @override
  String get frequentlyUsedInEnglish => 'يستخدم كثيرًا في الإنجليزية';

  @override
  String get moderatelyUsedInEnglish => 'يستخدم بشكل متوسط في الإنجليزية';

  @override
  String get occasionallyUsedInEnglish => 'يستخدم أحيانًا في الإنجليزية';

  @override
  String get rarelyUsedInEnglish => 'نادراً ما يستخدم في الإنجليزية';

  @override
  String get yourProgress => 'تقدمك';

  @override
  String get views => 'المشاهدات';

  @override
  String get correct => 'صحيح';

  @override
  String get common => 'شائع';

  @override
  String get uncommon => 'غير شائع';

  @override
  String get veryCommon => 'شائع جدًا';

  @override
  String get rare => 'نادر';

  @override
  String get viewed => 'تمت المشاهدة';

  @override
  String get correctAnswers => 'الإجابات الصحيحة';

  @override
  String get microphonePermissionRequired =>
      'مطلوب إذن الميكروفون للتعرف على الكلام.';

  @override
  String get speechRecognitionNotAvailable =>
      'التعرف على الكلام غير متوفر. يرجى التحقق من أذونات الميكروفون.';

  @override
  String get failedToStartListening =>
      'فشل في بدء الاستماع. يرجى المحاولة مرة أخرى.';

  @override
  String get errorStartingSpeechRecognition =>
      'حدث خطأ أثناء بدء التعرف على الكلام.';

  @override
  String get errorEvaluatingPronunciation =>
      'حدث خطأ أثناء تقييم النطق. يرجى المحاولة مرة أخرى.';

  @override
  String get perfectSentencePronunciation => 'نطق الجملة مثالي! طلاقة ممتازة!';

  @override
  String get greatSentencePronunciation => 'نطق الجملة رائع! تدفق طبيعي جدًا.';

  @override
  String get goodSentencePronunciation =>
      'نطق جيد للجملة! استمر في التدريب لتحسين الطلاقة.';

  @override
  String get notQuiteRight =>
      'ليس صحيحًا تمامًا. استمع للجملة مرة أخرى وتدرب على الإيقاع.';

  @override
  String get poor => 'ضعيف';

  @override
  String get veryHigh => 'مرتفع جدًا';

  @override
  String get high => 'مرتفع';

  @override
  String get medium => 'متوسط';

  @override
  String get practiceThisSentence => 'تدرب على هذه الجملة';

  @override
  String get listening => 'يستمع...';

  @override
  String get readyToListen => 'جاهز للاستماع';

  @override
  String get youSaid => 'قلت:';

  @override
  String get startSpeakingToSeeYourWordsHere =>
      'ابدأ التحدث لترى كلماتك هنا...';

  @override
  String get liveTranscription => 'نسخ مباشر';

  @override
  String get stop => 'إيقاف';

  @override
  String get startSpeaking => 'ابدأ التحدث';

  @override
  String get similarity => 'التشابه';

  @override
  String get confidence => 'الثقة';

  @override
  String get continueText => 'استمر';

  @override
  String get newWords => 'كلمات جديدة';

  @override
  String get goal => 'الهدف';

  @override
  String get remaining => 'المتبقي';
}
