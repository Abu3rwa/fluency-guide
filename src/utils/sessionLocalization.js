/**
 * Utility functions for session localization
 */

import { useTranslation } from 'react-i18next';

/**
 * Get localized text based on current language
 * @param {Object|string} textObj - Localized text object or string
 * @param {string} fallback - Fallback text if no localization found
 * @returns {string} Localized text
 */
export const getLocalizedText = (textObj, fallback = '', currentLang = 'ar') => {
  if (!textObj) return fallback;
  if (typeof textObj === 'string') return textObj;
  
  return textObj[currentLang] || textObj.ar || textObj.en || fallback;
};

/**
 * Safely extract session type name as string for searching/sorting
 * @param {Object} sessionType - Session type object
 * @param {string} currentLang - Current language code
 * @returns {string} Session type name as string
 */
export const getSessionTypeNameString = (sessionType, currentLang = 'ar') => {
  if (!sessionType || !sessionType.name) return '';
  
  // Handle legacy string format (from sample data)
  if (typeof sessionType.name === 'string') return sessionType.name;
  
  // Handle i18n object format (primary format)
  if (typeof sessionType.name === 'object') {
    return sessionType.name[currentLang] || sessionType.name.ar || sessionType.name.en || '';
  }
  
  return '';
};

/**
 * Hook to get localized session type data
 * @returns {Object} Helper functions for session localization
 */
export const useSessionLocalization = () => {
  const { i18n } = useTranslation();
  
  const getLocalizedSessionType = (sessionType) => {
    if (!sessionType) return null;
    
    const currentLang = i18n.language || 'ar';
    
    return {
      ...sessionType,
      displayName: getLocalizedText(sessionType.name, 'Unnamed Session Type', currentLang),
      displayDescription: getLocalizedText(sessionType.description, '', currentLang)
    };
  };
  
  const getLocalizedSessionTypes = (sessionTypes) => {
    return sessionTypes.map(getLocalizedSessionType);
  };
  
  return {
    getLocalizedText: (textObj, fallback = '') => getLocalizedText(textObj, fallback, i18n.language || 'ar'),
    getLocalizedSessionType,
    getLocalizedSessionTypes,
    currentLanguage: i18n.language || 'ar'
  };
};

/**
 * Process session type for display with localized content
 * @param {Object} sessionType - Session type object
 * @param {string} currentLang - Current language code
 * @returns {Object} Session type with display properties
 */
export const processSessionTypeForDisplay = (sessionType, currentLang = 'ar') => {
  if (!sessionType) return null;
  
  return {
    ...sessionType,
    displayName: getLocalizedText(sessionType.name, 'Unnamed Session Type', currentLang),
    displayDescription: getLocalizedText(sessionType.description, '', currentLang)
  };
};