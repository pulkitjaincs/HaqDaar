import { ChevronRight, Clock, Info } from 'lucide-react';

interface SchemeCardProps {
  result: any;
  scheme: any;
  lang: string;
  t: (lang: string, key: string, vars?: any) => string;
  openDetail: (result: any) => void;
  memberName: string;
}

export default function SchemeCard({ result, scheme, lang, t, openDetail, memberName }: SchemeCardProps) {
  
  // Status specific styling
  let borderLeft = 'border-l-gray-400';
  let borderColor = 'border-gray-200';
  let badgeClass = 'bg-gray-100 text-gray-600';
  
  if (result.status === 'ELIGIBLE') {
    borderLeft = 'border-l-green-600';
    borderColor = 'border-green-100 hover:border-green-300';
    badgeClass = 'bg-green-100 text-green-800';
  } else if (result.status === 'ONE_STEP_AWAY') {
    borderLeft = 'border-l-orange-500';
    borderColor = 'border-orange-100 hover:border-orange-300';
    badgeClass = 'bg-orange-100 text-orange-800';
  } else if (result.status === 'CHECK_OFFICIALLY') {
    borderLeft = 'border-l-blue-500';
    borderColor = 'border-blue-100 hover:border-blue-300';
    badgeClass = 'bg-blue-100 text-blue-800';
  }

  return (
    <button 
      onClick={() => openDetail(result)} 
      className={`w-full text-left bg-white p-4 rounded-2xl shadow-sm border ${borderColor} border-l-[6px] transition-all duration-300 hover:shadow-md group relative overflow-hidden`}
    >
      <div className="flex justify-between items-start mb-2">
         <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
           <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-600">
             {t(lang, 'for_member')}: {memberName}{result.via_member ? ` (via ${result.via_member})` : ''}
           </span>
         </div>
         <div className="bg-gray-50 p-1 rounded-full text-gray-400 group-hover:bg-brand/10 group-hover:text-brand transition-colors">
            <ChevronRight className="w-4 h-4" />
         </div>
      </div>
      
      <h4 className="font-extrabold text-lg text-gray-900 leading-snug mb-1.5 pr-6">
        {scheme?.name?.[lang] || scheme?.name?.en || result.scheme_id}
      </h4>
      
      <p className="text-sm font-medium text-brand/80 line-clamp-2 leading-relaxed mb-3">
        {scheme?.benefit?.[lang] || scheme?.benefit?.en || ''}
      </p>
      
      {result.status === 'ONE_STEP_AWAY' && (
        <div className="bg-orange-50/80 border border-orange-100 text-orange-800 p-2.5 rounded-xl text-xs font-medium mb-3 flex gap-2 items-start">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-500" />
          <span>
            <strong className="font-bold uppercase tracking-wide text-[10px] block text-orange-600 mb-0.5">{t(lang, 'action')}</strong> 
            {result.action || t(lang, 'wait_years', { n: result.eligible_in_years || '?' })}
          </span>
        </div>
      )}

      {/* Verification chip */}
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400 bg-gray-50 inline-flex px-2 py-1 rounded-md">
        <Clock className="w-3 h-3" />
        {scheme?.source?.verified_on ? `${t(lang, 'verified_on')}: ${scheme.source.verified_on}` : t(lang, 'being_verified')}
        <div className={`ml-1 w-1.5 h-1.5 rounded-full ${scheme?.source?.status === 'VERIFIED' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
      </div>
    </button>
  )
}
