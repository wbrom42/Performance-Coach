// app.jsx — main Performance Coach v2 app

const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#4f8fff",
  "checkinVariant": "numeric",
  "density": "default",
  "mode": "dark"
}/*EDITMODE-END*/;

function makeTheme(mode, accentKey) {
  const accent = ACCENT_PALETTES[accentKey].primary;
  if (mode === 'light') {
    return {
      pageBg: '#F2F2F7',
      bg: '#F7F7F8',
      card: '#FFFFFF',
      subtleBg: '#F1F2F5',
      border: '#E5E6EB',
      subtleBorder: '#EDEEF2',
      text: '#0F1117',
      secondary: '#3a3f52',
      muted: '#8b90a3',
      accent,
      tabBg: 'rgba(247,247,248,0.85)',
    };
  }
  return {
    pageBg: '#0a0b10',
    bg: '#0f1117',
    card: '#16192a',
    subtleBg: '#191c2e',
    border: '#262a3d',
    subtleBorder: '#222538',
    text: '#e8eaf0',
    secondary: '#b8bccc',
    muted: '#6a6f85',
    accent,
    tabBg: 'rgba(15,17,23,0.85)',
  };
}

// ─────────────────────────────────────────────────────────────
// Bottom tab bar
// ─────────────────────────────────────────────────────────────
function TabBar({ active, onChange, theme, accent }) {
  const tabs = [
    { id: 'dashboard', label: 'Home',
      icon: (c) => <svg width="22" height="22" viewBox="0 0 22 22"><path d="M3 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H4a1 1 0 0 1-1-1z" stroke={c} strokeWidth="1.6" fill="none" strokeLinejoin="round"/></svg>
    },
    { id: 'checkin', label: 'Check-in',
      icon: (c) => <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="8" stroke={c} strokeWidth="1.6" fill="none"/><path d="M7 11.5l2.5 2.5 5.5-5.5" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
    },
    { id: 'session', label: 'Session',
      icon: (c) => <svg width="22" height="22" viewBox="0 0 22 22"><path d="M2 8h2M18 8h2M2 14h2M18 14h2M6 5v12M16 5v12M6 11h10" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
    },
    { id: 'tests', label: 'Tests',
      icon: (c) => <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="3.5" stroke={c} strokeWidth="1.6" fill="none"/><path d="M11 2v3M11 17v3M2 11h3M17 11h3M4.6 4.6l2.1 2.1M15.3 15.3l2.1 2.1M4.6 17.4l2.1-2.1M15.3 6.7l2.1-2.1" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
    },
    { id: 'weekly', label: 'Trends',
      icon: (c) => <svg width="22" height="22" viewBox="0 0 22 22"><path d="M3 17l5-6 4 4 7-9" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
    },
  ];

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 26, paddingTop: 8,
      background: theme.tabBg,
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: `1px solid ${theme.border}`,
      zIndex: 50,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0 8px' }}>
        {tabs.map(t => {
          const sel = t.id === active;
          const color = sel ? accent : theme.muted;
          return (
            <button key={t.id} onClick={() => onChange(t.id)}
              style={{
                flex: 1, background: 'transparent', border: 'none',
                padding: '6px 4px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                fontFamily: 'inherit',
              }}
            >
              {t.icon(color)}
              <span style={{
                fontSize: 10, fontWeight: 500, color, letterSpacing: '0.02em',
              }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────
function App() {
  const [tab, setTab] = useState('dashboard');
  const [activeAthlete, setActiveAthlete] = useState('tristan');
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking' | 'live' | 'offline'

  // Probe the backend on mount; if it answers, we're "live" — UI keeps using
  // the local data as a fallback shape, but submit handlers post to the API.
  useEffect(() => {
    if (!window.API) { setApiStatus('offline'); return; }
    window.API.listAthletes()
      .then(() => setApiStatus('live'))
      .catch(() => setApiStatus('offline'));
  }, []);

  const onSubmitCheckin = (athleteId, values) => {
    if (apiStatus === 'live' && window.API) {
      window.API.postCheckin(athleteId, { scores: values }).catch(() => {});
    }
    setTab('dashboard');
  };

  // resolve accent: stored as hex (TweakColor emits hex strings)
  const accentEntry = Object.entries(ACCENT_PALETTES).find(([k, v]) => v.primary === t.accent || k === t.accent);
  const accentKey = accentEntry ? accentEntry[0] : 'electric';
  const theme = makeTheme(t.mode, accentKey);
  const accent = ACCENT_PALETTES[accentKey].primary;
  const isDark = t.mode === 'dark';

  // Density spacing scale (via root style var injection)
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--density-scale',
      t.density === 'compact' ? '0.88' : t.density === 'spacious' ? '1.12' : '1');
  }, [t.density]);

  let screen;
  if (tab === 'dashboard') {
    screen = <DashboardScreen theme={theme} accent={accent}
      onCheckin={() => setTab('checkin')}
      onAthlete={(id) => { setActiveAthlete(id); setTab('profile'); }} />;
  } else if (tab === 'profile') {
    screen = <AthleteProfileScreen theme={theme} accent={accent}
      athleteId={activeAthlete}
      onBack={() => setTab('dashboard')} />;
  } else if (tab === 'checkin') {
    screen = <CheckinScreen theme={theme} accent={accent}
      variant={t.checkinVariant}
      athleteId={activeAthlete}
      onAthleteChange={setActiveAthlete}
      onSubmit={onSubmitCheckin} />;
  } else if (tab === 'session') {
    screen = <SessionScreen theme={theme} accent={accent} />;
  } else if (tab === 'tests') {
    screen = <TestsScreen theme={theme} accent={accent}
      athleteId={activeAthlete}
      onAthleteChange={setActiveAthlete} />;
  } else if (tab === 'weekly') {
    screen = <WeeklyScreen theme={theme} accent={accent}
      athleteId={activeAthlete}
      onAthleteChange={setActiveAthlete} />;
  }

  return (
    <React.Fragment>
      <IOSDevice width={402} height={874} dark={isDark}>
        <div style={{
          height: '100%',
          background: theme.bg,
          color: theme.text,
          position: 'relative',
          fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
        }}>
          {/* status bar spacer */}
          <div style={{ height: 56 }} />
          {/* content scroll area */}
          <div style={{
            height: 'calc(100% - 56px - 86px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}>
            {screen}
          </div>
          <TabBar active={tab} onChange={setTab} theme={theme} accent={accent} />

          {/* API status badge */}
          <div style={{
            position: 'absolute', top: 12, right: 16, zIndex: 60,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 8px', borderRadius: 999,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(8px)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9, fontWeight: 600, letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: apiStatus === 'live' ? '#34d399' : apiStatus === 'offline' ? '#fb923c' : theme.muted,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: 3,
              background: 'currentColor',
              boxShadow: apiStatus === 'live' ? '0 0 6px currentColor' : 'none',
            }} />
            {apiStatus === 'live' ? 'API · Live' : apiStatus === 'offline' ? 'API · Offline' : 'API · …'}
          </div>
        </div>
      </IOSDevice>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Appearance">
          <TweakRadio
            label="Mode"
            value={t.mode}
            onChange={v => setTweak('mode', v)}
            options={[
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
            ]}
          />
          <TweakColor
            label="Accent"
            value={ACCENT_PALETTES[accentKey].primary}
            onChange={v => setTweak('accent', v)}
            options={Object.values(ACCENT_PALETTES).map(v => v.primary)}
          />
        </TweakSection>

        <TweakSection label="Check-in">
          <TweakRadio
            label="Input style"
            value={t.checkinVariant}
            onChange={v => setTweak('checkinVariant', v)}
            options={[
              { value: 'numeric', label: 'Numeric' },
              { value: 'labeled', label: 'Labeled' },
              { value: 'emoji', label: 'Emoji' },
            ]}
          />
        </TweakSection>

        <TweakSection label="Layout">
          <TweakRadio
            label="Density"
            value={t.density}
            onChange={v => setTweak('density', v)}
            options={[
              { value: 'compact', label: 'Compact' },
              { value: 'default', label: 'Default' },
              { value: 'spacious', label: 'Spacious' },
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('device-mount')).render(<App />);
