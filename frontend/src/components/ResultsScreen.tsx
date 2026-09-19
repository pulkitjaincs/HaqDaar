import { ArrowLeft, Printer, AlertCircle, CheckCircle2, Clock, HelpCircle } from 'lucide-react';
import SchemeCard from './SchemeCard';

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
  
  const eligible = results.filter(r => r.status === 'ELIGIBLE');
  const oneStep = results.filter(r => r.status === 'ONE_STEP_AWAY');
  const checkOff = results.filter(r => r.status === 'CHECK_OFFICIALLY');
  const notElig = results.filter(r => r.status === 'NOT_ELIGIBLE');

  const getMemberName = (r: any) => {
    return r.member_id === 'household' 
      ? t(lang, 'household') 
      : (profile.members?.find((m: any) => m.id === r.member_id)?.relation || r.member_id);
  };

  return (
    <div className="min-h-screen bg-brand-light flex flex-col max-w-md mx-auto shadow-2xl relative">
      <header className="bg-brand text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setScreen('CHAT')} 
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-sm font-bold transition-colors active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            {t(lang, 'back_to_chat')}
          </button>
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-lg">
             ह
          </div>
        </div>
      </header>

      <main className="flex-1 p-5 pb-24 overflow-y-auto">
        <div className="mb-8">
           <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">{t(lang, 'your_results')}</h2>
           <p className="text-gray-500 font-medium text-sm">
             We found <span className="text-brand font-bold">{eligible.length} schemes</span> you qualify for right now.
           </p>
        </div>

        {/* Eligible Now */}
        <section className="mb-8">
          <h3 className="text-xl font-extrabold text-green-900 mb-4 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md shadow-green-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            {t(lang, 'eligible_now')}
            <span className="ml-auto bg-green-200 text-green-900 text-xs font-bold px-2.5 py-1 rounded-full">
              {eligible.length}
            </span>
          </h3>
          <div className="flex flex-col gap-4">
            {eligible.map((r, i) => (
              <SchemeCard key={i} result={r} scheme={getSchemeInfo(r.scheme_id)} lang={lang} t={t} openDetail={openDetail} memberName={getMemberName(r)} />
            ))}
            {eligible.length === 0 && (
              <div className="bg-white/50 border border-dashed border-gray-300 rounded-2xl p-6 text-center">
                 <p className="text-gray-500 font-medium">{t(lang, 'none_found')}</p>
              </div>
            )}
          </div>
        </section>

        {/* One Step Away */}
        <section className="mb-8">
          <h3 className="text-xl font-extrabold text-orange-900 mb-4 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Clock className="w-5 h-5" />
            </div>
            {t(lang, 'one_step_away')}
            <span className="ml-auto bg-orange-200 text-orange-900 text-xs font-bold px-2.5 py-1 rounded-full">
              {oneStep.length}
            </span>
          </h3>
          <div className="flex flex-col gap-4">
            {oneStep.map((r, i) => (
              <SchemeCard key={i} result={r} scheme={getSchemeInfo(r.scheme_id)} lang={lang} t={t} openDetail={openDetail} memberName={getMemberName(r)} />
            ))}
            {oneStep.length === 0 && (
               <div className="bg-white/50 border border-dashed border-gray-300 rounded-2xl p-6 text-center">
                 <p className="text-gray-500 font-medium">{t(lang, 'none_found')}</p>
              </div>
            )}
          </div>
        </section>

        {/* Check Officially */}
        <section className="mb-8">
          <h3 className="text-xl font-extrabold text-blue-900 mb-4 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            {t(lang, 'check_officially')}
            <span className="ml-auto bg-blue-200 text-blue-900 text-xs font-bold px-2.5 py-1 rounded-full">
              {checkOff.length}
            </span>
          </h3>
          <div className="flex flex-col gap-4">
            {checkOff.map((r, i) => (
              <SchemeCard key={i} result={r} scheme={getSchemeInfo(r.scheme_id)} lang={lang} t={t} openDetail={openDetail} memberName={getMemberName(r)} />
            ))}
            {checkOff.length === 0 && (
               <div className="bg-white/50 border border-dashed border-gray-300 rounded-2xl p-6 text-center">
                 <p className="text-gray-500 font-medium">{t(lang, 'none_found')}</p>
              </div>
            )}
          </div>
        </section>

        {/* Not Eligible */}
        {notElig.length > 0 && (
          <details className="mb-8 group">
            <summary className="text-lg font-bold text-gray-500 mb-4 cursor-pointer flex items-center gap-2.5 outline-none list-none">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center transition-transform group-open:rotate-90">
                <AlertCircle className="w-5 h-5" />
              </div>
              {t(lang, 'not_eligible')}
              <span className="ml-auto bg-gray-200 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">
                {notElig.length}
              </span>
            </summary>
            <div className="flex flex-col gap-4 mt-4 animate-in">
              {notElig.map((r, i) => (
                <SchemeCard key={i} result={r} scheme={getSchemeInfo(r.scheme_id)} lang={lang} t={t} openDetail={openDetail} memberName={getMemberName(r)} />
              ))}
            </div>
          </details>
        )}

      </main>

      {/* Sticky Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-brand-light via-brand-light to-transparent pt-12 z-20 pointer-events-none">
         <div className="pointer-events-auto">
            <button 
              onClick={() => window.print()} 
              className="w-full bg-brand text-white py-4 rounded-2xl font-bold shadow-xl shadow-brand/30 flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-brand-dark"
            >
              <Printer className="w-5 h-5" />
              {t(lang, 'print_pack')}
            </button>
            <p className="text-center text-[11px] text-gray-400 mt-3 font-medium opacity-80">{t(lang, 'disclaimer')}</p>
         </div>
      </div>
    </div>
  )
}
