import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../components/UserContext";

const Settings = () => {
  const { user } = useContext(UserContext);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  const currentLang = i18n.language || "en";

  return (
    <div className="p-8 h-full bg-white rounded-2xl shadow-sm border border-slate-100 relative max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-4 flex items-center gap-2">
        <i className="fa-solid fa-gear text-blue-500"></i> {t('Settings')}
      </h1>
      
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Language Preferences</h2>
        <p className="text-sm text-slate-500 mb-6">
          Choose your preferred language for the application interface. This will update the menus and dashboard immediately.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            onClick={() => changeLanguage('en')}
            className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${currentLang === 'en' ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-slate-200 hover:border-blue-300 bg-white'}`}
          >
            <span className="text-3xl">🇬🇧</span>
            <span className="font-bold text-slate-700">English</span>
          </div>

          <div 
            onClick={() => changeLanguage('hi')}
            className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${currentLang === 'hi' ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' : 'border-slate-200 hover:border-indigo-300 bg-white'}`}
          >
            <span className="text-3xl">🇮🇳</span>
            <span className="font-bold text-slate-700">Hindi (हिंदी)</span>
          </div>

          <div 
            onClick={() => changeLanguage('te')}
            className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${currentLang === 'te' ? 'border-purple-500 bg-purple-50/50 shadow-sm' : 'border-slate-200 hover:border-purple-300 bg-white'}`}
          >
            <span className="text-3xl">🇮🇳</span>
            <span className="font-bold text-slate-700">Telugu (తెలుగు)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
