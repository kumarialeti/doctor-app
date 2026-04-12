import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: {
      "Appointments": "Appointments",
      "Apply doctor": "Apply doctor",
      "Users": "Users",
      "Doctors": "Doctors",
      "Profile": "Profile",
      "Settings": "Settings",
      "Logout": "Logout",
      "AdminConsole": "AdminConsole",
      "MediCarePro": "MediCarePro",
      "System Management": "System Management",
      "Patient Dashboard": "Patient Dashboard",
      "Welcome back": "Welcome back",
      "Notifications": "Notifications",
      "Here's what's happening with your appointments today.": "Here's what's happening with your appointments today."
    }
  },
  hi: {
    translation: {
      "Appointments": "नियुक्तियां",
      "Apply doctor": "डॉक्टर आवेदन",
      "Users": "उपयोगकर्ता",
      "Doctors": "डॉक्टर",
      "Profile": "प्रोफ़ाइल",
      "Settings": "सेटिंग्स",
      "Logout": "लॉग आउट",
      "AdminConsole": "व्यवस्थापक कंसोल",
      "MediCarePro": "मेडीकेयर प्रो",
      "System Management": "सिस्टम प्रबंधन",
      "Patient Dashboard": "रोगी डैशबोर्ड",
      "Welcome back": "वापसी पर स्वागत है",
      "Notifications": "सूचनाएं",
      "Here's what's happening with your appointments today.": "आज आपकी नियुक्तियों के बारे में यहाँ जानकारी दी गई है।"
    }
  },
  te: {
    translation: {
      "Appointments": "అపాయింట్‌మెంట్‌లు",
      "Apply doctor": "డాక్టర్‌కు దరఖాస్తు చేయండి",
      "Users": "వినియోగదారులు",
      "Doctors": "వైద్యులు",
      "Profile": "ప్రొఫైల్",
      "Settings": "సెట్టింగ్‌లు",
      "Logout": "లాగ్ అవుట్",
      "AdminConsole": "నిర్వాహక కన్సోల్",
      "MediCarePro": "మెడీకేర్ ప్రో",
      "System Management": "సిస్టమ్ నిర్వహణ",
      "Patient Dashboard": "రోగి డాష్‌బోర్డ్",
      "Welcome back": "తిరిగి స్వాగతం",
      "Notifications": "నోటిఫికేషన్‌లు",
      "Here's what's happening with your appointments today.": "ఈ రోజు మీ అపాయింట్‌మెంట్‌లతో ఏమి జరుగుతుందో ఇక్కడ ఉంది."
    }
  }
};

const savedLanguage = localStorage.getItem('i18nextLng') || 'en';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: savedLanguage, // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    fallbackLng: "en",

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

  export default i18n;
