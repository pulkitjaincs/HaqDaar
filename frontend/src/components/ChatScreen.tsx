import { useEffect, useRef } from 'react';
import { Mic, Send, ArrowRight } from 'lucide-react';
import FamilyProfile from './FamilyProfile';

interface ChatScreenProps {
  lang: string;
  messages: { role: string; content: string }[];
  loading: boolean;
  profile: any;
  results: any[] | null;
  input: string;
  setInput: (val: string) => void;
  sendMessage: (msg: string) => void;
  voiceSupported: boolean;
  isListening: boolean;
  startVoice: () => void;
  stopVoice: () => void;
  setScreen: (screen: 'START' | 'CHAT' | 'RESULTS' | 'DETAIL') => void;
  profileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
  t: (lang: string, key: string, vars?: any) => string;
}

export default function ChatScreen({
  lang, messages, loading, profile, results, input, setInput, sendMessage,
  voiceSupported, isListening, startVoice, stopVoice, setScreen,
  profileOpen, setProfileOpen, t
}: ChatScreenProps) {
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const numEligible = results?.filter(r => r.status === 'ELIGIBLE').length || 0;

  return (
    <div className="min-h-screen bg-brand-light flex flex-col md:flex-row max-w-7xl mx-auto shadow-2xl relative overflow-hidden font-sans">
      
      {/* Mobile-only sliding profile */}
      <div className="md:hidden z-40">
        <FamilyProfile 
          profile={profile} 
          profileOpen={profileOpen} 
          setProfileOpen={setProfileOpen} 
          lang={lang} 
          t={t} 
        />
      </div>

      {/* Main Chat Column (Left on Desktop, Full on Mobile) */}
      <div className="flex-1 flex flex-col relative h-screen">
        
        {/* Premium Header */}
        <header className="glass-dark text-white p-4 sticky top-0 z-30 shadow-md flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center font-bold text-lg backdrop-blur-sm border border-white/10">
                  ह
               </div>
               <h1 className="text-xl font-extrabold tracking-tight">{t(lang, 'app_name')}</h1>
            </div>
            
            <div className="flex gap-2">
              {results && (
                <button 
                  onClick={() => setScreen('RESULTS')} 
                  className="flex items-center gap-1.5 bg-brand-accent text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-brand-accent/20 hover:bg-orange-500 transition-all active:scale-95 animate-pulse-slow"
                >
                  {t(lang, 'see_results')} 
                  <span className="bg-white/30 px-1.5 py-0.5 rounded-full text-xs">{numEligible}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Chat messages */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 bg-transparent" role="log" aria-live="polite">
          
          {messages.length === 0 && !loading && (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center animate-in">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                   <Mic className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-base font-semibold">Start describing your family...</p>
             </div>
          )}

          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in-up`} style={{ animationDuration: '0.4s' }}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 min-w-8 bg-brand-dark rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 mt-auto shadow-sm">
                  ह
                </div>
              )}
              <div className={`max-w-[85%] md:max-w-[70%] rounded-[1.25rem] px-5 py-4 shadow-md border ${
                m.role === 'user' 
                  ? 'bg-gradient-to-br from-brand to-teal-600 text-white rounded-br-sm border-brand/50' 
                  : 'glass text-gray-800 rounded-bl-sm border-white/60'
              }`}>
                <p className="text-[15px] md:text-base leading-relaxed font-medium whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start items-end animate-in-up">
              <div className="w-8 h-8 min-w-8 bg-brand-dark rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 shadow-sm opacity-50">
                  ह
              </div>
              <div className="glass border border-white/60 rounded-[1.25rem] rounded-bl-sm px-5 py-4 shadow-sm text-brand flex gap-1.5 items-center h-[48px]">
                <div className="w-2 h-2 bg-brand/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-brand/60 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                <div className="w-2 h-2 bg-brand/60 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-4" />
        </main>

        {/* Input footer */}
        <footer className="glass p-3 md:p-4 border-t border-white/50 shadow-[0_-8px_20px_-5px_rgba(0,0,0,0.05)] z-20 flex-shrink-0">
          <form className="flex gap-2 items-center" onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}>
            
            {voiceSupported && (
              <div className="relative flex-shrink-0">
                {isListening && <div className="absolute inset-0 bg-red-500 rounded-full animate-ripple"></div>}
                <button 
                  type="button" 
                  onClick={isListening ? stopVoice : startVoice} 
                  className={`relative h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm z-10 ${
                    isListening 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                  }`} 
                  aria-label={t(lang, 'press_to_talk')}
                >
                  <Mic className={`w-5 h-5 md:w-6 md:h-6 ${isListening ? 'animate-bounce-slow' : ''}`} />
                </button>
              </div>
            )}
            
            <div className="relative flex-1">
               <input
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 placeholder={t(lang, 'type_here')}
                 className="w-full bg-white/80 border border-gray-200/50 rounded-full px-5 py-3.5 md:py-4 focus:ring-2 focus:ring-brand/30 outline-none text-sm md:text-base font-medium transition-all shadow-inner"
                 aria-label={t(lang, 'type_here')}
               />
            </div>
            
            <button 
              type="submit" 
              disabled={!input.trim() || loading} 
              className="bg-brand text-white h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center disabled:opacity-40 transition-all hover:shadow-lg active:scale-95 flex-shrink-0" 
              aria-label="Send"
            >
              <Send className="w-5 h-5 md:w-6 md:h-6 ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-2.5 text-[10px] md:text-xs font-semibold text-gray-400">{t(lang, 'disclaimer')}</div>
        </footer>
      </div>

      {/* Desktop Persistent Profile Sidebar */}
      <div className="hidden md:flex w-80 lg:w-96 border-l border-white/60 bg-white/40 flex-col h-screen overflow-hidden">
        {/* We trick FamilyProfile to always be open in desktop view by wrapping it */}
        <div className="h-full w-full overflow-y-auto custom-scrollbar">
           <FamilyProfile 
            profile={profile} 
            profileOpen={true} 
            setProfileOpen={() => {}} // Can't close on desktop
            lang={lang} 
            t={t} 
          />
        </div>
      </div>
    </div>
  )
}
