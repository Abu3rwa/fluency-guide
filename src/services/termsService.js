import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Service for managing terms and conditions content
 * Supports multilingual content with admin controls
 */
class TermsService {
  
  /**
   * Get terms content by type and language
   * @param {string} type - Terms type (e.g., 'private-sessions', 'general')
   * @param {string} language - Language code ('en' or 'ar')
   * @returns {Promise<Object|null>} Terms document with content
   */
  async getTerms(type = 'private-sessions', language = 'en') {
    try {
      const termsRef = doc(db, 'terms', `${type}_${language}`);
      const termsSnap = await getDoc(termsRef);
      
      if (termsSnap.exists()) {
        return {
          id: termsSnap.id,
          ...termsSnap.data()
        };
      }
      
      // Return fallback content if no custom terms exist
      return this.getDefaultTerms(type, language);
    } catch (error) {
      console.error('Error fetching terms:', error);
      throw new Error('Failed to load terms content');
    }
  }

  /**
   * Save or update terms content (admin only)
   * @param {string} type - Terms type
   * @param {string} language - Language code
   * @param {string} content - Terms content (markdown or plain text)
   * @param {string} adminId - Admin user ID
   * @returns {Promise<void>}
   */
  async saveTerms(type, language, content, adminId) {
    try {
      const termsRef = doc(db, 'terms', `${type}_${language}`);
      const timestamp = new Date();
      
      await setDoc(termsRef, {
        type,
        language,
        content,
        lastModified: timestamp,
        modifiedBy: adminId,
        version: timestamp.getTime() // Simple versioning
      });
    } catch (error) {
      console.error('Error saving terms:', error);
      throw new Error('Failed to save terms content');
    }
  }

  /**
   * Delete terms content (admin only)
   * @param {string} type - Terms type
   * @param {string} language - Language code
   * @returns {Promise<void>}
   */
  async deleteTerms(type, language) {
    try {
      const termsRef = doc(db, 'terms', `${type}_${language}`);
      await deleteDoc(termsRef);
    } catch (error) {
      console.error('Error deleting terms:', error);
      throw new Error('Failed to delete terms content');
    }
  }

  /**
   * Get all terms for management (admin only)
   * @returns {Promise<Array>} Array of all terms documents
   */
  async getAllTerms() {
    try {
      const termsCollection = collection(db, 'terms');
      const termsQuery = query(termsCollection);
      const querySnapshot = await getDocs(termsQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching all terms:', error);
      throw new Error('Failed to load terms list');
    }
  }

  /**
   * Get default terms content when no custom content exists
   * @param {string} type - Terms type
   * @param {string} language - Language code
   * @returns {Object} Default terms object
   */
  getDefaultTerms(type, language) {
    const defaultContent = {
      en: {
        'private-sessions': `# Private Sessions Terms of Service

## 1. Introduction
Welcome to Sudanglish Private Sessions! These terms govern your use of our private session booking services.

## 2. Booking and Cancellation
- Sessions must be booked at least 24 hours in advance
- Cancellations must be made at least 12 hours before the session
- Late cancellations may incur fees

## 3. Payment Terms
- Payment is required at the time of booking
- Refunds for cancellations follow our cancellation policy
- Prices are subject to change with notice

## 4. Instructor Responsibilities
- Instructors will arrive on time for scheduled sessions
- Sessions will be conducted professionally
- Make-up sessions may be offered for instructor cancellations

## 5. Student Responsibilities
- Arrive on time for scheduled sessions
- Have necessary materials ready
- Provide respectful learning environment

## 6. Technical Requirements
- Stable internet connection required
- Compatible device for video conferencing
- Backup communication method recommended

## 7. Privacy and Data
- Session recordings may be made for quality purposes
- Personal information is protected per our Privacy Policy
- Student progress may be tracked for improvement

## 8. Limitation of Liability
- Services provided "as is"
- No guarantee of specific learning outcomes
- Liability limited to session fees paid

## 9. Contact Information
For questions about these terms, contact support@sudanglish.com

*Last Updated: ${new Date().toLocaleDateString()}*
*Version: 1.0*`,
        'general': `# General Terms of Service

## 1. Acceptance of Terms
By using Sudanglish services, you agree to these terms.

## 2. User Accounts
- Accurate information required for registration
- Users responsible for account security
- One account per person

## 3. Service Usage
- Services for educational purposes only
- Prohibited activities include harassment, spam, or illegal content
- We reserve the right to suspend accounts for violations

## 4. Intellectual Property
- Course content is proprietary to Sudanglish
- Users may not redistribute or resell content
- User-generated content may be used by Sudanglish

## 5. Payments and Refunds
- All payments processed securely
- Refund policy varies by service type
- Pricing subject to change with notice

## 6. Privacy
- We collect and use data as described in our Privacy Policy
- User data is protected and not sold to third parties
- Cookies and tracking technologies may be used

## 7. Limitation of Liability
- Services provided "as is"
- No warranties beyond those required by law
- Liability limited to amounts paid for services

## 8. Termination
- Either party may terminate account with notice
- Upon termination, access to services ends
- Some data may be retained as required by law

## 9. Governing Law
These terms are governed by applicable laws.

## 10. Changes to Terms
We may update these terms with notice to users.

*Last Updated: ${new Date().toLocaleDateString()}*`
      },
      ar: {
        'private-sessions': `# شروط خدمة الجلسات الخاصة

## 1. مقدمة
مرحباً بكم في جلسات Sudanglish الخاصة! تحكم هذه الشروط استخدامكم لخدمات حجز الجلسات الخاصة.

## 2. الحجز والإلغاء
- يجب حجز الجلسات قبل 24 ساعة على الأقل
- يجب إلغاء الحجوزات قبل 12 ساعة على الأقل من الجلسة
- قد تطبق رسوم على الإلغاءات المتأخرة

## 3. شروط الدفع
- الدفع مطلوب وقت الحجز
- المبالغ المستردة للإلغاءات تتبع سياسة الإلغاء
- الأسعار قابلة للتغيير مع الإشعار

## 4. مسؤوليات المدرب
- سيصل المدربون في الوقت المحدد للجلسات
- ستُجرى الجلسات بطريقة مهنية
- قد تُقدم جلسات تعويضية لإلغاءات المدرب

## 5. مسؤوليات الطالب
- الوصول في الوقت المحدد للجلسات
- إعداد المواد اللازمة
- توفير بيئة تعلم محترمة

## 6. المتطلبات التقنية
- اتصال إنترنت مستقر مطلوب
- جهاز متوافق لمؤتمرات الفيديو
- يُنصح بوجود وسيلة اتصال احتياطية

## 7. الخصوصية والبيانات
- قد يتم تسجيل الجلسات لأغراض الجودة
- المعلومات الشخصية محمية حسب سياسة الخصوصية
- قد يتم تتبع تقدم الطالب للتحسين

## 8. حدود المسؤولية
- الخدمات مقدمة "كما هي"
- لا ضمان لنتائج تعلم محددة
- المسؤولية محدودة برسوم الجلسات المدفوعة

## 9. معلومات الاتصال
للأسئلة حول هذه الشروط، اتصل بـ support@sudanglish.com

*آخر تحديث: ${new Date().toLocaleDateString('ar')}*
*الإصدار: 1.0*`,
        'general': `# الشروط العامة للخدمة

## 1. قبول الشروط
باستخدام خدمات Sudanglish، فإنك توافق على هذه الشروط.

## 2. حسابات المستخدمين
- معلومات دقيقة مطلوبة للتسجيل
- المستخدمون مسؤولون عن أمان الحساب
- حساب واحد لكل شخص

## 3. استخدام الخدمة
- الخدمات للأغراض التعليمية فقط
- الأنشطة المحظورة تشمل المضايقة والرسائل غير المرغوبة أو المحتوى غير القانوني
- نحتفظ بالحق في تعليق الحسابات للانتهاكات

## 4. الملكية الفكرية
- محتوى الدورات ملكية خاصة لـ Sudanglish
- لا يجوز للمستخدمين إعادة توزيع أو إعادة بيع المحتوى
- قد يستخدم Sudanglish المحتوى الذي ينشئه المستخدم

## 5. المدفوعات والمبالغ المستردة
- جميع المدفوعات تتم بشكل آمن
- سياسة الاسترداد تختلف حسب نوع الخدمة
- الأسعار قابلة للتغيير مع الإشعار

## 6. الخصوصية
- نجمع ونستخدم البيانات كما هو موضح في سياسة الخصوصية
- بيانات المستخدم محمية ولا تُباع لأطراف ثالثة
- قد تُستخدم ملفات تعريف الارتباط وتقنيات التتبع

## 7. حدود المسؤولية
- الخدمات مقدمة "كما هي"
- لا ضمانات تتجاوز ما يتطلبه القانون
- المسؤولية محدودة بالمبالغ المدفوعة للخدمات

## 8. الإنهاء
- قد ينهي أي طرف الحساب مع الإشعار
- عند الإنهاء، ينتهي الوصول للخدمات
- قد تُحتفظ ببعض البيانات كما يتطلب القانون

## 9. القانون الحاكم
تحكم هذه الشروط القوانين المعمول بها.

## 10. تغييرات الشروط
قد نحدث هذه الشروط مع إشعار المستخدمين.

*آخر تحديث: ${new Date().toLocaleDateString('ar')}*`
      }
    };

    return {
      id: `${type}_${language}_default`,
      type,
      language,
      content: defaultContent[language]?.[type] || defaultContent.en[type] || 'Terms content not available.',
      isDefault: true,
      lastModified: new Date(),
      version: 1
    };
  }
}

export default new TermsService();