import { useEffect, useState } from 'react';
import { ArrowLeft, Printer, AlertCircle, CheckCircle2, Clock, HelpCircle, Gift } from 'lucide-react';
import SchemeCard from './SchemeCard';
import BenefitsPack from './BenefitsPack';

interface ResultsScreenProps {
  lang: string;
  results: any[];
  profile: any;
  setScreen: (screen: 'START' | 'CHAT' | 'RESULTS' | 'DETAIL') => void;
  openDetail: (result: any) => void;
  getSchemeInfo: (schemeId: string) => any;
  t: (lang: string, key: string, vars?: any) => string;
}

export default function ResultsScreen({
  lang, results, profile, setScreen, openDetail, getSchemeInfo, t
}: ResultsScreenProps) {
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (results.some(r => r.status === 'ELIGIBLE')) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [results]);

  const eligible = results.filter(r => r.status === 'ELIGIBLE');
  const oneStep = results.filter(r => r.status === 'ONE_STEP_AWAY');
  const checkOff = results.filter(r => r.status === 'CHECK_OFFICIALLY');
  const notElig = results.filter(r => r.status === 'NOT_ELIGIBLE');

  const getMemberName = (r: any) => {
    return r.member_id === 'household' 
      ? t(lang, 'household') 
      : (profile.members?.find((m: any) => m.id === r.member_id)?.relation || r.member_id);
  };

  const calculateTotalBenefit = () => {
    // A mock heuristic for demo purposes: 12000 INR per eligible scheme on average
    return (eligible.length * 12000).toLocaleString('en-IN');
  };

  if (isPrinting) {
    return <BenefitsPack 
      lang={lang} 
      results={eligible} 
      profile={profile} 
      getSchemeInfo={getSchemeInfo} 
      t={t} 
      onClose={() => setIsPrinting(false)} 
    />;
  }

  return (
    <div className="min-h-screen bg-brand-light flex flex-col max-w-7xl mx-auto shadow-2xl relative overflow-hidden font-sans">
      
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden flex justify-center">
           {Array.from({ length: 50 }).map((_, i) => (
             <div 
               key={i} 
               className="w-3 h-3 md:w-4 md:h-4 absolute top-[-10px] animate-confetti"
               style={{ 
                 left: `${Math.random() * 100}%`,
                 backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444'][Math.floor(Math.random() * 4)],
                 animationDelay: `${Math.random() * 2}s`
               }}
             />
           ))}
        </div>
      )}

      <header className="glass-dark text-white p-4 md:px-8 sticky top-0 z-30 shadow-md">
        <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
          <button 
            onClick={() => setScreen('CHAT')} 
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            {t(lang, 'back_to_chat')}
          </button>
          
          <div className="hidden md:block font-bold text-lg">{t(lang, 'app_name')}</div>
          
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center font-bold text-lg backdrop-blur-sm border border-white/10 shadow-inner">
             ह
          </div>
        </div>
      </header>

      <main className="flex-1 p-5 md:p-8 pb-32 overflow-y-auto">
        
        {/* Total Benefit Banner */}
        {eligible.length > 0 && (
          <div className="bg-gradient-to-br from-brand-accent to-orange-400 rounded-3xl p-6 md:p-10 mb-10 text-white shadow-xl shadow-brand-accent/20 animate-in-up relative overflow-hidden group cursor-default border border-white/20">
             <div className="absolute top-[-50%] right-[-10%] w-48 h-48 md:w-96 md:h-96 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-colors"></div>
             <div className="relative z-10 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 md:w-6 md:h-6 opacity-90" />
                  <span className="text-sm md:text-base font-bold uppercase tracking-widest opacity-90">{lang === 'hi' ? 'अनुमानित लाभ' : 'Estimated Benefit'}</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">₹{calculateTotalBenefit()}<span className="text-xl md:text-2xl font-medium opacity-80">/yr</span></h2>
                <p className="text-sm md:text-lg font-medium opacity-90 mt-2 md:mt-4">
                  {lang === 'hi' ? `आप ${eligible.length} योजनाओं के लिए पात्र हैं!` : `You unlock ${eligible.length} schemes instantly!`}
                </p>
             </div>
          </div>
        )}

        <div className="mb-8 px-1 flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div>
             <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-1">{t(lang, 'your_results')}</h2>
             <p className="text-gray-500 font-medium text-sm md:text-base">We found <span className="text-brand font-bold">{eligible.length + oneStep.length + checkOff.length} schemes</span> matched to your profile.</p>
           </div>
           
           <button 
             onClick={() => setIsPrinting(true)} 
             className="hidden md:flex bg-brand text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-brand/30 items-center justify-center gap-2 active:scale-95 transition-all hover:bg-brand-dark hover:shadow-brand/50"
           >
             <Printer className="w-5 h-5" />
             {t(lang, 'print_pack')}
           </button>
        </div>

        {/* Eligible Now */}
        <section className="mb-10">
          <h3 className="text-xl md:text-2xl font-extrabold text-green-900 mb-5 flex items-center gap-2.5 px-1">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-green-600 to-green-400 text-white flex items-center justify-center shadow-lg shadow-green-500/30">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            {t(lang, 'eligible_now')}
            <span className="ml-auto md:ml-4 bg-green-100 text-green-700 text-sm md:text-base font-bold px-3 py-1 rounded-full border border-green-200">
              {eligible.length}
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {eligible.map((r, i) => (
              <SchemeCard key={i} result={r} scheme={getSchemeInfo(r.scheme_id)} lang={lang} t={t} openDetail={openDetail} memberName={getMemberName(r)} />
            ))}
            {eligible.length === 0 && (
              <div className="glass border border-dashed border-gray-300 rounded-2xl p-6 text-center col-span-full">
                 <p className="text-gray-500 font-medium">{t(lang, 'none_found')}</p>
              </div>
            )}
          </div>
        </section>

        {/* One Step Away */}
        <section className="mb-10">
          <h3 className="text-xl md:text-2xl font-extrabold text-orange-900 mb-5 flex items-center gap-2.5 px-1">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-orange-500 to-orange-400 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Clock className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            {t(lang, 'one_step_away')}
            <span className="ml-auto md:ml-4 bg-orange-100 text-orange-700 text-sm md:text-base font-bold px-3 py-1 rounded-full border border-orange-200">
              {oneStep.length}
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {oneStep.map((r, i) => (
              <SchemeCard key={i} result={r} scheme={getSchemeInfo(r.scheme_id)} lang={lang} t={t} openDetail={openDetail} memberName={getMemberName(r)} />
            ))}
            {oneStep.length === 0 && (
               <div className="glass border border-dashed border-gray-300 rounded-2xl p-6 text-center col-span-full">
                 <p className="text-gray-500 font-medium">{t(lang, 'none_found')}</p>
              </div>
            )}
          </div>
        </section>

        {/* Check Officially */}
        <section className="mb-10">
          <h3 className="text-xl md:text-2xl font-extrabold text-blue-900 mb-5 flex items-center gap-2.5 px-1">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-blue-500 to-blue-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <HelpCircle className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            {t(lang, 'check_officially')}
            <span className="ml-auto md:ml-4 bg-blue-100 text-blue-700 text-sm md:text-base font-bold px-3 py-1 rounded-full border border-blue-200">
              {checkOff.length}
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {checkOff.map((r, i) => (
              <SchemeCard key={i} result={r} scheme={getSchemeInfo(r.scheme_id)} lang={lang} t={t} openDetail={openDetail} memberName={getMemberName(r)} />
            ))}
            {checkOff.length === 0 && (
               <div className="glass border border-dashed border-gray-300 rounded-2xl p-6 text-center col-span-full">
                 <p className="text-gray-500 font-medium">{t(lang, 'none_found')}</p>
              </div>
            )}
          </div>
        </section>

        {/* Not Eligible */}
        {notElig.length > 0 && (
          <details className="mb-10 group">
            <summary className="text-lg md:text-xl font-bold text-gray-500 mb-5 cursor-pointer flex items-center gap-2.5 outline-none list-none px-1">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center transition-transform group-open:rotate-90">
                <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              {t(lang, 'not_eligible')}
              <span className="ml-auto md:ml-4 bg-gray-200 text-gray-600 text-xs md:text-sm font-bold px-2.5 py-1.5 rounded-full">
                {notElig.length}
              </span>
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5 animate-in">
              {notElig.map((r, i) => (
                <SchemeCard key={i} result={r} scheme={getSchemeInfo(r.scheme_id)} lang={lang} t={t} openDetail={openDetail} memberName={getMemberName(r)} />
              ))}
            </div>
          </details>
        )}

      </main>

      {/* Sticky Bottom Action (Mobile Only, Desktop has button in header) */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-brand-light via-brand-light to-transparent pt-12 z-20 pointer-events-none">
         <div className="pointer-events-auto">
            <button 
              onClick={() => setIsPrinting(true)} 
              className="w-full bg-brand text-white py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-brand/40 flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-brand-dark hover:shadow-brand/60"
            >
              <Printer className="w-6 h-6" />
              {t(lang, 'print_pack')}
            </button>
            <p className="text-center text-[11px] text-gray-400 mt-4 font-semibold tracking-wide uppercase opacity-80">{t(lang, 'disclaimer')}</p>
         </div>
      </div>
    </div>
  )
}
