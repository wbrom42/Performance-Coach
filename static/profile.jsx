// Athlete Profile screen — drill-in from Home

function ProfileSparkline({ values, color, theme, width = 220, height = 56, direction = 'higher' }) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return [x, y];
  });
  const d = pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
  const areaD = d + ` L ${width} ${height} L 0 ${height} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`g-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#g-${color.replace('#','')})`} />
      <path d={d} stroke={color} strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 3 : 1.5}
          fill={i === pts.length - 1 ? color : theme.subtleBorder} />
      ))}
    </svg>
  );
}

function ProfileStat({ label, value, sub, theme }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, color: theme.muted,
        textTransform: 'uppercase', letterSpacing: '0.1em',
      }}>{label}</div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 20, fontWeight: 600, color: theme.text,
        marginTop: 4, letterSpacing: '-0.01em',
      }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function AthleteProfileScreen({ theme, accent, athleteId, onBack }) {
  const a = ATHLETES[athleteId];
  const x = PROFILE_EXTRAS[athleteId];
  const sprints = SPRINT_TESTS[athleteId];
  const jumps = JUMP_TESTS[athleteId];

  // build avg readiness across athletes available — use weekly history
  const readinessLast = x.weeklyReadiness[x.weeklyReadiness.length - 1];
  const readinessTrend = readinessLast - x.weeklyReadiness[0];
  const loadLast = x.weeklyLoad[x.weeklyLoad.length - 1];
  const loadDelta = loadLast - x.weeklyLoad[x.weeklyLoad.length - 2];

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Back row */}
      <div style={{ padding: '12px 16px 0' }}>
        <button onClick={onBack} style={{
          background: 'transparent', border: 'none',
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 8px', borderRadius: 8,
          color: theme.muted, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M8.5 2.5l-4 4.5 4 4.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Home</span>
        </button>
      </div>

      {/* Header */}
      <div style={{ padding: '8px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <AthleteAvatar athlete={a} size={64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontSize: 26, fontWeight: 700, color: theme.text,
              margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1,
            }}>{a.name}</h1>
            <div style={{ fontSize: 13, color: theme.muted, marginTop: 4 }}>
              {a.position} · {a.age}yo · {x.height} · {x.weight}
            </div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10, color: theme.muted, marginTop: 6,
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>Joined {x.joined}</div>
          </div>
          <ReadinessRing score={readinessLast} size={64} stroke={6} theme={theme} />
        </div>
      </div>

      {/* Stat row */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{
          background: theme.card, border: `1px solid ${theme.border}`,
          borderRadius: 16, padding: '14px 16px',
          display: 'flex', gap: 8,
        }}>
          <ProfileStat label="Sessions" value={x.sessionsTotal} sub="all-time" theme={theme} />
          <div style={{ width: 1, background: theme.subtleBorder }} />
          <ProfileStat label="Streak" value={`${x.streak}d`} sub="check-ins" theme={theme} />
          <div style={{ width: 1, background: theme.subtleBorder }} />
          <ProfileStat label="Wk load" value={loadLast} sub={`${loadDelta >= 0 ? '+' : ''}${loadDelta} AU`} theme={theme} />
        </div>
      </div>

      {/* 4-week readiness trend */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{
          background: theme.card, border: `1px solid ${theme.border}`,
          borderRadius: 16, padding: '14px 16px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            marginBottom: 10,
          }}>
            <div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10, color: theme.muted,
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>Readiness · 4 weeks</div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 22, fontWeight: 600, color: theme.text, marginTop: 4,
              }}>{readinessLast.toFixed(1)}<span style={{ fontSize: 13, color: theme.muted, marginLeft: 6 }}>avg</span></div>
            </div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
              color: readinessTrend >= 0 ? '#34d399' : '#fb923c', fontWeight: 600,
            }}>{readinessTrend >= 0 ? '↑' : '↓'} {Math.abs(readinessTrend).toFixed(1)}</div>
          </div>
          <ProfileSparkline values={x.weeklyReadiness} color={accent} theme={theme} width={340} height={64} />
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginTop: 4,
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: theme.muted,
            letterSpacing: '0.05em',
          }}>
            <span>Apr 13</span><span>Apr 20</span><span>Apr 27</span><span>May 4</span>
          </div>
        </div>
      </div>

      {/* Personal bests */}
      <div style={{ padding: '8px 20px 10px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, color: theme.muted,
          textTransform: 'uppercase', letterSpacing: '0.14em',
        }}>Personal Bests</div>
      </div>
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{
          background: theme.card, border: `1px solid ${theme.border}`,
          borderRadius: 16, overflow: 'hidden',
        }}>
          {x.bests.map((b, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 14px',
              borderBottom: i < x.bests.length - 1 ? `1px solid ${theme.subtleBorder}` : 'none',
            }}>
              <div style={{ fontSize: 14, color: theme.text }}>{b.test}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 14, fontWeight: 600, color: accent,
                }}>{b.value}</div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10, color: theme.muted, letterSpacing: '0.05em',
                }}>{b.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sprint progression */}
      <div style={{ padding: '0 20px 10px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, color: theme.muted,
          textTransform: 'uppercase', letterSpacing: '0.14em',
        }}>Sprint Progression</div>
      </div>
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sprints.slice(0, 3).map(s => {
          const better = s.direction === 'lower' ? s.delta < 0 : s.delta > 0;
          const color = s.delta === 0 ? theme.muted : (better ? '#34d399' : '#fb923c');
          return (
            <div key={s.id} style={{
              background: theme.card, border: `1px solid ${theme.border}`,
              borderRadius: 14, padding: '12px 14px',
            }}>
              <div style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                marginBottom: 8,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, letterSpacing: '-0.01em' }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>{s.why}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 18, fontWeight: 600, color: theme.text,
                  }}>{s.latest}<span style={{ fontSize: 11, color: theme.muted, marginLeft: 2 }}>{s.unit}</span></div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10, color, fontWeight: 600,
                  }}>{s.delta > 0 ? '+' : ''}{s.delta.toFixed(2)}{s.unit} · PR {s.pr}</div>
                </div>
              </div>
              <ProfileSparkline values={s.history} color={accent} theme={theme} width={320} height={40} />
            </div>
          );
        })}
      </div>

      {/* Notes */}
      <div style={{ padding: '0 20px 10px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, color: theme.muted,
          textTransform: 'uppercase', letterSpacing: '0.14em',
        }}>Coach Notes</div>
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {x.notes.map((n, i) => (
          <div key={i} style={{
            background: theme.card, border: `1px solid ${theme.border}`,
            borderRadius: 14, padding: '12px 14px',
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10, color: accent, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.12em',
              marginBottom: 6,
            }}>{n.date}</div>
            <div style={{ fontSize: 13, color: theme.secondary, lineHeight: 1.5 }}>{n.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { AthleteProfileScreen });