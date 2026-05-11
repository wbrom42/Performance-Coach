// tests.jsx — TestsScreen for Performance Coach v2
// Devices + Sprint / Jump / Load metrics

const { useState: useTestsState } = React;

function TrendLine({ values, color, theme, direction = 'higher', width = 64, height = 22 }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - 4) + 2;
    const y = height - 2 - ((v - min) / range) * (height - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const last = values[values.length - 1];
  const lx = width - 2;
  const ly = height - 2 - ((last - min) / range) * (height - 4);
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
      <circle cx={lx} cy={ly} r="2.2" fill={color}/>
    </svg>
  );
}

function deltaColor(delta, direction) {
  if (delta === 0) return null; // neutral
  const improved = direction === 'lower' ? delta < 0 : delta > 0;
  return improved ? '#34d399' : '#fb923c';
}

function DeltaPill({ delta, direction, unit }) {
  if (delta == null) return null;
  const c = deltaColor(delta, direction);
  const sign = delta > 0 ? '+' : '';
  const abs = Math.abs(delta);
  const decimals = abs < 1 ? 2 : abs < 10 ? 1 : 0;
  return (
    <span style={{
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 11, fontWeight: 600,
      color: c || '#9095a8',
      letterSpacing: '0.02em',
    }}>
      {delta === 0 ? '–' : `${sign}${delta.toFixed(decimals)}${unit || ''}`}
    </span>
  );
}

function TestRow({ test, theme }) {
  const c = deltaColor(test.delta, test.direction) || theme.accent;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      borderBottom: `1px solid ${theme.subtleBorder}`,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: theme.text, letterSpacing: '-0.01em' }}>
          {test.label}
        </div>
        <div style={{
          fontSize: 11, color: theme.muted, marginTop: 2,
          fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.02em',
        }}>
          {test.why} · {test.date}
        </div>
        {test.note && (
          <div style={{
            fontSize: 11, color: '#fb923c', marginTop: 4,
            fontFamily: 'JetBrains Mono, monospace',
          }}>{test.note}</div>
        )}
      </div>
      <TrendLine values={test.history} color={c} theme={theme} direction={test.direction} />
      <div style={{ textAlign: 'right', minWidth: 64 }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 18, fontWeight: 600, color: theme.text,
          letterSpacing: '-0.02em', lineHeight: 1,
        }}>
          {test.latest}<span style={{ fontSize: 11, color: theme.muted, marginLeft: 2 }}>{test.unit}</span>
        </div>
        <div style={{ marginTop: 4 }}>
          <DeltaPill delta={test.delta} direction={test.direction} unit={test.unit} />
        </div>
      </div>
    </div>
  );
}

function TestSection({ title, subtitle, tests, theme }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '0 20px 8px',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, color: theme.muted,
          textTransform: 'uppercase', letterSpacing: '0.14em',
        }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 11, color: theme.muted }}>{subtitle}</div>
        )}
      </div>
      <div style={{
        margin: '0 16px',
        background: theme.card, border: `1px solid ${theme.border}`,
        borderRadius: 16, overflow: 'hidden',
      }}>
        {tests.map((t, i) => (
          <div key={t.id} style={{
            ...(i === tests.length - 1 ? { } : {}),
          }}>
            <div style={i === tests.length - 1 ? { '--lastrow': 1 } : null}>
              <TestRowWithLastBorder test={t} theme={theme} isLast={i === tests.length - 1} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestRowWithLastBorder({ test, theme, isLast }) {
  const c = deltaColor(test.delta, test.direction) || theme.accent;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      borderBottom: isLast ? 'none' : `1px solid ${theme.subtleBorder}`,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: theme.text, letterSpacing: '-0.01em' }}>
          {test.label}
        </div>
        <div style={{
          fontSize: 11, color: theme.muted, marginTop: 2,
          fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.02em',
        }}>
          {test.why} · {test.date}
        </div>
        {test.note && (
          <div style={{
            fontSize: 11, color: '#fb923c', marginTop: 4,
            fontFamily: 'JetBrains Mono, monospace',
          }}>{test.note}</div>
        )}
      </div>
      <TrendLine values={test.history} color={c} theme={theme} direction={test.direction} />
      <div style={{ textAlign: 'right', minWidth: 64 }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 18, fontWeight: 600, color: theme.text,
          letterSpacing: '-0.02em', lineHeight: 1,
        }}>
          {test.latest}<span style={{ fontSize: 11, color: theme.muted, marginLeft: 2 }}>{test.unit}</span>
        </div>
        <div style={{ marginTop: 4 }}>
          <DeltaPill delta={test.delta} direction={test.direction} unit={test.unit} />
        </div>
      </div>
    </div>
  );
}

function DeviceCard({ d, theme }) {
  const isLive = d.lastSync === 'Live';
  const connected = d.status === 'connected';
  return (
    <div style={{
      flex: '0 0 auto', width: 168,
      background: theme.card, border: `1px solid ${theme.border}`,
      borderRadius: 14, padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: connected ? d.color : theme.muted,
          boxShadow: isLive ? `0 0 0 4px ${d.color}33` : 'none',
        }} />
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10, color: theme.muted,
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>{d.battery}%</div>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
          {d.name}
        </div>
        <div style={{ fontSize: 11, color: theme.muted, marginTop: 3 }}>{d.category}</div>
      </div>
      <div style={{
        marginTop: 'auto', paddingTop: 6,
        borderTop: `1px solid ${theme.subtleBorder}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10, color: connected ? d.color : theme.muted,
          textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
        }}>
          {isLive ? '● Live' : connected ? 'Synced' : 'Idle'}
        </div>
        <div style={{ fontSize: 10, color: theme.muted }}>{d.lastSync}</div>
      </div>
    </div>
  );
}

function LoadGrid({ metrics, theme }) {
  const entries = Object.values(metrics);
  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{
        background: theme.card, border: `1px solid ${theme.border}`,
        borderRadius: 16, overflow: 'hidden',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
      }}>
        {entries.map((m, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const lastRow = row === Math.floor((entries.length - 1) / 2);
          return (
            <div key={m.label} style={{
              padding: '12px 14px',
              borderRight: col === 0 ? `1px solid ${theme.subtleBorder}` : 'none',
              borderBottom: lastRow ? 'none' : `1px solid ${theme.subtleBorder}`,
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10, color: theme.muted,
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>{m.label}</div>
              <div style={{
                display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6,
              }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 22, fontWeight: 600, color: theme.text,
                  letterSpacing: '-0.02em', lineHeight: 1,
                }}>{m.value}</div>
                {m.unit && (
                  <div style={{ fontSize: 11, color: theme.muted }}>{m.unit}</div>
                )}
              </div>
              <div style={{
                fontSize: 11, color: theme.secondary, marginTop: 6, lineHeight: 1.3,
              }}>
                {m.ctx}
                {m.delta != null && (
                  <span style={{
                    marginLeft: 6,
                    color: m.delta >= 0 ? '#34d399' : '#fb923c',
                    fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                  }}>{m.delta >= 0 ? '+' : ''}{m.delta}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TestsScreen({ theme, accent, athleteId, onAthleteChange }) {
  const sprints = SPRINT_TESTS[athleteId];
  const jumps = JUMP_TESTS[athleteId];
  const load = LOAD_METRICS[athleteId];

  return (
    <div style={{ paddingBottom: 24 }}>
      <ScreenHeader
        overline="Testing protocol"
        title="Performance"
        theme={theme}
      />

      {/* Athlete selector */}
      <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8 }}>
        {Object.values(ATHLETES).map(at => {
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
                opacity: active ? 1 : 0.55, transition: 'opacity 0.15s',
              }}
            >
              <AthleteAvatar athlete={at} size={28} />
              <span style={{ fontSize: 14, fontWeight: 500, color: theme.text }}>{at.name}</span>
            </button>
          );
        })}
      </div>

      {/* Devices strip */}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '0 20px 8px',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, color: theme.muted,
          textTransform: 'uppercase', letterSpacing: '0.14em',
        }}>Devices</div>
        <div style={{ fontSize: 11, color: accent, fontWeight: 500, cursor: 'pointer' }}>
          Pair new
        </div>
      </div>
      <div style={{
        display: 'flex', gap: 10, overflowX: 'auto',
        padding: '0 16px 16px',
        scrollbarWidth: 'none',
      }}>
        {DEVICES.map(d => <DeviceCard key={d.id} d={d} theme={theme} />)}
      </div>

      {/* Flags for this athlete */}
      {FLAGS[athleteId] && FLAGS[athleteId].length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            padding: '0 20px 8px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, color: theme.muted,
            textTransform: 'uppercase', letterSpacing: '0.14em',
          }}>Flags & Recommendations</div>
          <FlagsList athleteId={athleteId} theme={theme} />
        </div>
      )}

      <TestSection title="Sprints" subtitle="5 tests · last 5 attempts" tests={sprints} theme={theme} />
      <TestSection title="Jumps & Power" subtitle="4 tests" tests={jumps} theme={theme} />

      {/* Load section */}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '0 20px 8px',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, color: theme.muted,
          textTransform: 'uppercase', letterSpacing: '0.14em',
        }}>Load & Conditioning</div>
        <div style={{ fontSize: 11, color: theme.muted }}>This session</div>
      </div>
      <LoadGrid metrics={load} theme={theme} />

      {/* Data Sources */}
      <div style={{ marginTop: 24 }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          padding: '0 20px 8px',
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, color: theme.muted,
            textTransform: 'uppercase', letterSpacing: '0.14em',
          }}>Data Sources</div>
          <div style={{ fontSize: 11, color: theme.muted }}>Ingestion tier</div>
        </div>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DATA_SOURCES.map(s => {
            const cur = INGESTION_TIERS.find(t => t.id === s.current);
            const tgt = INGESTION_TIERS.find(t => t.id === s.target);
            const isTarget = s.current === s.target;
            return (
              <div key={s.id} style={{
                background: theme.card, border: `1px solid ${theme.border}`,
                borderRadius: 14, padding: '12px 14px',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: s.color }} />
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: theme.text, letterSpacing: '-0.01em' }}>{s.name}</div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10, color: isTarget ? '#34d399' : theme.muted, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>{isTarget ? 'On target' : 'MVP'}</div>
                </div>
                <div style={{
                  fontSize: 12, color: theme.secondary, lineHeight: 1.45,
                }}>{s.notes}</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', background: theme.subtleBg, borderRadius: 8,
                }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10, color: theme.muted,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>Now</span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11, color: theme.text, fontWeight: 600,
                  }}>{cur.tier}</span>
                  <span style={{ color: theme.muted, fontSize: 11 }}>→</span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10, color: theme.muted,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>Target</span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11, color: isTarget ? '#34d399' : accent, fontWeight: 600,
                  }}>{tgt.tier}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ingestion-tier ladder */}
        <div style={{ padding: '12px 16px 0' }}>
          <div style={{
            background: theme.card, border: `1px solid ${theme.border}`,
            borderRadius: 14, overflow: 'hidden',
          }}>
            <div style={{
              padding: '10px 14px',
              borderBottom: `1px solid ${theme.subtleBorder}`,
              background: theme.subtleBg,
              fontSize: 12, fontWeight: 600, color: theme.text, letterSpacing: '-0.01em',
            }}>Ingestion ladder</div>
            {INGESTION_TIERS.map((t, i) => (
              <div key={t.id} style={{
                display: 'grid',
                gridTemplateColumns: '20px 1fr auto auto',
                gap: 10, alignItems: 'center',
                padding: '10px 14px',
                borderBottom: i < INGESTION_TIERS.length - 1 ? `1px solid ${theme.subtleBorder}` : 'none',
              }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10, color: theme.muted, fontWeight: 600,
                }}>L{t.level}</div>
                <div>
                  <div style={{ fontSize: 13, color: theme.text, fontWeight: 500 }}>{t.tier}</div>
                  <div style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>{t.method}</div>
                </div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 999,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: t.mvp ? '#34d399' : theme.muted,
                  background: t.mvp ? 'rgba(52,211,153,0.12)' : theme.subtleBg,
                }}>MVP</div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 999,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: t.full ? accent : theme.muted,
                  background: t.full ? `${accent}1f` : theme.subtleBg,
                }}>Full</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TestsScreen });

function TestingScheduleScreen({ theme, accent }) {
  return (
    <div style={{ paddingBottom: 24 }}>
      <ScreenHeader overline="Protocol" title="Testing Schedule" theme={theme} />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {TESTING_SCHEDULE.map((b, i) => (
          <div key={i} style={{
            background: theme.card, border: `1px solid ${theme.border}`,
            borderRadius: 16, overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              padding: '12px 14px',
              borderBottom: `1px solid ${theme.subtleBorder}`,
              background: theme.subtleBg,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, letterSpacing: '-0.01em' }}>
                {b.day}
              </div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10, color: accent, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>{b.when}</div>
            </div>
            <div>
              {b.items.map((it, j) => (
                <div key={j} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderBottom: j < b.items.length - 1 ? `1px solid ${theme.subtleBorder}` : 'none',
                }}>
                  <div style={{ fontSize: 14, color: theme.text }}>{it.name}</div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 12, color: theme.muted, letterSpacing: '0.02em',
                  }}>{it.detail}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { TestingScheduleScreen });
