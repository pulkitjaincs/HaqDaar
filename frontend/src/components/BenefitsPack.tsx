import { useEffect } from 'react';
import { ArrowLeft, Printer, FileText, CheckCircle } from 'lucide-react';

interface BenefitsPackProps {
  lang: string;
  results: any[];
  profile: any;
  getSchemeInfo: (schemeId: string) => any;
  t: (lang: string, key: string, vars?: any) => string;
  onClose: () => void;
}

export default function BenefitsPack({ lang, results, profile, getSchemeInfo, t, onClose }: BenefitsPackProps) {
  
  // Auto-trigger print dialog when component mounts
  useEffect(() => {
    // Small delay to ensure render is complete
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const eligible = results.filter(r => r.status === 'ELIGIBLE');
  
  const getMemberName = (r: any) => {
    return r.member_id === 'household' 
      ? t(lang, 'household') 
      : (profile.members?.find((m: any) => m.id === r.member_id)?.relation || r.member_id);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Non-printable header for navigation */}
      <div className="no-print p-4 bg-gray-100 border-b flex justify-between items-center sticky top-0 z-50">
        <button onClick={onClose} className="flex items-center gap-2 text-gray-700 font-bold px-4 py-2 hover:bg-gray-200 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-brand text-white font-bold px-4 py-2 rounded-lg shadow">
          <Printer className="w-5 h-5" />
          Print Document
        </button>
      </div>

      {/* Printable Area */}
      <div className="print-container max-w-4xl mx-auto p-8 font-sans text-gray-900">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-brand pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand text-white rounded-full flex items-center justify-center text-3xl font-bold">
               ह
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-brand tracking-tight mb-1">
                {lang === 'hi' ? 'हक़दार लाभ कार्ड' : 'Haqdaar Benefits Pack'}
              </h1>
              <p className="text-gray-500 font-medium text-lg">
                Generated on: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-800 border-2 border-brand-accent px-4 py-2 rounded-lg bg-orange-50">
              Total Eligible Schemes: {eligible.length}
            </p>
          </div>
        </div>

        {/* Family Summary */}
        <div className="mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand" />
            Family Profile Snapshot
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             <div>
               <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">State</p>
               <p className="font-semibold text-lg">{profile.household.state || 'N/A'}</p>
             </div>
             <div>
               <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">Income</p>
               <p className="font-semibold text-lg">{profile.household.annual_income_inr ? `₹${profile.household.annual_income_inr}/yr` : 'N/A'}</p>
             </div>
             <div>
               <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">Members</p>
               <p className="font-semibold text-lg">{profile.members?.length || 0}</p>
             </div>
             <div>
               <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">Ration Card</p>
               <p className="font-semibold text-lg uppercase">{profile.household.ration_card || 'None'}</p>
             </div>
          </div>
        </div>

        {/* Schemes List */}
        <h2 className="text-2xl font-extrabold text-brand mb-6 border-b pb-2">Eligible Schemes & Documents Required</h2>
        
        <div className="flex flex-col gap-8">
          {eligible.map((r, i) => {
            const scheme = getSchemeInfo(r.scheme_id);
            if (!scheme) return null;
            return (
              <div key={i} className="break-inside-avoid border border-gray-300 rounded-2xl p-6 bg-white shadow-sm">
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{scheme.name[lang] || scheme.name['en']}</h3>
                    <p className="text-brand-accent font-bold text-lg bg-orange-50 inline-block px-3 py-1 rounded-lg">
                      For: {getMemberName(r)}
                    </p>
                  </div>
                  <div className="bg-green-100 text-green-800 p-2 rounded-full">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                </div>
                
                <p className="text-gray-700 text-lg mb-6 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {scheme.benefit[lang] || scheme.benefit['en']}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 uppercase tracking-wide text-sm border-b pb-1">Required Documents</h4>
                    <ul className="list-disc pl-5 text-gray-700 space-y-1">
                      {scheme.documents?.map((doc: string, idx: number) => (
                        <li key={idx} className="capitalize font-medium">{doc.replace(/_/g, ' ')}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 uppercase tracking-wide text-sm border-b pb-1">Where to Apply</h4>
                    <p className="text-gray-700 font-medium">
                      {scheme.apply?.where?.[lang] || scheme.apply?.where?.['en'] || "Common Service Center (CSC)"}
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t-2 border-gray-200 text-center text-gray-500 font-medium text-sm">
          <p>Powered by Haqdaar - 100% Deterministic & Private</p>
          <p className="mt-1">Please verify all details at your local CSC or official government portals before applying.</p>
        </div>

      </div>
    </div>
  );
}
