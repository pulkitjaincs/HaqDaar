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
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl relative overflow-hidden">
      
      <header className="bg-brand text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-lg">
                ह
             </div>
             <h1 className="text-xl font-extrabold tracking-tight">{t(lang, 'app_name')}</h1>
          </div>
          
          <div className="flex gap-2">
            {results && (
              <button 
                onClick={() => setScreen('RESULTS')} 
                className="flex items-center gap-1.5 bg-brand-accent text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-sm hover:bg-orange-600 transition-all active:scale-95 animate-pulse-slow"
              >
                {t(lang, 'see_results')} 
                <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{numEligible}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <FamilyProfile 
        profile={profile} 
        profileOpen={profileOpen} 
        setProfileOpen={setProfileOpen} 
        lang={lang} 
        t={t} 
      />

      {/* Chat messages */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[url('/noise.png')] bg-repeat" role="log" aria-live="polite">
        
        {messages.length === 0 && !loading && (
           <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center animate-in">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                 <Mic className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-medium">Start describing your family...</p>
           </div>
        )}

        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in-up`} style={{ animationDuration: '0.3s' }}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 min-w-8 bg-brand rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 mt-auto shadow-sm">
                ह
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
              m.role === 'user' 
                ? 'bg-brand text-white rounded-br-sm' 
                : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              <p className="text-[15px] leading-relaxed font-medium whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start items-end animate-in-up">
            <div className="w-8 h-8 min-w-8 bg-brand rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 shadow-sm opacity-50">
                ह
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm text-brand flex gap-1.5 items-center h-[46px]">
              <div className="w-1.5 h-1.5 bg-brand/60 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-brand/60 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
              <div className="w-1.5 h-1.5 bg-brand/60 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-2" />
      </main>

      {/* Input footer */}
      <footer className="bg-white p-3 border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        <form className="flex gap-2 items-center" onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}>
          
          {voiceSupported && (
            <button 
              type="button" 
              onClick={isListening ? stopVoice : startVoice} 
              className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm flex-shrink-0 ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-red-500/30' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`} 
              aria-label={t(lang, 'press_to_talk')}
            >
              <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce-slow' : ''}`} />
            </button>
          )}
          
          <div className="relative flex-1">
             <input
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder={t(lang, 'type_here')}
               className="w-full bg-gray-100 border-none rounded-full px-5 py-3.5 focus:ring-2 focus:ring-brand/30 outline-none text-sm font-medium transition-all"
               aria-label={t(lang, 'type_here')}
             />
          </div>
          
          <button 
            type="submit" 
            disabled={!input.trim() || loading} 
            className="bg-brand text-white h-12 w-12 rounded-full flex items-center justify-center disabled:opacity-40 disabled:bg-gray-300 transition-all hover:shadow-md active:scale-95 flex-shrink-0" 
            aria-label="Send"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
        <div className="text-center mt-2.5 text-[10px] font-medium text-gray-400">{t(lang, 'disclaimer')}</div>
      </footer>
    </div>
  )
}
