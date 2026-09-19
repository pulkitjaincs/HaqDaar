import { ArrowLeft, CheckCircle2, AlertCircle, HelpCircle, ExternalLink, ShieldCheck, ShieldAlert, ListChecks, FileText } from 'lucide-react';

interface SchemeDetailProps {
  lang: string;
  scheme: any;
  result: any;
  setScreen: (screen: 'START' | 'CHAT' | 'RESULTS' | 'DETAIL') => void;
  t: (lang: string, key: string, vars?: any) => string;
}

export default function SchemeDetail({ lang, scheme, result, setScreen, t }: SchemeDetailProps) {
  
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
    <div className="min-h-screen bg-brand-light flex flex-col max-w-md mx-auto shadow-2xl relative">
      <header className="bg-brand text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setScreen('RESULTS')} 
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors active:scale-95" 
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold truncate flex-1 leading-tight pr-2">
            {scheme.name?.[lang] || scheme.name?.en || scheme.id}
          </h1>
        </div>
      </header>

      <main className="flex-1 p-5 pb-8 space-y-6 animate-in">
        
        {/* Benefit & Status Hero */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-bl-full -z-10"></div>
          
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold border mb-4 shadow-sm ${badgeClass}`}>
            {badgeIcon}
            {result.status.replace(/_/g, ' ')}
          </div>
          
          <p className="text-lg text-gray-800 leading-relaxed font-semibold">
            {scheme.benefit?.[lang] || scheme.benefit?.en}
          </p>
        </div>

        {/* Near-miss action */}
        {result.status === 'ONE_STEP_AWAY' && (
          <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 p-5 rounded-2xl shadow-sm">
            <h3 className="font-extrabold text-orange-900 mb-1 flex items-center gap-2 uppercase tracking-wide text-xs">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              {t(lang, 'action')}
            </h3>
            <p className="text-orange-800 font-medium">
              {result.action || t(lang, 'wait_years', { n: result.eligible_in_years || '?' })}
            </p>
          </div>
        )}

        {/* Why you qualify */}
        {result.why && result.why.length > 0 && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-brand" />
              {t(lang, 'why_you_qualify')}
            </h3>
            <ul className="space-y-3">
              {result.why.map((w: any, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className={`mt-0.5 flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full ${
                    w.result === 'PASS' ? 'bg-green-100 text-green-600' : 
                    w.result === 'FAIL' ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {w.result === 'PASS' ? '✓' : w.result === 'FAIL' ? '✗' : '?'}
                  </span>
                  <span className="text-gray-700 font-medium leading-tight pt-0.5">{w.criterion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Documents */}
        {scheme.documents && scheme.documents.length > 0 && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand" />
              {t(lang, 'documents_needed')}
            </h3>
            <div className="space-y-2">
              {scheme.documents.map((doc: string, i: number) => (
                <label key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input 
                      type="checkbox" 
                      className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded focus:ring-brand/50 checked:bg-brand checked:border-brand transition-colors cursor-pointer" 
                      id={`doc-${i}`} 
                    />
                    <CheckCircle2 className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 capitalize group-hover:text-gray-900 transition-colors select-none">
                    {doc.replace(/_/g, ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Steps */}
        {scheme.steps && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 bg-brand/10 text-brand rounded-md flex items-center justify-center text-xs font-bold">1</span>
              {t(lang, 'steps')}
            </h3>
            <div className="space-y-4">
              {(scheme.steps?.[lang] || scheme.steps?.en || []).map((step: string, i: number) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-brand-light text-brand text-xs font-bold flex items-center justify-center border border-brand/20">
                      {i + 1}
                    </div>
                    {i !== (scheme.steps?.[lang] || scheme.steps?.en || []).length - 1 && (
                      <div className="w-px h-full bg-gray-200 my-1"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 font-medium pt-0.5 pb-2 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Where to apply */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-extrabold text-gray-900 mb-2">{t(lang, 'where_to_apply')}</h3>
          <p className="text-sm text-gray-700 font-medium mb-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
            {scheme.apply?.where?.[lang] || scheme.apply?.where?.en}
          </p>
          {scheme.apply?.url && (
            <a 
              href={scheme.apply.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 text-brand font-bold text-sm bg-brand/5 hover:bg-brand/10 px-4 py-2 rounded-lg transition-colors"
            >
              {t(lang, 'official_link')}
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Verification chip */}
        <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium ${
          isVerified ? 'bg-green-50 border-green-100 text-green-800' : 'bg-yellow-50 border-yellow-100 text-yellow-800'
        }`}>
          {isVerified ? <ShieldCheck className="w-4 h-4 text-green-600" /> : <ShieldAlert className="w-4 h-4 text-yellow-600" />}
          <div className="flex-1">
             <div className="font-bold mb-0.5">{scheme.source?.status || 'PROVISIONAL'}</div>
             <div className="opacity-80">
               {scheme.source?.verified_on ? `${t(lang, 'verified_on')}: ${scheme.source.verified_on}` : t(lang, 'being_verified')}
             </div>
          </div>
        </div>
        
      </main>
    </div>
  )
}
