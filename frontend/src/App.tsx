import { useState, useEffect } from 'react';
import en from './i18n/en.json';
import hi from './i18n/hi.json';
import StartScreen from './components/StartScreen';
import ChatScreen from './components/ChatScreen';
import ResultsScreen from './components/ResultsScreen';
import SchemeDetail from './components/SchemeDetail';
import { useVoice } from './hooks/useVoice';

const i18n: Record<string, Record<string, string>> = { en, hi };
type ScreenState = 'START' | 'CHAT' | 'RESULTS' | 'DETAIL';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let schemeCatalog: any[] = [];

function t(lang: string, key: string, vars?: Record<string, string | number>): string {
  let s = i18n[lang]?.[key] || i18n['en']?.[key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(`{${k}}`, String(v));
    }
  }
  return s;
}

function getSchemeInfo(schemeId: string): any {
  return schemeCatalog.find(s => s.id === schemeId) || null;
}

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('START');
  const [lang, setLang] = useState('hi');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [profile, setProfile] = useState<any>({ household: {}, members: [] });
  const [results, setResults] = useState<any[] | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<any>(null);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(true);

  const { isListening, isSupported: voiceSupported, startListening: startVoice, stopListening: stopVoice } = useVoice(lang, setInput);

  useEffect(() => {
    fetch(`${API_URL}/schemes`)
      .then(r => r.json())
      .then(data => { schemeCatalog = data })
      .catch(() => {});
  }, []);

  const startChat = (msg?: string) => {
    setScreen('CHAT');
    if (msg) {
      sendMessage(msg);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const newMsgs = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: text, lang })
      });
      const data = await res.json();

      if (data.error) {
        setMessages([...newMsgs, { role: 'assistant', content: t(lang, 'network_error') }]);
      } else {
        setSessionId(data.session_id);
        setProfile(data.profile);
        setMessages([...newMsgs, { role: 'assistant', content: data.reply }]);
        if (data.results) {
          setResults(data.results);
        }
      }
    } catch {
      setMessages([...newMsgs, { role: 'assistant', content: t(lang, 'network_error') }]);
    }
    setLoading(false);
  };

  const openDetail = (result: any) => {
    const scheme = getSchemeInfo(result.scheme_id);
    setSelectedScheme(scheme);
    setSelectedResult(result);
    setScreen('DETAIL');
  };

  if (screen === 'START') {
    return <StartScreen 
      lang={lang} setLang={setLang} voiceSupported={voiceSupported} 
      input={input} setInput={setInput} startChat={startChat} startVoice={startVoice} t={t} 
    />;
  }

  if (screen === 'CHAT') {
    return <ChatScreen 
      lang={lang} messages={messages} loading={loading} profile={profile} results={results}
      input={input} setInput={setInput} sendMessage={sendMessage} voiceSupported={voiceSupported}
      isListening={isListening} startVoice={startVoice} stopVoice={stopVoice} setScreen={setScreen}
      profileOpen={profileOpen} setProfileOpen={setProfileOpen} t={t}
    />;
  }

  if (screen === 'RESULTS' && results) {
    return <ResultsScreen 
      lang={lang} results={results} profile={profile} setScreen={setScreen} 
      openDetail={openDetail} getSchemeInfo={getSchemeInfo} t={t} 
    />;
  }

  if (screen === 'DETAIL' && selectedScheme && selectedResult) {
    return <SchemeDetail 
      lang={lang} scheme={selectedScheme} result={selectedResult} setScreen={setScreen} t={t} 
    />;
  }

  return null;
}
