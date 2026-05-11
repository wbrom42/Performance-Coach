// flags.jsx — recommendation flag components

function FlagIcon({ kind, color }) {
  const common = { width: 18, height: 18, viewBox: '0 0 18 18', fill: 'none', stroke: color, strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'speed') return <svg {...common}><path d="M3 9h8M11 9l-3-3M11 9l-3 3"/><path d="M14 5l2 4-2 4"/></svg>;
  if (kind === 'power') return <svg {...common}><path d="M10 2L4 10h4l-1 6 6-8h-4l1-6z" fill={color} stroke="none"/></svg>;
  if (kind === 'workload') return <svg {...common}><path d="M3 12h12M5 12V8M9 12V5M13 12V9"/></svg>;
  if (kind === 'freshness') return <svg {...common}><circle cx="9" cy="9" r="6.5"/><path d="M5.5 9.5l2.5 2.5 4.5-5"/></svg>;
  return null;
}

function severityTone(sev, theme) {
  if (sev === 'ready')   return { color: '#34d399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.35)' };
  if (sev === 'caution') return { color: '#f87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.35)' };
  if (sev === 'warn')    return { color: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.35)' };
  return { color: theme.muted, bg: theme.subtleBg, border: theme.border };
}

function signalToneColor(tone) {
  if (tone === 'good') return '#34d399';
  if (tone === 'bad')  return '#f87171';
  if (tone === 'warn') return '#fbbf24';
  return null;
}

function FlagCard({ flag, theme }) {
  const tone = severityTone(flag.severity, theme);
  return (
    <div style={{
      background: theme.card,
      border: `1px solid ${theme.border}`,
      borderRadius: 16, overflow: 'hidden',
    }}>
      {/* Header strip — tinted */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px',
        background: tone.bg,
        borderBottom: `1px solid ${tone.border}`,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: `${tone.color}1f`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FlagIcon kind={flag.kind} color={tone.color} />
        </div>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: theme.text, letterSpacing: '-0.01em' }}>
          {flag.title}
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10, color: tone.color, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          padding: '3px 8px', borderRadius: 999,
          background: `${tone.color}1a`,
        }}>
          {flag.severity === 'ready' ? 'Green' : flag.severity === 'warn' ? 'Yellow' : 'Red'}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontSize: 13, color: theme.secondary, lineHeight: 1.5, textWrap: 'pretty' }}>
          {flag.summary}
        </div>

        {/* Signals */}
        {flag.signals && flag.signals.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {flag.signals.map((s, i) => {
              const c = signalToneColor(s.tone) || theme.muted;
              return (
                <div key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 9px', borderRadius: 999,
                  background: theme.subtleBg,
                  border: `1px solid ${theme.subtleBorder}`,
                }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10, color: theme.muted,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>{s.label}</span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11, color: c, fontWeight: 600,
                  }}>{s.value}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Recommendation */}
        <div style={{
          marginTop: 12, padding: '10px 12px',
          background: theme.subtleBg, borderRadius: 10,
          borderLeft: `3px solid ${tone.color}`,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10, color: tone.color, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.12em',
            paddingTop: 2, flexShrink: 0,
          }}>Rx</div>
          <div style={{ fontSize: 13, color: theme.text, lineHeight: 1.5, textWrap: 'pretty' }}>
            {flag.rec}
          </div>
        </div>
      </div>
    </div>
  );
}

function FlagsList({ athleteId, theme }) {
  const flags = FLAGS[athleteId] || [];
  if (flags.length === 0) return null;
  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {flags.map(f => <FlagCard key={f.id} flag={f} theme={theme} />)}
    </div>
  );
}

function DashboardFlags({ theme }) {
  // Aggregate all flags across athletes for the home dashboard
  const allFlags = [];
  Object.entries(FLAGS).forEach(([athleteId, list]) => {
    list.forEach(f => allFlags.push({ ...f, athleteId, athleteName: ATHLETES[athleteId].name, athlete: ATHLETES[athleteId] }));
  });
  // Severity order: caution > warn > ready
  const order = { caution: 0, warn: 1, ready: 2 };
  allFlags.sort((a, b) => order[a.severity] - order[b.severity]);

  if (allFlags.length === 0) return null;

  return (
    <div style={{ padding: '20px 20px 0' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, color: theme.muted,
          textTransform: 'uppercase', letterSpacing: '0.14em',
        }}>Today's Flags</div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, color: theme.muted,
        }}>{allFlags.length} active</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 0' }}>
        {allFlags.map(f => {
          const tone = severityTone(f.severity, theme);
          return (
            <div key={f.athleteId + f.id} style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: 16, overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                background: tone.bg,
                borderBottom: `1px solid ${tone.border}`,
              }}>
                <AthleteAvatar athlete={f.athlete} size={24} />
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{f.athleteName}</div>
                <div style={{
                  width: 4, height: 4, borderRadius: 4, background: theme.muted,
                }} />
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: theme.text }}>{f.title}</div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 9, color: tone.color, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  padding: '3px 7px', borderRadius: 999,
                  background: `${tone.color}1a`,
                }}>
                  {f.severity === 'ready' ? 'Green' : f.severity === 'warn' ? 'Yellow' : 'Red'}
                </div>
              </div>
              <div style={{ padding: '10px 14px 12px' }}>
                <div style={{ fontSize: 12, color: theme.secondary, lineHeight: 1.45, textWrap: 'pretty' }}>
                  {f.summary}
                </div>
                <div style={{
                  marginTop: 8, padding: '8px 10px',
                  background: theme.subtleBg, borderRadius: 8,
                  borderLeft: `3px solid ${tone.color}`,
                  fontSize: 12, color: theme.text, lineHeight: 1.45, textWrap: 'pretty',
                }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 9, color: tone.color, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.12em',
                    marginRight: 6,
                  }}>Rx</span>
                  {f.rec}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { FlagCard, FlagsList, DashboardFlags });
