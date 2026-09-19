import { Mic, Send, ShieldCheck, HeartHandshake, Sprout, Building, Zap, ArrowRight, UserCircle } from 'lucide-react';

interface StartScreenProps {
  lang: string;
  setLang: (lang: string) => void;
  voiceSupported: boolean;
  input: string;
  setInput: (val: string) => void;
  startChat: (msg?: string) => void;
  startVoice: () => void;
  t: (lang: string, key: string, vars?: any) => string;
}

export default function StartScreen({
  lang, setLang, voiceSupported, input, setInput, startChat, startVoice, t
}: StartScreenProps) {
  
  const demoPersonas = [
    { id: 'sita', name: 'Sita', role: 'Farmer, Rajasthan', prompt: 'I am a farmer in Rajasthan with a wife, a 7-year-old daughter and a mother aged 68', icon: <Sprout className="w-5 h-5 text-green-600"/> },
    { id: 'arjun', name: 'Arjun', role: 'Street Vendor, Delhi', prompt: 'I am a street vendor living in a rented house in urban area. Age 29. No bank account.', icon: <Building className="w-5 h-5 text-blue-600"/> }
  ];

  const stats = [
    { label: 'Schemes Tracked', value: '15+' },
    { label: 'Max Benefit/Yr', value: '₹1.2L' },
    { label: 'Privacy', value: '100%' }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 text-center bg-gradient-to-br from-teal-50 via-white to-orange-50 relative overflow-hidden font-sans">
      
      {/* Decorative background blur elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center animate-in-up">
        
        {/* Header / Logo */}
        <div className="mb-6 flex flex-col items-center w-full max-w-lg">
          <div className="w-20 h-20 bg-brand text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-brand/30 mb-6 transform hover:scale-105 transition-transform duration-300">
             <span className="text-4xl font-bold font-sans">ह</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-3">
            {lang === 'hi' ? 'हक़दार' : 'Haqdaar'}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 font-medium max-w-md">
            {t(lang, 'tagline')}
          </p>
        </div>

        {/* Action Center (Glass Card) */}
        <div className="glass w-full max-w-xl rounded-3xl p-6 md:p-8 shadow-xl shadow-brand/5 mb-8 flex flex-col items-center relative">
          
          {/* Language toggle */}
          <div className="absolute top-6 right-6 flex bg-white/80 p-1 rounded-full shadow-sm border border-gray-100">
            <button 
              onClick={() => setLang('hi')} 
              className={`px-4 py-1.5 rounded-full font-semibold text-xs transition-all ${lang === 'hi' ? 'bg-brand text-white shadow' : 'text-gray-500 hover:text-brand'}`}
            >
              हिन्दी
            </button>
            <button 
              onClick={() => setLang('en')} 
              className={`px-4 py-1.5 rounded-full font-semibold text-xs transition-all ${lang === 'en' ? 'bg-brand text-white shadow' : 'text-gray-500 hover:text-brand'}`}
            >
              EN
            </button>
          </div>

          <div className="w-full mt-8 md:mt-2">
            {voiceSupported ? (
              <div className="flex flex-col items-center mb-8">
                <div className="relative group cursor-pointer" onClick={() => { startChat(); setTimeout(startVoice, 500) }}>
                  <div className="absolute -inset-4 bg-brand rounded-full blur-md opacity-20 group-hover:opacity-40 animate-pulse-slow"></div>
                  <button
                    className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-brand to-teal-500 text-white flex items-center justify-center shadow-2xl hover:shadow-brand/50 transition-all duration-300 transform active:scale-95 z-10"
                    aria-label={t(lang, 'press_to_talk')}
                  >
                    <Mic className="w-10 h-10" />
                  </button>
                </div>
                <p className="mt-4 text-sm font-semibold text-brand-dark animate-pulse-slow">{lang === 'hi' ? 'बोलने के लिए टैप करें' : 'Tap to speak'}</p>
              </div>
            ) : null}

            <form className="w-full flex gap-2 relative" onSubmit={(e) => { e.preventDefault(); if (input.trim()) startChat(input) }}>
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder={lang === 'hi' ? 'या अपने परिवार के बारे में टाइप करें...' : 'Or type about your family here...'} 
                className="w-full bg-white/90 border-0 rounded-2xl pl-5 pr-4 py-4 focus:ring-2 focus:ring-brand/50 outline-none text-base shadow-sm transition-all" 
              />
              <button 
                type="submit" 
                disabled={!input.trim()} 
                className="bg-brand text-white w-14 rounded-2xl flex items-center justify-center disabled:opacity-40 transition-all hover:shadow-lg active:scale-95"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
          </div>
        </div>

        {/* Demo Personas Grid */}
        <div className="w-full max-w-3xl mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-brand-accent" />
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">{lang === 'hi' ? '1-क्लिक डेमो' : '1-Click Demo Personas'}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demoPersonas.map((p, i) => (
              <div 
                key={p.id} 
                onClick={() => startChat(p.prompt)}
                className="bg-white/60 hover:bg-white border border-white/40 shadow-sm hover:shadow-md transition-all rounded-2xl p-4 flex items-center gap-4 cursor-pointer group transform hover:-translate-y-1"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center shadow-inner group-hover:bg-teal-50 transition-colors">
                  {p.icon}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-gray-900">{p.name}</h4>
                  <p className="text-xs text-gray-500 font-medium">{p.role}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-brand transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* Live Metrics */}
        <div className="w-full max-w-2xl grid grid-cols-3 gap-4 border-t border-gray-200/50 pt-8">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-2xl md:text-3xl font-extrabold text-brand-dark mb-1">{s.value}</span>
              <span className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-widest">{s.label}</span>
            </div>
          ))}
        </div>

      </div>

      <div className="absolute bottom-4 flex items-center gap-1.5 text-xs font-medium text-gray-400 z-10">
        <ShieldCheck className="w-4 h-4" />
        <span>{t(lang, 'disclaimer')}</span>
      </div>
    </div>
  )
}
