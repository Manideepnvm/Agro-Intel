import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const LanguageContext = createContext();

const translations = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      marketplace: 'Marketplace',
      analytics: 'Analytics',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout'
    },
    profile: {
      title: 'Profile Settings',
      basicInfo: 'Basic Info',
      language: 'Language',
      agriculture: 'Agriculture',
      business: 'Business',
      preferences: 'Preferences',
      security: 'Security',
      save: 'Save',
      edit: 'Edit',
      cancel: 'Cancel'
    }
  },
  hi: {
    nav: {
      dashboard: 'डैशबोर्ड',
      marketplace: 'मार्केटप्लेस',
      analytics: 'विश्लेषण',
      profile: 'प्रोफ़ाइल',
      settings: 'सेटिंग्स',
      logout: 'लॉग आउट'
    },
    profile: {
      title: 'प्रोफ़ाइल सेटिंग्स',
      basicInfo: 'मूल जानकारी',
      language: 'भाषा',
      agriculture: 'कृषि',
      business: 'व्यवसाय',
      preferences: 'प्राथमिकताएं',
      security: 'सुरक्षा',
      save: 'सहेजें',
      edit: 'संपादित करें',
      cancel: 'रद्द करें'
    }
  },
  te: {
    nav: {
      dashboard: 'డాష్‌బోర్డ్',
      marketplace: 'మార్కెట్‌ప్లేస్',
      analytics: 'విశ్లేషణలు',
      profile: 'ప్రొఫైల్',
      settings: 'సెట్టింగ్‌లు',
      logout: 'లాగ్ అవుట్'
    },
    profile: {
      title: 'ప్రొఫైల్ సెట్టింగ్‌లు',
      basicInfo: 'ప్రాథమిక సమాచారం',
      language: 'భాష',
      agriculture: 'వ్యవసాయం',
      business: 'వ్యాపారం',
      preferences: 'ప్రాధాన్యతలు',
      security: 'భద్రత',
      save: 'సేవ్ చేయండి',
      edit: 'సవరించండి',
      cancel: 'రద్దు చేయండి'
    }
  },
  ta: {
    nav: {
      dashboard: 'டாஷ்போர்டு',
      marketplace: 'சந்தை',
      analytics: 'விசாரணை',
      profile: 'சுயவிவரம்',
      settings: 'அமைப்புகள்',
      logout: 'வெளியேறு'
    },
    profile: {
      title: 'சுயவிவர அமைப்புகள்',
      basicInfo: 'அடிப்படை தகவல்',
      language: 'மொழி',
      agriculture: 'விவசாயம்',
      business: 'வணிகம்',
      preferences: 'முன்னுரிமைகள்',
      security: 'பாதுகாப்பு',
      save: 'சேமிக்க',
      edit: 'திருத்து',
      cancel: 'ரத்து செய்'
    }
  },
  kn: {
    nav: {
      dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      marketplace: 'ಮಾರುಕಟ್ಟೆ',
      analytics: 'ವಿಶ್ಲೇಷಣೆ',
      profile: 'ಪ್ರೊಫೈಲ್',
      settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
      logout: 'ನಿರ್ಗಮಿಸಿ'
    },
    profile: {
      title: 'ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
      basicInfo: 'ಮೂಲ ಮಾಹಿತಿ',
      language: 'ಭಾಷೆ',
      agriculture: 'ಕೃಷಿ',
      business: 'ವ್ಯಾಪಾರ',
      preferences: 'ಆದ್ಯತೆಗಳು',
      security: 'ಭದ್ರತೆ',
      save: 'ಉಳಿಸಿ',
      edit: 'ತಿದ್ದು',
      cancel: 'ರದ್ದು ಮಾಡಿ'
    }
  },
  ml: {
    nav: {
      dashboard: 'ഡാഷ്ബോർഡ്',
      marketplace: 'മാർക്കറ്റ്‌പ്ലേസ്',
      analytics: 'വിശകലനം',
      profile: 'പ്രൊഫൈൽ',
      settings: 'ക്രമീകരണങ്ങൾ',
      logout: 'ലോഗ് ഔട്ട്'
    },
    profile: {
      title: 'പ്രൊഫൈൽ ക്രമീകരണങ്ങൾ',
      basicInfo: 'അടിസ്ഥാന വിവരം',
      language: 'ഭാഷ',
      agriculture: 'കൃഷി',
      business: 'ബിസിനസ്',
      preferences: 'മുൻഗണനകൾ',
      security: 'സുരക്ഷ',
      save: 'സംരക്ഷിക്കുക',
      edit: 'തിരുത്തുക',
      cancel: 'റദ്ദാക്കുക'
    }
  },
  mr: {
    nav: {
      dashboard: 'डॅशबोर्ड',
      marketplace: 'मार्केटप्लेस',
      analytics: 'विश्लेषण',
      profile: 'प्रोफाइल',
      settings: 'सेटिंग्स',
      logout: 'बाहेर पडा'
    },
    profile: {
      title: 'प्रोफाइल सेटिंग्ज',
      basicInfo: 'मूलभूत माहिती',
      language: 'भाषा',
      agriculture: 'कृषी',
      business: 'व्यवसाय',
      preferences: 'प्राधान्ये',
      security: 'सुरक्षा',
      save: 'साठवा',
      edit: 'संपादित करा',
      cancel: 'रद्द करा'
    }
  },
  gu: {
    nav: {
      dashboard: 'ડેશબોર્ડ',
      marketplace: 'માર્કેટપ્લેસ',
      analytics: 'વિશ્લેષણ',
      profile: 'પ્રોફાઇલ',
      settings: 'સેટિંગ્સ',
      logout: 'લૉગઆઉટ'
    },
    profile: {
      title: 'પ્રોફાઇલ સેટિંગ્સ',
      basicInfo: 'મૂળભૂત માહિતી',
      language: 'ભાષા',
      agriculture: 'કૃષિ',
      business: 'વ્યવસાય',
      preferences: 'પસંદગીઓ',
      security: 'સુરક્ષા',
      save: 'સાચવો',
      edit: 'ફેરફાર કરો',
      cancel: 'રદ કરો'
    }
  },
  bn: {
    nav: {
      dashboard: 'ড্যাশবোর্ড',
      marketplace: 'মার্কেটপ্লেস',
      analytics: 'বিশ্লেষণ',
      profile: 'প্রোফাইল',
      settings: 'সেটিংস',
      logout: 'লগ আউট'
    },
    profile: {
      title: 'প্রোফাইল সেটিংস',
      basicInfo: 'প্রাথমিক তথ্য',
      language: 'ভাষা',
      agriculture: 'কৃষি',
      business: 'ব্যবসা',
      preferences: 'পছন্দসমূহ',
      security: 'নিরাপত্তা',
      save: 'সংরক্ষণ',
      edit: 'সম্পাদনা',
      cancel: 'বাতিল করুন'
    }
  },
  pa: {
    nav: {
      dashboard: 'ਡੈਸ਼ਬੋਰਡ',
      marketplace: 'ਮਾਰਕੀਟਪਲੇਸ',
      analytics: 'ਵਿਸ਼ਲੇਸ਼ਣ',
      profile: 'ਪਰੋਫ਼ਾਈਲ',
      settings: 'ਸੈਟਿੰਗਜ਼',
      logout: 'ਲੌਗ ਆਉਟ'
    },
    profile: {
      title: 'ਪਰੋਫ਼ਾਈਲ ਸੈਟਿੰਗਜ਼',
      basicInfo: 'ਮੂਲ ਜਾਣਕਾਰੀ',
      language: 'ਭਾਸ਼ਾ',
      agriculture: 'ਕਿਸਾਨੀ',
      business: 'ਕਾਰੋਬਾਰ',
      preferences: 'ਪਸੰਦ',
      security: 'ਸੁਰੱਖਿਆ',
      save: 'ਸੰਭਾਲੋ',
      edit: 'ਸੋਧ',
      cancel: 'ਰੱਦ ਕਰੋ'
    }
  }
};

export const LanguageProvider = ({ children }) => {
  LanguageProvider.propTypes = {
    children: PropTypes.node.isRequired
  };

  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const translate = (key) => {
    const keys = key.split('.');
    let translation = translations[language];
    for (const k of keys) {
      translation = translation?.[k];
    }
    return translation || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 