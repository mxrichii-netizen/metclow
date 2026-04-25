import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import './i18n/index.js';
import './App.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function ChatApp() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiProvider, setAiProvider] = useState('groq');
  const [user, setUser] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleLoginSuccess = (credentialResponse) => {
    console.log('Login başarılı:', credentialResponse);
    setUser({ name: 'Kullanıcı', token: credentialResponse.credential });
  };

  const handleLogout = () => {
    setUser(null);
    setMessages([]);
    setInput('');
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/chat', {
        messages: newMessages,
        language: i18n.language,
        provider: aiProvider,
      });
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages([...newMessages, {
        role: 'assistant',
        content: i18n.language === 'tr' ? '❌ Bağlantı hatası.' : '❌ Connection error.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => { setMessages([]); setInput(''); };

  // Login ekranı
  if (!user) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #020208 0%, #0d0d1f 100%)',
        gap: '2rem'
      }}>
        <div style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 0 60px rgba(124, 58, 237, 0.4)'
          }}>
            <img src="/logo.png" alt="Metclow" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 style={{
            fontSize: '32px',
            fontFamily: "'Orbitron', monospace",
            background: 'linear-gradient(135deg, #c026d3, #7c3aed, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '3px',
            margin: 0
          }}>
            METCLOW AI
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6666aa',
            margin: 0,
            fontFamily: "'Rajdhani', sans-serif"
          }}>
            Intelligence. Innovation. Impact.
          </p>
        </div>

        <div style={{
          background: 'rgba(13, 13, 31, 0.8)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          borderRadius: '16px',
          padding: '2rem',
          backdropFilter: 'blur(20px)'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#e8e8ff',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontFamily: "'Rajdhani', sans-serif"
          }}>
            Başlamak için Google hesabınızla giriş yapın
          </p>
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => console.log('Login failed')}
            theme="dark"
            size="large"
          />
        </div>
      </div>
    );
  }

  // Chat ekranı
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <img src="/logo.png" alt="Metclow" />
            </div>
            METCLOW
          </div>
          <button className="new-chat-btn" onClick={newChat}>{t('newChat')}</button>
        </div>

        <div className="sidebar-section">Özellikler</div>
        <div className="sidebar-links">
          {[
            { icon: '💬', label: i18n.language === 'tr' ? 'Sohbet' : 'Chat' },
            { icon: '✍️', label: i18n.language === 'tr' ? 'İçerik Üret' : 'Create Content' },
            { icon: '📧', label: i18n.language === 'tr' ? 'Mail Yaz' : 'Write Email' },
            { icon: '💻', label: i18n.language === 'tr' ? 'Kod Yaz' : 'Write Code' },
            { icon: '🌐', label: i18n.language === 'tr' ? 'Çeviri' : 'Translate' },
          ].map((item, i) => (
            <div key={i} className={`sidebar-link ${i === 0 ? 'active' : ''}`}
              onClick={() => setInput(item.label)}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div style={{marginBottom: '1rem'}}>
            <div style={{fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', fontFamily: "'Orbitron', monospace"}}>AI Model</div>
            <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
              <button 
                onClick={() => setAiProvider('groq')}
                style={{
                  flex: '1 1 calc(50% - 3px)',
                  padding: '8px',
                  borderRadius: '8px',
                  border: aiProvider === 'groq' ? '1px solid var(--cyan)' : '1px solid var(--border)',
                  background: aiProvider === 'groq' ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                  color: aiProvider === 'groq' ? 'var(--cyan)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                  fontFamily: "'Rajdhani', sans-serif",
                  transition: 'all 0.3s',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Groq
              </button>
              <button 
                onClick={() => setAiProvider('gemini')}
                style={{
                  flex: '1 1 calc(50% - 3px)',
                  padding: '8px',
                  borderRadius: '8px',
                  border: aiProvider === 'gemini' ? '1px solid var(--cyan)' : '1px solid var(--border)',
                  background: aiProvider === 'gemini' ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                  color: aiProvider === 'gemini' ? 'var(--cyan)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                  fontFamily: "'Rajdhani', sans-serif",
                  transition: 'all 0.3s',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Gemini
              </button>
              <button 
                onClick={() => setAiProvider('claude')}
                style={{
                  flex: '1 1 100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: aiProvider === 'claude' ? '1px solid var(--cyan)' : '1px solid var(--border)',
                  background: aiProvider === 'claude' ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                  color: aiProvider === 'claude' ? 'var(--cyan)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                  fontFamily: "'Rajdhani', sans-serif",
                  transition: 'all 0.3s',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Claude
              </button>
            </div>
          </div>

          <div className="lang-switcher">
            <button onClick={() => i18n.changeLanguage('tr')} className={i18n.language === 'tr' ? 'active' : ''}>TR</button>
            <button onClick={() => i18n.changeLanguage('en')} className={i18n.language === 'en' ? 'active' : ''}>EN</button>
          </div>

          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              marginTop: '1rem',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              fontFamily: "'Rajdhani', sans-serif",
              transition: 'all 0.3s',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      <div className="chat-container">
        <div className="chat-topbar">
          <span className="chat-topbar-title">METCLOW AI — v1.2</span>
          <span className="status-dot">Online</span>
        </div>

        <main className="chat-area">
          {messages.length === 0 && (
            <div className="welcome-screen">
              <div className="welcome-icon">
                <img src="/logo.png" alt="Metclow" />
              </div>
              <div className="welcome-title">METCLOW AI</div>
              <p className="welcome-text">{t('welcome')}</p>
              <div className="welcome-chips">
                {['Kod yaz', 'Mail hazırla', 'Fikir üret', 'Analiz et', 'Çeviri yap'].map(chip => (
                  <button key={chip} className="chip" onClick={() => setInput(chip)}>{chip}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role}`}>
              <div className="bubble-content">{m.content}</div>
            </div>
          ))}
          {loading && (
            <div className="bubble assistant">
              <div className="bubble-content thinking">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </main>

        <footer className="input-area">
          <div className="input-wrapper">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
              placeholder={t('placeholder')}
              rows={1}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()} className="send-btn">↑</button>
          </div>
          <p className="input-hint">INTELLIGENCE · INNOVATION · IMPACT</p>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ChatApp />
    </GoogleOAuthProvider>
  );
}