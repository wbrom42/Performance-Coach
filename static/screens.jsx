// Screens for Performance Coach v2
// Provides: DashboardScreen, CheckinScreen, SessionScreen, WeeklyScreen
// + shared atoms: ReadinessRing, MetricBar, Sparkbar, AthleteAvatar, ScreenHeader

const { useState, useMemo } = React;

// ─────────────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────────────

function AthleteAvatar({ athlete, size = 40, accent }) {
  const hue = athlete.avatarHue;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, oklch(0.55 0.18 ${hue}) 0%, oklch(0.42 0.18 ${hue}) 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.42, fontWeight: 700, color: '#fff',
      letterSpacing: '-0.02em', flexShrink: 0,
      boxShadow: `0 1px 0 oklch(0.65 0.18 ${hue} / 0.6) inset, 0 4px 12px oklch(0.4 0.18 ${hue} / 0.3)`
    }}>{athlete.initials}</div>);

}

function ReadinessRing({ score, size = 88, stroke = 8, theme }) {
  const tier = readinessTier(score);
  const pct = Math.max(0, Math.min(1, (score - 0.5) / 4.5));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={theme.subtleBorder} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={tier.color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.16,1,0.3,1)' }} />
        
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: size * 0.32, fontWeight: 600, color: tier.color,
          lineHeight: 1, letterSpacing: '-0.02em'
        }}>{score.toFixed(1)}</div>
      </div>
    </div>);

}

function MetricBar({ value, max = 5, color, theme, height = 4 }) {
  return (
    <div style={{
      height, borderRadius: height, background: theme.subtleBorder,
      overflow: 'hidden', flex: 1, minWidth: 0
    }}>
      <div style={{
        height: '100%', width: `${value / max * 100}%`,
        background: color, borderRadius: height,
        transition: 'width 0.4s ease'
      }} />
    </div>);

}

function Sparkbar({ values, theme, width = 84, height = 28 }) {
  // Renders 7 thin bars for week-at-a-glance. null = rest day (muted tick).
  const max = 5;
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', width, height }}>
      {values.map((v, i) => {
        if (v == null) {
          return <div key={i} style={{
            flex: 1, height: 4, alignSelf: 'center',
            background: theme.subtleBorder, borderRadius: 2
          }} />;
        }
        const tier = readinessTier(v);
        return <div key={i} style={{
          flex: 1, height: `${v / max * 100}%`, minHeight: 4,
          background: tier.color, borderRadius: 2
        }} />;
      })}
    </div>);

}

function ScreenHeader({ overline, title, action, theme }) {
  return (
    <div style={{ padding: '18px 20px 14px' }}>
      {overline &&
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11, color: theme.muted,
        textTransform: 'uppercase', letterSpacing: '0.14em',
        marginBottom: 6
      }}>{overline}</div>
      }
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <h1 style={{ ...{
            fontSize: 28, fontWeight: 700, color: theme.text,
            margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1
          }, color: "rgb(71, 126, 113)" }}>{title}</h1>
        {action}
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// 1. DASHBOARD
// ─────────────────────────────────────────────────────────────
function DashboardScreen({ theme, accent, onCheckin, onAthlete }) {
  const athletes = [ATHLETES.tristan, ATHLETES.kennedy];
  return (
    <div style={{ paddingBottom: 24 }}>
      <ScreenHeader
        overline="Wed · May 13"
        title="Good evening, Coach"
        theme={theme} />
      

      {/* Flags */}
      {typeof DashboardFlags !== 'undefined' && <div style={{ marginBottom: 4 }}><DashboardFlags theme={theme} /></div>}

      <div style={{ padding: '20px 20px 10px 20px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, color: theme.muted,
          textTransform: 'uppercase', letterSpacing: '0.14em'
        }}>Athletes</div>
      </div>

      {/* Athlete cards */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {athletes.map((a) => {
          const scores = a.today;
          const avg = scores ? (scores.energy + scores.sleep + scores.soreness + scores.motivation) / 4 : null;
          const tier = avg != null ? readinessTier(avg) : null;
          const weekVals = a.week.map((d) => d.scores ? (d.scores.energy + d.scores.sleep + d.scores.soreness + d.scores.motivation) / 4 : null);
          return (
            <button key={a.id} onClick={() => onAthlete(a.id)}
            style={{
              background: theme.card, border: `1px solid ${theme.border}`,
              borderRadius: 18, padding: '16px 16px 14px',
              display: 'flex', flexDirection: 'column', gap: 14,
              width: '100%', cursor: 'pointer', textAlign: 'left',
              fontFamily: 'inherit', color: 'inherit',
              transition: 'transform 0.15s, background 0.15s'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.99)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              
              {/* Top row: avatar + name + ring */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <AthleteAvatar athlete={a} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 600, color: theme.text, letterSpacing: '-0.01em' }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>
                    {a.position} · {a.age}yo · checked in {scores.time}
                  </div>
                </div>
                <ReadinessRing score={avg} size={68} stroke={6} theme={theme} />
              </div>

              {/* Metric breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 14px' }}>
                {RATING_DIMENSIONS.map((d) =>
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10, color: theme.muted, width: 54,
                    textTransform: 'uppercase', letterSpacing: '0.08em'
                  }}>{d.label}</div>
                    <MetricBar value={scores[d.id]} color={readinessTier(scores[d.id]).color} theme={theme} />
                    <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11, color: theme.text, fontWeight: 500, width: 12, textAlign: 'right'
                  }}>{scores[d.id]}</div>
                  </div>
                )}
              </div>

              {/* Footer: week sparkbar + label */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderTop: `1px solid ${theme.subtleBorder}`, paddingTop: 12, marginTop: 2
              }}>
                <div>
                  <div style={{ fontSize: 11, color: theme.muted, letterSpacing: '0.02em' }}>This week</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 16, fontWeight: 600, color: theme.text
                    }}>{a.weekAvg.toFixed(1)}</span>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                      color: a.weekDelta >= 0 ? '#34d399' : '#fb923c'
                    }}>{a.weekDelta >= 0 ? '+' : ''}{a.weekDelta.toFixed(1)}</span>
                  </div>
                </div>
                <Sparkbar values={weekVals} theme={theme} />
              </div>
            </button>);

        })}
      </div>

      {/* Quick actions */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, color: theme.muted,
          textTransform: 'uppercase', letterSpacing: '0.14em',
          marginBottom: 10
        }}>Today</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ActivityRow theme={theme} accent={accent}
          time="6:30 PM"
          text={<span><strong style={{ color: theme.text }}>Tristan</strong> completed Speed Block</span>}
          kind="check" />
          <ActivityRow theme={theme} accent={accent}
          time="5:45 PM"
          text={<span><strong style={{ color: theme.text }}>Kennedy</strong> started ATG Warm-up</span>}
          kind="play" />
          <ActivityRow theme={theme} accent={accent}
          time="3:12 PM"
          text="Heat advisory · DFW 95°F. Hydration cue sent."
          kind="alert" />
        </div>
      </div>
    </div>);

}

function ActivityRow({ time, text, kind, theme, accent }) {
  const icon = kind === 'check' ?
  <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2.5 7l3 3 6-6.5" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> :
  kind === 'play' ?
  <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 2l7 4-7 4z" fill={accent} /></svg> :
  <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 2v6M7 10.5v.5" stroke="#fb923c" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px', borderRadius: 12,
      background: theme.subtleBg
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: 8,
        background: theme.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${theme.border}`
      }}>{icon}</div>
      <div style={{ flex: 1, fontSize: 13, color: theme.secondary, lineHeight: 1.4 }}>{text}</div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11, color: theme.muted
      }}>{time}</div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// 2. CHECK-IN
// ─────────────────────────────────────────────────────────────
function CheckinScreen({ theme, accent, variant, athleteId, onAthleteChange, onSubmit }) {
  const a = ATHLETES[athleteId];
  const [values, setValues] = useState({});

  const setVal = (id, v) => setValues((prev) => ({ ...prev, [id]: v }));
  const allFilled = RATING_DIMENSIONS.every((d) => values[d.id] != null);
  const avg = allFilled ?
  RATING_DIMENSIONS.reduce((s, d) => s + values[d.id], 0) / RATING_DIMENSIONS.length :
  null;
  const tier = avg != null ? readinessTier(avg) : null;

  return (
    <div style={{ paddingBottom: 24 }}>
      <ScreenHeader
        overline="Evening check-in"
        title="How was today?"
        theme={theme} />
      

      {/* Athlete selector pills */}
      <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8 }}>
        {Object.values(ATHLETES).map((at) => {
          const active = at.id === athleteId;
          return (
            <button key={at.id}
            onClick={() => onAthleteChange(at.id)}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 12,
              background: active ? theme.card : 'transparent',
              border: `1px solid ${active ? theme.border : 'transparent'}`,
              display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer', fontFamily: 'inherit', color: 'inherit',
              opacity: active ? 1 : 0.55, transition: 'opacity 0.15s, background 0.15s'
            }}>
              
              <AthleteAvatar athlete={at} size={28} />
              <span style={{ fontSize: 14, fontWeight: 500, color: theme.text }}>{at.name}</span>
            </button>);

        })}
      </div>

      {/* Rating groups */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {RATING_DIMENSIONS.map((d) =>
        <div key={d.id} style={{
          background: theme.card, border: `1px solid ${theme.border}`,
          borderRadius: 16, padding: '14px 16px'
        }}>
            <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            marginBottom: 12
          }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: theme.text, letterSpacing: '-0.01em' }}>{d.label}</div>
              <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'JetBrains Mono, monospace' }}>{d.hint}</div>
            </div>
            <RatingControl
            variant={variant}
            dim={d}
            value={values[d.id]}
            onChange={(v) => setVal(d.id, v)}
            theme={theme}
            accent={accent} />
          
          </div>
        )}
      </div>

      {/* Summary + submit */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{
          background: theme.card, border: `1px solid ${theme.border}`,
          borderRadius: 16, padding: '14px 16px', marginBottom: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>Readiness</div>
            <div style={{ fontSize: 14, color: tier ? tier.color : theme.muted, fontWeight: 600, marginTop: 4 }}>
              {tier ? tier.label : 'Awaiting input'}
            </div>
          </div>
          {avg != null ?
          <ReadinessRing score={avg} size={56} stroke={5} theme={theme} /> :

          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            border: `2px dashed ${theme.subtleBorder}`
          }} />
          }
        </div>
        <button
          disabled={!allFilled}
          onClick={() => onSubmit(athleteId, values)}
          style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none',
            background: allFilled ? accent : theme.subtleBorder,
            color: '#fff', fontSize: 15, fontWeight: 600,
            cursor: allFilled ? 'pointer' : 'default', opacity: allFilled ? 1 : 0.5,
            fontFamily: 'inherit', transition: 'opacity 0.2s, background 0.2s',
            letterSpacing: '0.01em'
          }}>
          Submit check-in</button>
      </div>
    </div>);

}

function RatingControl({ variant, dim, value, onChange, theme, accent }) {
  if (variant === 'emoji') {
    const sets = {
      energy: ['😴', '😐', '🙂', '⚡', '🔥'],
      sleep: ['💤', '😪', '😐', '😊', '🌙'],
      soreness: ['😖', '😣', '😐', '🙂', '💪'],
      motivation: ['😞', '😐', '🙂', '💪', '🚀']
    };
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        {[1, 2, 3, 4, 5].map((n, i) => {
          const sel = value === n;
          return (
            <button key={n} onClick={() => onChange(n)}
            style={{
              flex: 1, aspectRatio: '1', borderRadius: 12, border: 'none',
              background: sel ? `${accent}22` : theme.subtleBg,
              boxShadow: sel ? `inset 0 0 0 1.5px ${accent}` : 'none',
              fontSize: 22, cursor: 'pointer',
              transition: 'all 0.12s', filter: sel ? 'none' : 'grayscale(0.4)'
            }}>
              {sets[dim.id][i]}</button>);

        })}
      </div>);

  }

  if (variant === 'labeled') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[5, 4, 3, 2, 1].map((n) => {
          const sel = value === n;
          const tier = readinessTier(n);
          return (
            <button key={n} onClick={() => onChange(n)}
            style={{
              padding: '10px 14px', borderRadius: 10, border: 'none',
              background: sel ? `${tier.color}1f` : theme.subtleBg,
              boxShadow: sel ? `inset 0 0 0 1.5px ${tier.color}` : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', fontFamily: 'inherit',
              color: sel ? tier.color : theme.secondary,
              transition: 'all 0.12s'
            }}>
              
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 13, fontWeight: 600,
                  width: 18, textAlign: 'center',
                  color: sel ? tier.color : theme.muted
                }}>{n}</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{RATING_LABELS[n - 1]}</span>
              </span>
              {sel &&
              <svg width="14" height="14" viewBox="0 0 14 14">
                  <path d="M2.5 7l3 3 6-6.5" stroke={tier.color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            </button>);

        })}
      </div>);

  }

  // numeric (default)
  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const sel = value === n;
          const tier = readinessTier(n);
          return (
            <button key={n} onClick={() => onChange(n)}
            style={{
              flex: 1, aspectRatio: '1', borderRadius: 12, border: 'none',
              background: sel ? `${tier.color}1f` : theme.subtleBg,
              boxShadow: sel ? `inset 0 0 0 1.5px ${tier.color}` : 'none',
              color: sel ? tier.color : theme.secondary,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 18, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.12s'
            }}>
              {n}</button>);

        })}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: 8,
        fontSize: 11, color: theme.muted,
        fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '0.04em'
      }}>
        <span>{dim.lowLabel}</span>
        <span>{dim.highLabel}</span>
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// 3. SESSION
// ─────────────────────────────────────────────────────────────
function SessionScreen({ theme, accent }) {
  const [open, setOpen] = useState({ speed: true });
  const blocks = TODAY_PLAN.blocks;
  const accentMap = {
    speed: '#4f8fff',
    strength: '#34d399'
  };

  return (
    <div style={{ paddingBottom: 24 }}>
      <ScreenHeader
        overline={TODAY_PLAN.date.split(',')[0] + ' · ' + TODAY_PLAN.date.split(', ')[1]}
        title="Session"
        action={
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em'
        }}>75 min total</div>
        }
        theme={theme} />
      

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {blocks.map((b, i) => {
          const isOpen = open[b.id];
          const blockAccent = b.accent ? accentMap[b.accent] : accent;
          return (
            <div key={b.id} style={{
              background: theme.card, border: `1px solid ${theme.border}`,
              borderRadius: 16, overflow: 'hidden'
            }}>
              <button
                onClick={() => setOpen((prev) => ({ ...prev, [b.id]: !prev[b.id] }))}
                style={{
                  width: '100%', padding: '14px 16px',
                  background: 'transparent', border: 'none',
                  display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', fontFamily: 'inherit', color: 'inherit',
                  textAlign: 'left'
                }}>
                
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: b.status === 'complete' ? '#34d39922' :
                  b.status === 'active' ? `${blockAccent}1f` :
                  theme.subtleBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 13, fontWeight: 600,
                  color: b.status === 'complete' ? '#34d399' :
                  b.status === 'active' ? blockAccent :
                  theme.muted
                }}>
                  {b.status === 'complete' ?
                  <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2.5 7l3 3 6-6.5" stroke="#34d399" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> :
                  i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: theme.text, letterSpacing: '-0.01em' }}>{b.name}</div>
                    {b.status === 'active' &&
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 9, color: blockAccent,
                      background: `${blockAccent}1a`,
                      padding: '2px 6px', borderRadius: 4,
                      textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600
                    }}>NOW</div>
                    }
                  </div>
                  <div style={{
                    fontSize: 11, color: theme.muted, marginTop: 3,
                    fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.02em'
                  }}>{b.duration} · {b.tag}</div>
                </div>
                <svg width="12" height="8" viewBox="0 0 12 8" style={{ color: theme.muted, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isOpen &&
              <div style={{
                padding: '0 16px 14px', borderTop: `1px solid ${theme.subtleBorder}`,
                paddingTop: 12
              }}>
                  {b.exercises.map((ex, j) =>
                <div key={j} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: j < b.exercises.length - 1 ? `1px solid ${theme.subtleBorder}` : 'none'
                }}>
                      <div style={{ fontSize: 14, color: theme.text }}>{ex.name}</div>
                      <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 12, color: theme.secondary
                  }}>{ex.detail}</div>
                    </div>
                )}
                </div>
              }
            </div>);

        })}
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        <button style={{
          width: '100%', padding: '14px', borderRadius: 14,
          background: accent, color: '#fff', border: 'none',
          fontSize: 15, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit', letterSpacing: '0.01em'
        }}>Start Speed Block</button>
      </div>

      {/* Testing schedule */}
      <div style={{ marginTop: 24 }}>
        <div style={{
          padding: '0 20px 10px',
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, color: theme.muted,
            textTransform: 'uppercase', letterSpacing: '0.14em'
          }}>Testing Schedule</div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10, color: theme.muted,
            textTransform: 'uppercase', letterSpacing: '0.08em'
          }}>Weekly protocol</div>
        </div>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TESTING_SCHEDULE.map((b, i) =>
          <div key={i} style={{
            background: theme.card, border: `1px solid ${theme.border}`,
            borderRadius: 14, overflow: 'hidden'
          }}>
              <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              padding: '10px 14px',
              background: theme.subtleBg,
              borderBottom: `1px solid ${theme.subtleBorder}`
            }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, letterSpacing: '-0.01em' }}>
                  {b.day}
                </div>
                <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10, color: accent, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.1em'
              }}>{b.when}</div>
              </div>
              <div>
                {b.items.map((it, j) =>
              <div key={j} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 14px',
                borderBottom: j < b.items.length - 1 ? `1px solid ${theme.subtleBorder}` : 'none'
              }}>
                    <div style={{ fontSize: 13, color: theme.text }}>{it.name}</div>
                    <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11, color: theme.muted, letterSpacing: '0.02em'
                }}>{it.detail}</div>
                  </div>
              )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// 4. WEEKLY
// ─────────────────────────────────────────────────────────────
function WeeklyScreen({ theme, accent, athleteId, onAthleteChange }) {
  const a = ATHLETES[athleteId];

  const dayAvg = (d) => d.scores ?
  (d.scores.energy + d.scores.sleep + d.scores.soreness + d.scores.motivation) / 4 :
  null;

  return (
    <div style={{ paddingBottom: 24 }}>
      <ScreenHeader
        overline="May 4 – 10, 2026"
        title="Weekly"
        theme={theme} />
      

      {/* Athlete selector */}
      <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8 }}>
        {Object.values(ATHLETES).map((at) => {
          const active = at.id === athleteId;
          return (
            <button key={at.id}
            onClick={() => onAthleteChange(at.id)}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 12,
              background: active ? theme.card : 'transparent',
              border: `1px solid ${active ? theme.border : 'transparent'}`,
              display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer', fontFamily: 'inherit', color: 'inherit',
              opacity: active ? 1 : 0.55, transition: 'opacity 0.15s'
            }}>
              
              <AthleteAvatar athlete={at} size={28} />
              <span style={{ fontSize: 14, fontWeight: 500, color: theme.text }}>{at.name}</span>
            </button>);

        })}
      </div>

      {/* Stat header card */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{
          background: theme.card, border: `1px solid ${theme.border}`,
          borderRadius: 18, padding: '18px 20px',
          display: 'flex', alignItems: 'center', gap: 16
        }}>
          <ReadinessRing score={a.weekAvg} size={80} stroke={7} theme={theme} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Avg readiness
            </div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 14,
              color: a.weekDelta >= 0 ? '#34d399' : '#fb923c',
              marginTop: 6, fontWeight: 500
            }}>
              {a.weekDelta >= 0 ? '↑' : '↓'} {Math.abs(a.weekDelta).toFixed(1)} vs last week
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 600, color: theme.text }}>{a.sessions}</div>
                <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>sessions</div>
              </div>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 600, color: theme.text }}>{a.week.filter((d) => d.scores).length}<span style={{ color: theme.muted }}>/7</span></div>
                <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>check-ins</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Day rows */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {a.week.map((d, i) => {
          const avg = dayAvg(d);
          const tier = avg != null ? readinessTier(avg) : null;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 12,
              background: theme.subtleBg
            }}>
              <div style={{
                width: 44, fontSize: 13, fontWeight: 600, color: theme.text
              }}>{d.day}</div>
              {avg != null ?
              <>
                  <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                    {RATING_DIMENSIONS.map((dim) =>
                  <MetricBar key={dim.id} value={d.scores[dim.id]} color={readinessTier(d.scores[dim.id]).color} theme={theme} height={6} />
                  )}
                  </div>
                  <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 13, fontWeight: 600, color: tier.color, width: 28, textAlign: 'right'
                }}>{avg.toFixed(1)}</div>
                </> :

              <>
                  <div style={{ flex: 1, fontSize: 12, color: theme.muted, fontStyle: 'italic' }}>{d.note}</div>
                  <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 12, color: theme.muted, width: 28, textAlign: 'right'
                }}>—</div>
                </>
              }
            </div>);

        })}
      </div>

      {/* Coach note */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{
          background: theme.card, border: `1px solid ${theme.border}`,
          borderRadius: 16, padding: '14px 16px'
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, color: theme.muted,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill={accent} /></svg>
            Coach Note
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.55, color: theme.secondary, textWrap: 'pretty' }}>
            {a.coachNote}
          </div>
        </div>
      </div>
    </div>);

}

Object.assign(window, {
  DashboardScreen, CheckinScreen, SessionScreen, WeeklyScreen,
  ReadinessRing, MetricBar, Sparkbar, AthleteAvatar, ScreenHeader
});