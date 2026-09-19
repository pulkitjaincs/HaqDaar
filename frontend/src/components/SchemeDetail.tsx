import { ArrowLeft, CheckCircle2, AlertCircle, HelpCircle, ExternalLink, ShieldCheck, ShieldAlert, ListChecks, FileText, Volume2 } from 'lucide-react';
import { useState } from 'react';

interface SchemeDetailProps {
  lang: string;
  scheme: any;
  result: any;
  setScreen: (screen: 'START' | 'CHAT' | 'RESULTS' | 'DETAIL') => void;
  t: (lang: string, key: string, vars?: any) => string;
}

export default function SchemeDetail({ lang, scheme, result, setScreen, t }: SchemeDetailProps) {
  
  const [isPlaying, setIsPlaying] = useState(false);

  const speakText = (text: string, voiceLang: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceLang === 'hi' ? 'hi-IN' : 'en-IN';
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // Status specific styling
  let badgeClass = 'bg-gray-100 text-gray-800';
  let badgeIcon = <HelpCircle className="w-5 h-5" />;
  
  if (result.status === 'ELIGIBLE') {
    badgeClass = 'bg-green-100 text-green-800 border-green-200';
    badgeIcon = <CheckCircle2 className="w-5 h-5" />;
  } else if (result.status === 'ONE_STEP_AWAY') {
    badgeClass = 'bg-orange-100 text-orange-800 border-orange-200';
    badgeIcon = <AlertCircle className="w-5 h-5" />;
  } else if (result.status === 'CHECK_OFFICIALLY') {
    badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
    badgeIcon = <HelpCircle className="w-5 h-5" />;
  }

  const isVerified = scheme.source?.status === 'VERIFIED';

  return (
    <div className="min-h-screen bg-brand-light flex flex-col max-w-5xl mx-auto shadow-2xl relative font-sans">
      <header className="bg-brand text-white p-4 md:px-8 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3 max-w-5xl mx-auto">
          <button 
            onClick={() => setScreen('RESULTS')} 
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors active:scale-95" 
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg md:text-xl font-bold truncate flex-1 leading-tight pr-2">
            {scheme.name?.[lang] || scheme.name?.en || scheme.id}
          </h1>
        </div>
      </header>

      <main className="flex-1 p-5 md:p-8 pb-12 space-y-6 md:space-y-8 animate-in">
        
        {/* Benefit & Status Hero */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-brand/5 rounded-bl-full -z-10"></div>
          
          <div className="flex justify-between items-start mb-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm md:text-base font-bold border shadow-sm ${badgeClass}`}>
              {badgeIcon}
              {result.status.replace(/_/g, ' ')}
            </div>
            
            <button 
              onClick={() => speakText(scheme.benefit?.[lang] || scheme.benefit?.en, lang)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all ${isPlaying ? 'bg-brand text-white shadow-md animate-pulse' : 'bg-gray-100 text-brand hover:bg-brand/10'}`}
              aria-label="Listen"
            >
              <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
              {lang === 'hi' ? 'सुनें' : 'Listen'}
            </button>
          </div>
          
          <p className="text-xl md:text-3xl text-gray-800 leading-relaxed font-semibold max-w-3xl">
            {scheme.benefit?.[lang] || scheme.benefit?.en}
          </p>
        </div>

        {/* Desktop Split Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          {/* Left Column */}
          <div className="space-y-6 md:space-y-8">
            
            {/* Near-miss action */}
            {result.status === 'ONE_STEP_AWAY' && (
              <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 p-5 md:p-6 rounded-2xl shadow-sm">
                <h3 className="font-extrabold text-orange-900 mb-2 flex items-center gap-2 uppercase tracking-wide text-xs md:text-sm">
                  <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                  {t(lang, 'action')}
                </h3>
                <p className="text-orange-800 font-medium md:text-lg">
                  {result.action || t(lang, 'wait_years', { n: result.eligible_in_years || '?' })}
                </p>
              </div>
            )}

            {/* Why you qualify */}
            {result.why && result.why.length > 0 && (
              <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-extrabold text-gray-900 mb-4 md:mb-5 flex items-center gap-2 md:text-xl">
                  <ListChecks className="w-5 h-5 md:w-6 md:h-6 text-brand" />
                  {t(lang, 'why_you_qualify')}
                </h3>
                <ul className="space-y-4">
                  {result.why.map((w: any, i: number) => (
                    <li key={i} className="flex items-start gap-3 md:gap-4 text-sm md:text-base">
                      <span className={`mt-0.5 flex-shrink-0 flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full ${
                        w.result === 'PASS' ? 'bg-green-100 text-green-600' : 
                        w.result === 'FAIL' ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {w.result === 'PASS' ? '✓' : w.result === 'FAIL' ? '✗' : '?'}
                      </span>
                      <span className="text-gray-700 font-medium leading-tight pt-0.5 md:pt-1">{w.criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Verification chip */}
            <div className={`flex items-center gap-3 p-4 md:p-5 rounded-2xl border text-sm font-medium ${
              isVerified ? 'bg-green-50 border-green-100 text-green-800' : 'bg-yellow-50 border-yellow-100 text-yellow-800'
            }`}>
              {isVerified ? <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-green-600" /> : <ShieldAlert className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />}
              <div className="flex-1">
                 <div className="font-bold mb-1 text-base">{scheme.source?.status || 'PROVISIONAL'}</div>
                 <div className="opacity-80">
                   {scheme.source?.verified_on ? `${t(lang, 'verified_on')}: ${scheme.source.verified_on}` : t(lang, 'being_verified')}
                 </div>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6 md:space-y-8">
            
            {/* Documents */}
            {scheme.documents && scheme.documents.length > 0 && (
              <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-extrabold text-gray-900 mb-4 md:mb-5 flex items-center gap-2 md:text-xl">
                  <FileText className="w-5 h-5 md:w-6 md:h-6 text-brand" />
                  {t(lang, 'documents_needed')}
                </h3>
                <div className="space-y-3">
                  {scheme.documents.map((doc: string, i: number) => (
                    <label key={i} className="flex items-center gap-3 p-3 md:p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group border border-transparent hover:border-gray-200">
                      <div className="relative flex items-center justify-center w-6 h-6">
                        <input 
                          type="checkbox" 
                          className="peer appearance-none w-6 h-6 border-2 border-gray-300 rounded focus:ring-brand/50 checked:bg-brand checked:border-brand transition-colors cursor-pointer" 
                          id={`doc-${i}`} 
                        />
                        <CheckCircle2 className="w-4 h-4 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-sm md:text-base font-medium text-gray-700 capitalize group-hover:text-gray-900 transition-colors select-none">
                        {doc.replace(/_/g, ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Where to apply */}
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-extrabold text-gray-900 mb-3 md:text-xl">{t(lang, 'where_to_apply')}</h3>
              <p className="text-sm md:text-base text-gray-700 font-medium mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                {scheme.apply?.where?.[lang] || scheme.apply?.where?.en}
              </p>
              {scheme.apply?.url && (
                <a 
                  href={scheme.apply.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 text-brand font-bold text-sm md:text-base bg-brand/5 hover:bg-brand/10 px-5 py-3 rounded-xl transition-colors"
                >
                  {t(lang, 'official_link')}
                  <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              )}
            </div>

            {/* Steps */}
            {scheme.steps && (
              <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-extrabold text-gray-900 mb-4 md:mb-5 flex items-center gap-2 md:text-xl">
                  <span className="w-6 h-6 md:w-8 md:h-8 bg-brand/10 text-brand rounded-md flex items-center justify-center text-xs md:text-sm font-bold">1</span>
                  {t(lang, 'steps')}
                </h3>
                <div className="space-y-5">
                  {(scheme.steps?.[lang] || scheme.steps?.en || []).map((step: string, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-brand-light text-brand text-xs md:text-sm font-bold flex items-center justify-center border border-brand/20">
                          {i + 1}
                        </div>
                        {i !== (scheme.steps?.[lang] || scheme.steps?.en || []).length - 1 && (
                          <div className="w-px h-full bg-gray-200 my-1"></div>
                        )}
                      </div>
                      <p className="text-sm md:text-base text-gray-700 font-medium pt-1 pb-3 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
        
      </main>
    </div>
  )
}
