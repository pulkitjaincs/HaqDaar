import { Mic, Send, Lightbulb, Search, Leaf } from 'lucide-react';

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
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-brand-light via-white to-[#e8f5e9] relative overflow-hidden">
      
      {/* Decorative background blur elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center animate-in-up">
        {/* Logo area */}
        <div className="mb-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-brand text-white rounded-3xl flex items-center justify-center shadow-xl shadow-brand/20 mb-6 transform hover:scale-105 transition-transform duration-300">
             <span className="text-4xl font-bold">ह</span>
          </div>
          <h1 className="text-5xl font-extrabold text-brand tracking-tight mb-2">{t(lang, 'app_name')}</h1>
          <p className="text-sm font-medium text-brand-dark/60 tracking-wide uppercase letter-spacing-wider">
            {lang === 'hi' ? 'हक़ का दावेदार' : 'The rightful claimant'}
          </p>
        </div>

        <p className="text-lg text-gray-700 mb-8 leading-relaxed font-medium">
          {t(lang, 'tagline')}
        </p>

        {/* Language toggle */}
        <div className="flex bg-white/60 backdrop-blur-md p-1 rounded-full shadow-sm border border-gray-200 mb-10">
          <button 
            onClick={() => setLang('hi')} 
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${lang === 'hi' ? 'bg-brand text-white shadow-md' : 'text-gray-600 hover:text-brand'}`}
          >
            हिन्दी
          </button>
          <button 
            onClick={() => setLang('en')} 
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${lang === 'en' ? 'bg-brand text-white shadow-md' : 'text-gray-600 hover:text-brand'}`}
          >
            English
          </button>
        </div>

        {/* Mic button */}
        {voiceSupported ? (
          <div className="relative mb-8 group">
            <div className="absolute -inset-1 bg-brand rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
            <button
              onClick={() => { startChat(); setTimeout(startVoice, 500) }}
              className="relative w-24 h-24 rounded-full bg-brand text-white flex items-center justify-center shadow-2xl hover:bg-brand-dark transition-all duration-300 transform active:scale-95"
              aria-label={t(lang, 'press_to_talk')}
            >
              <Mic className="w-10 h-10" />
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mb-6 bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
            {t(lang, 'mic_unsupported')}
          </p>
        )}

        {/* Text input */}
        <form className="w-full flex gap-2 mb-8 relative" onSubmit={(e) => { e.preventDefault(); if (input.trim()) startChat(input) }}>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder={t(lang, 'type_here')} 
              className="w-full bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl pl-11 pr-4 py-4 focus:ring-2 focus:ring-brand/50 focus:border-brand/50 outline-none text-base shadow-sm transition-all" 
            />
          </div>
          <button 
            type="submit" 
            disabled={!input.trim()} 
            className="bg-brand text-white w-14 rounded-2xl flex items-center justify-center disabled:opacity-40 disabled:bg-gray-300 transition-all hover:shadow-lg active:scale-95"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>

        {/* Prompts */}
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Lightbulb className="w-4 h-4 text-brand-accent" />
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t(lang, 'or_try')}</p>
          </div>
          {['example_1', 'example_2', 'example_3'].map((key, i) => (
            <button 
              key={key} 
              onClick={() => startChat(t(lang, key))} 
              className="text-left bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-gray-100 text-gray-700 hover:border-brand-accent/50 hover:shadow-md transition-all text-sm leading-relaxed group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-green-50 p-1.5 rounded-lg text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                  <Leaf className="w-4 h-4" />
                </div>
                <span className="flex-1 font-medium text-gray-600 group-hover:text-gray-900">"{t(lang, key)}"</span>
              </div>
            </button>
          ))}
        </div>

      </div>

      <p className="absolute bottom-6 text-[11px] font-medium text-gray-400 max-w-xs text-center z-10 opacity-70">
        {t(lang, 'disclaimer')}
      </p>
    </div>
  )
}
