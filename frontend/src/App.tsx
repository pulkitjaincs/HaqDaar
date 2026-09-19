import { useState, useRef, useEffect, useCallback } from 'react'
import en from './i18n/en.json'
import hi from './i18n/hi.json'

const i18n: Record<string, Record<string, string>> = { en, hi }

type ScreenState = 'START' | 'CHAT' | 'RESULTS' | 'DETAIL'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Scheme catalog cache (fetched once)
let schemeCatalog: any[] = []

function t(lang: string, key: string, vars?: Record<string, string | number>): string {
  let s = i18n[lang]?.[key] || i18n['en']?.[key] || key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(`{${k}}`, String(v))
    }
  }
  return s
}

function getSchemeInfo(schemeId: string): any {
  return schemeCatalog.find(s => s.id === schemeId) || null
}

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('START')
  const [lang, setLang] = useState('hi')
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [profile, setProfile] = useState<any>({ household: {}, members: [] })
  const [results, setResults] = useState<any[] | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedScheme, setSelectedScheme] = useState<any>(null)
  const [selectedResult, setSelectedResult] = useState<any>(null)
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [profileOpen, setProfileOpen] = useState(true)

  const bottomRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Fetch scheme catalog on mount
  useEffect(() => {
    fetch(`${API_URL}/schemes`)
      .then(r => r.json())
      .then(data => { schemeCatalog = data })
      .catch(() => {})
  }, [])

  // Check voice support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setVoiceSupported(!!SpeechRecognition)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startVoice = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setInput(transcript)
    }

    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [lang])

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const startChat = (msg?: string) => {
    setScreen('CHAT')
    if (msg) {
      sendMessage(msg)
    }
  }

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    const newMsgs = [...messages, { role: 'user', content: text }]
    setMessages(newMsgs)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: text, lang })
      })
      const data = await res.json()

      if (data.error) {
        setMessages([...newMsgs, { role: 'assistant', content: t(lang, 'network_error') }])
      } else {
        setSessionId(data.session_id)
        setProfile(data.profile)
        setMessages([...newMsgs, { role: 'assistant', content: data.reply }])
        if (data.results) {
          setResults(data.results)
        }
      }
    } catch {
      setMessages([...newMsgs, { role: 'assistant', content: t(lang, 'network_error') }])
    }
    setLoading(false)
  }

  const openDetail = (result: any) => {
    const scheme = getSchemeInfo(result.scheme_id)
    setSelectedScheme(scheme)
    setSelectedResult(result)
    setScreen('DETAIL')
  }

  // ────────────────── START SCREEN ──────────────────
  if (screen === 'START') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-green-50 to-orange-50">
        <div className="mb-6">
          <h1 className="text-5xl font-bold text-brand mb-1">{t(lang, 'app_name')}</h1>
          <p className="text-sm text-gray-500 italic">"{lang === 'hi' ? 'हक़दार — जो हक़ का दावेदार है' : 'The rightful claimant'}"</p>
        </div>
        <p className="text-lg text-gray-700 mb-8 max-w-sm leading-relaxed">{t(lang, 'tagline')}</p>

        {/* Language toggle */}
        <div className="flex gap-3 mb-8">
          <button onClick={() => setLang('hi')} className={`px-5 py-2.5 rounded-full font-semibold text-base transition-all ${lang === 'hi' ? 'bg-brand text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300'}`}>
            हिन्दी
          </button>
          <button onClick={() => setLang('en')} className={`px-5 py-2.5 rounded-full font-semibold text-base transition-all ${lang === 'en' ? 'bg-brand text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300'}`}>
            English
          </button>
        </div>

        {/* Mic button */}
        {voiceSupported && (
          <button
            onClick={() => { startChat(); setTimeout(startVoice, 500) }}
            className="w-20 h-20 rounded-full bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/30 hover:bg-brand-dark transition active:scale-95 mb-4"
            aria-label={t(lang, 'press_to_talk')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </button>
        )}
        {!voiceSupported && <p className="text-xs text-gray-400 mb-4">{t(lang, 'mic_unsupported')}</p>}

        {/* Text input */}
        <form className="w-full max-w-sm flex gap-2 mb-6" onSubmit={(e) => { e.preventDefault(); if (input.trim()) startChat(input) }}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t(lang, 'type_here')} className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-3 focus:ring-2 focus:ring-brand outline-none text-base" />
          <button type="submit" disabled={!input.trim()} className="bg-brand text-white h-12 w-12 rounded-full flex items-center justify-center disabled:opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>

        {/* 3 example prompts */}
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <p className="text-sm text-gray-500">{t(lang, 'or_try')}</p>
          {['example_1', 'example_2', 'example_3'].map((key) => (
            <button key={key} onClick={() => startChat(t(lang, key))} className="text-left bg-white p-3 rounded-xl shadow-sm border border-gray-200 text-gray-700 hover:border-brand-accent hover:shadow-md transition text-sm leading-relaxed">
              "{t(lang, key)}"
            </button>
          ))}
        </div>

        <p className="mt-8 text-[11px] text-gray-400 max-w-xs">{t(lang, 'disclaimer')}</p>
      </div>
    )
  }

  // ────────────────── SCHEME DETAIL SCREEN ──────────────────
  if (screen === 'DETAIL' && selectedScheme && selectedResult) {
    const scheme = selectedScheme
    const result = selectedResult
    return (
      <div className="min-h-screen bg-brand-light flex flex-col">
        <header className="bg-brand text-white p-4 sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <button onClick={() => setScreen('RESULTS')} className="text-white" aria-label="Back">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <h1 className="text-lg font-bold truncate">{scheme.name?.[lang] || scheme.name?.en || scheme.id}</h1>
          </div>
        </header>

        <main className="flex-1 p-4 max-w-md w-full mx-auto pb-8 space-y-5">
          {/* Benefit */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-base text-gray-800 leading-relaxed">{scheme.benefit?.[lang] || scheme.benefit?.en}</p>
          </div>

          {/* Status badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${result.status === 'ELIGIBLE' ? 'bg-green-100 text-green-800' : result.status === 'ONE_STEP_AWAY' ? 'bg-orange-100 text-orange-800' : result.status === 'CHECK_OFFICIALLY' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
            {result.status === 'ELIGIBLE' ? '✅' : result.status === 'ONE_STEP_AWAY' ? '⚠️' : result.status === 'CHECK_OFFICIALLY' ? 'ℹ️' : '❌'}
            {result.status.replace(/_/g, ' ')}
          </div>

          {/* Near-miss action */}
          {result.status === 'ONE_STEP_AWAY' && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
              <p className="font-semibold text-orange-800 mb-1">{t(lang, 'action')}:</p>
              <p className="text-orange-700">{result.action || t(lang, 'wait_years', { n: result.eligible_in_years || '?' })}</p>
            </div>
          )}

          {/* Why you qualify */}
          {result.why && result.why.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">{t(lang, 'why_you_qualify')}</h3>
              <ul className="space-y-2">
                {result.why.map((w: any, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 ${w.result === 'PASS' ? 'text-green-600' : w.result === 'FAIL' ? 'text-red-500' : 'text-gray-400'}`}>
                      {w.result === 'PASS' ? '✓' : w.result === 'FAIL' ? '✗' : '?'}
                    </span>
                    <span className="text-gray-700">{w.criterion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Documents */}
          {scheme.documents && (
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">{t(lang, 'documents_needed')}</h3>
              <ul className="space-y-2">
                {scheme.documents.map((doc: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" className="w-4 h-4 accent-brand rounded" id={`doc-${i}`} />
                    <label htmlFor={`doc-${i}`} className="capitalize">{doc.replace(/_/g, ' ')}</label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Steps */}
          {scheme.steps && (
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">{t(lang, 'steps')}</h3>
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-700">
                {(scheme.steps?.[lang] || scheme.steps?.en || []).map((step: string, i: number) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Where to apply */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="font-bold text-gray-900 mb-2">{t(lang, 'where_to_apply')}</h3>
            <p className="text-sm text-gray-700">{scheme.apply?.where?.[lang] || scheme.apply?.where?.en}</p>
            {scheme.apply?.url && (
              <a href={scheme.apply.url} target="_blank" rel="noopener noreferrer" className="text-brand underline text-sm mt-1 block">{t(lang, 'official_link')} ↗</a>
            )}
          </div>

          {/* Verification chip */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className={`inline-block w-2 h-2 rounded-full ${scheme.source?.status === 'VERIFIED' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            {scheme.source?.verified_on ? `${t(lang, 'verified_on')}: ${scheme.source.verified_on}` : t(lang, 'being_verified')}
            {' · '}{scheme.source?.status || 'PROVISIONAL'}
          </div>
        </main>
      </div>
    )
  }

  // ────────────────── RESULTS SCREEN ──────────────────
  if (screen === 'RESULTS' && results) {
    const eligible = results.filter(r => r.status === 'ELIGIBLE')
    const oneStep = results.filter(r => r.status === 'ONE_STEP_AWAY')
    const checkOff = results.filter(r => r.status === 'CHECK_OFFICIALLY')
    const notElig = results.filter(r => r.status === 'NOT_ELIGIBLE')

    const SchemeCard = ({ r, borderColor, borderLeft }: { r: any, borderColor: string, borderLeft: string }) => {
      const scheme = getSchemeInfo(r.scheme_id)
      const memberName = r.member_id === 'household' ? t(lang, 'household') : (profile.members?.find((m: any) => m.id === r.member_id)?.relation || r.member_id)
      return (
        <button onClick={() => openDetail(r)} className={`w-full text-left bg-white p-4 rounded-xl shadow-sm border ${borderColor} border-l-4 ${borderLeft} hover:shadow-md transition`}>
          <div className="text-xs text-gray-500 mb-1">{t(lang, 'for_member')}: {memberName}{r.via_member ? ` (via ${r.via_member})` : ''}</div>
          <h4 className="font-bold text-lg text-gray-900">{scheme?.name?.[lang] || scheme?.name?.en || r.scheme_id}</h4>
          <p className="text-sm text-gray-600 mt-1">{scheme?.benefit?.[lang] || scheme?.benefit?.en || ''}</p>
          {/* Verification chip */}
          <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
            <span className={`w-1.5 h-1.5 rounded-full ${scheme?.source?.status === 'VERIFIED' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            {scheme?.source?.verified_on ? `${t(lang, 'verified_on')}: ${scheme.source.verified_on}` : t(lang, 'being_verified')}
          </div>
          {r.status === 'ONE_STEP_AWAY' && (
            <div className="bg-orange-50 text-orange-800 p-2 rounded text-sm mt-2">
              <strong>{t(lang, 'action')}:</strong> {r.action || t(lang, 'wait_years', { n: r.eligible_in_years || '?' })}
            </div>
          )}
        </button>
      )
    }

    return (
      <div className="min-h-screen bg-brand-light flex flex-col">
        <header className="bg-brand text-white p-4 sticky top-0 z-10 shadow-md">
          <div className="flex justify-between items-center max-w-md mx-auto">
            <h1 className="text-xl font-bold">{t(lang, 'app_name')}</h1>
            <button onClick={() => setScreen('CHAT')} className="text-brand-accent font-semibold text-sm">{t(lang, 'back_to_chat')}</button>
          </div>
        </header>

        <main className="flex-1 p-4 max-w-md w-full mx-auto pb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-2">{t(lang, 'your_results')}</h2>

          {/* Eligible Now */}
          <section className="mb-6">
            <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-sm font-bold">{eligible.length}</span>
              {t(lang, 'eligible_now')}
            </h3>
            <div className="flex flex-col gap-3">
              {eligible.map((r, i) => <SchemeCard key={i} r={r} borderColor="border-green-200" borderLeft="border-l-green-600" />)}
              {eligible.length === 0 && <p className="text-gray-500 text-sm">{t(lang, 'none_found')}</p>}
            </div>
          </section>

          {/* One Step Away */}
          <section className="mb-6">
            <h3 className="text-lg font-bold text-orange-700 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center text-sm font-bold">{oneStep.length}</span>
              {t(lang, 'one_step_away')}
            </h3>
            <div className="flex flex-col gap-3">
              {oneStep.map((r, i) => <SchemeCard key={i} r={r} borderColor="border-orange-200" borderLeft="border-l-orange-500" />)}
              {oneStep.length === 0 && <p className="text-gray-500 text-sm">{t(lang, 'none_found')}</p>}
            </div>
          </section>

          {/* Check Officially */}
          <section className="mb-6">
            <h3 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-sm font-bold">{checkOff.length}</span>
              {t(lang, 'check_officially')}
            </h3>
            <div className="flex flex-col gap-3">
              {checkOff.map((r, i) => <SchemeCard key={i} r={r} borderColor="border-blue-200" borderLeft="border-l-blue-500" />)}
              {checkOff.length === 0 && <p className="text-gray-500 text-sm">{t(lang, 'none_found')}</p>}
            </div>
          </section>

          {/* Not Eligible (collapsible) */}
          {notElig.length > 0 && (
            <details className="mb-6">
              <summary className="text-lg font-bold text-gray-500 mb-3 cursor-pointer flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold">{notElig.length}</span>
                {t(lang, 'not_eligible')}
              </summary>
              <div className="flex flex-col gap-3 mt-3">
                {notElig.map((r, i) => <SchemeCard key={i} r={r} borderColor="border-gray-200" borderLeft="border-l-gray-400" />)}
              </div>
            </details>
          )}

          {/* Print/PDF Button */}
          <button onClick={() => window.print()} className="w-full bg-brand text-white py-3 rounded-xl font-bold shadow-md mt-4 active:scale-95 transition">
            {t(lang, 'print_pack')}
          </button>

          <p className="text-center text-[11px] text-gray-400 mt-4">{t(lang, 'disclaimer')}</p>
          <p className="text-center text-[11px] text-gray-400">{t(lang, 'privacy_note')}</p>
        </main>
      </div>
    )
  }

  // ────────────────── CHAT SCREEN ──────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto shadow-xl relative">
      <header className="bg-brand text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">{t(lang, 'app_name')}</h1>
          <div className="flex gap-2">
            {results && (
              <button onClick={() => setScreen('RESULTS')} className="bg-brand-accent text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-sm animate-pulse">
                {t(lang, 'see_results')} ({results.filter(r => r.status === 'ELIGIBLE').length})
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Live Family Profile Card (collapsible) */}
      <div className="bg-gradient-to-r from-green-50 to-orange-50 border-b border-gray-200">
        <button onClick={() => setProfileOpen(!profileOpen)} className="w-full p-3 flex items-center justify-between text-xs">
          <span className="font-semibold text-brand-dark">
            👨‍👩‍👧‍👦 Family Profile ({profile.members?.length || 0})
          </span>
          <span className="text-gray-400">{profileOpen ? '▲' : '▼'}</span>
        </button>
        {profileOpen && (
          <div className="px-3 pb-3 space-y-2 animate-in">
            {profile.members?.length === 0 && <span className="text-gray-400 text-xs">{t(lang, 'profile_placeholder')}</span>}
            <div className="flex flex-wrap gap-2">
              {profile.members?.map((m: any, i: number) => (
                <div key={i} className="inline-flex items-center bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 shadow-sm text-xs gap-1.5 transition-all">
                  <span className="font-semibold text-brand-dark capitalize">{m.relation || m.name || 'Member'}</span>
                  {m.age != null && <span className="text-gray-500">({m.age})</span>}
                  {m.gender && <span className="text-gray-400">· {m.gender === 'female' ? '♀' : '♂'}</span>}
                  {m.occupation && <span className="text-gray-500">· {m.occupation.replace(/_/g, ' ')}</span>}
                </div>
              ))}
            </div>
            {/* Household facts */}
            {(profile.household?.state || profile.household?.ration_card || profile.household?.owns_agri_land != null) && (
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                {profile.household.state && <span className="bg-brand/10 text-brand-dark px-2 py-0.5 rounded-full">📍 {profile.household.state}</span>}
                {profile.household.area_type && <span className="bg-brand/10 text-brand-dark px-2 py-0.5 rounded-full">{profile.household.area_type}</span>}
                {profile.household.ration_card && <span className="bg-brand/10 text-brand-dark px-2 py-0.5 rounded-full uppercase">🪪 {profile.household.ration_card}</span>}
                {profile.household.owns_agri_land && <span className="bg-brand/10 text-brand-dark px-2 py-0.5 rounded-full">🌾 Agri land</span>}
                {profile.household.has_lpg_connection === false && <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full">No LPG</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat messages */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50" role="log" aria-live="polite">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.role === 'user' ? 'bg-brand text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'}`}>
              <p className="text-[16px] leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start" aria-live="assertive">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm text-gray-400 flex gap-1">
              <span className="animate-bounce">·</span><span className="animate-bounce" style={{animationDelay: '0.1s'}}>·</span><span className="animate-bounce" style={{animationDelay: '0.2s'}}>·</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* Input footer */}
      <footer className="bg-white p-3 border-t border-gray-200">
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}>
          {voiceSupported && (
            <button type="button" onClick={isListening ? stopVoice : startVoice} className={`h-12 w-12 rounded-full flex items-center justify-center transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600'}`} aria-label={t(lang, 'press_to_talk')}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t(lang, 'type_here')}
            className="flex-1 bg-gray-100 border-none rounded-full px-4 py-3 focus:ring-2 focus:ring-brand outline-none text-base"
            aria-label={t(lang, 'type_here')}
          />
          <button type="submit" disabled={!input.trim() || loading} className="bg-brand text-white h-12 w-12 rounded-full flex items-center justify-center disabled:opacity-50 active:scale-95 transition" aria-label="Send">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
        <div className="text-center mt-2 text-[10px] text-gray-400">{t(lang, 'disclaimer')}</div>
      </footer>
    </div>
  )
}
