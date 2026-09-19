import { ChevronUp, ChevronDown, User, MapPin, CreditCard, Flame, Map } from 'lucide-react';

interface FamilyProfileProps {
  profile: any;
  profileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
  lang: string;
  t: (lang: string, key: string, vars?: any) => string;
}

export default function FamilyProfile({ profile, profileOpen, setProfileOpen, lang, t }: FamilyProfileProps) {
  const memberCount = profile.members?.length || 0;
  
  return (
    <div className="bg-white border-b border-gray-100 shadow-sm z-20 relative">
      <button 
        onClick={() => setProfileOpen(!profileOpen)} 
        className="w-full px-4 py-3 flex items-center justify-between text-sm transition-colors hover:bg-gray-50 focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <div className="bg-brand/10 p-1.5 rounded-lg text-brand">
            <User className="w-4 h-4" />
          </div>
          <span className="font-semibold text-gray-900 tracking-wide">
            {lang === 'hi' ? 'परिवार का विवरण' : 'Family Profile'} 
            <span className="ml-2 bg-brand text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              {memberCount}
            </span>
          </span>
        </div>
        <div className="text-gray-400 bg-gray-100 p-1 rounded-full">
          {profileOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {profileOpen && (
        <div className="px-4 pb-4 animate-in">
          {memberCount === 0 && (
            <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <span className="text-gray-400 text-xs font-medium">{t(lang, 'profile_placeholder')}</span>
            </div>
          )}

          {/* Members Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {profile.members?.map((m: any, i: number) => (
              <div key={i} className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1 animate-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-sm capitalize truncate pr-2">
                    {m.relation || m.name || 'Member'}
                  </span>
                  {m.gender && (
                    <span className="text-gray-400 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded uppercase font-semibold">
                      {m.gender === 'female' ? 'F' : 'M'}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-gray-500 font-medium">
                  {m.age != null && <span>{m.age} yrs</span>}
                  {m.occupation && <span className="text-brand truncate max-w-[80px]">{m.occupation.replace(/_/g, ' ')}</span>}
                  {m.has_bank_account && <span className="text-green-600">Bank ✓</span>}
                  {m.is_income_tax_payer && <span className="text-red-500">Tax ✓</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Household facts */}
          {(profile.household?.state || profile.household?.ration_card || profile.household?.owns_agri_land != null || profile.household?.annual_income_inr != null) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
              {profile.household.state && (
                <div className="flex items-center gap-1 bg-brand-light text-brand-dark px-2.5 py-1 rounded-lg text-[11px] font-medium border border-brand/10">
                  <MapPin className="w-3 h-3 text-brand" /> {profile.household.state}
                </div>
              )}
              {profile.household.area_type && (
                <div className="flex items-center gap-1 bg-brand-light text-brand-dark px-2.5 py-1 rounded-lg text-[11px] font-medium border border-brand/10 capitalize">
                  <Map className="w-3 h-3 text-brand" /> {profile.household.area_type}
                </div>
              )}
              {profile.household.ration_card && (
                <div className="flex items-center gap-1 bg-brand-light text-brand-dark px-2.5 py-1 rounded-lg text-[11px] font-medium border border-brand/10 uppercase">
                  <CreditCard className="w-3 h-3 text-brand" /> {profile.household.ration_card}
                </div>
              )}
              {profile.household.annual_income_inr != null && (
                <div className="flex items-center gap-1 bg-brand-light text-brand-dark px-2.5 py-1 rounded-lg text-[11px] font-medium border border-brand/10">
                  ₹ {profile.household.annual_income_inr.toLocaleString()}
                </div>
              )}
              {profile.household.owns_agri_land && (
                <div className="flex items-center gap-1 bg-brand-light text-brand-dark px-2.5 py-1 rounded-lg text-[11px] font-medium border border-brand/10">
                  🌾 Agri land
                </div>
              )}
              {profile.household.has_lpg_connection === false && (
                <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-red-100">
                  <Flame className="w-3 h-3" /> No LPG
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
