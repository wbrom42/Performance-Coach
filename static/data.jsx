// Sample data + tokens for Performance Coach v2

const ACCENT_PALETTES = {
  electric: { name: 'Electric', primary: '#4f8fff', hue: 217 },
  signal:   { name: 'Signal',   primary: '#34d399', hue: 158 },
  ember:    { name: 'Ember',    primary: '#fb923c', hue: 25  },
  violet:   { name: 'Violet',   primary: '#a78bfa', hue: 263 },
};

const READINESS_SCALE = [
  { min: 4.5, label: 'Excellent', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  { min: 3.5, label: 'Good',      color: '#a3e635', bg: 'rgba(163,230,53,0.12)' },
  { min: 2.5, label: 'Moderate',  color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  { min: 1.5, label: 'Low',       color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  { min: 0,   label: 'Very Low',  color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
];

function readinessTier(avg) {
  return READINESS_SCALE.find(t => avg >= t.min) || READINESS_SCALE[READINESS_SCALE.length-1];
}

const RATING_DIMENSIONS = [
  { id: 'energy',     label: 'Energy',     hint: 'How awake do you feel?', emoji: '⚡',
    lowLabel: 'Drained', highLabel: 'Charged' },
  { id: 'sleep',      label: 'Sleep',      hint: 'How well did you sleep?', emoji: '🌙',
    lowLabel: 'Restless', highLabel: 'Restorative' },
  { id: 'soreness',   label: 'Soreness',   hint: 'How sore are you? (5 = no soreness)', emoji: '🔥',
    lowLabel: 'Very Sore', highLabel: 'Fresh' },
  { id: 'motivation', label: 'Motivation', hint: 'How ready to train?', emoji: '💪',
    lowLabel: 'Reluctant', highLabel: 'Eager' },
];

const RATING_LABELS = ['Very Low', 'Low', 'Okay', 'Good', 'Great'];

const EXERCISE_SLUGS = {
  'Tibialis raises': 'tibialis',
  'KOT calf raises': 'calf',
  'ATG split squat': 'split-squat',
  'Couch stretch': 'couch',
  '20m acceleration': 'sprint',
  '30m fly-in': 'flyin',
  'Pro-agility shuttle': 'shuttle',
  'Front squat': 'front-squat',
  'Bulgarian split squat': 'bulgarian',
  'Nordic curl': 'nordic',
  'Hanging leg raise': 'leg-raise',
};

const ATHLETES = {
  tristan: {
    id: 'tristan',
    name: 'Tristan',
    initials: 'T',
    age: 16,
    position: 'Midfielder',
    avatarHue: 217,
    today: { energy: 5, sleep: 4, soreness: 3, motivation: 5, time: '9:42 PM', submitted: true },
    week: [
      { day: 'Mon', date: 'May 4', scores: { energy: 5, sleep: 4, soreness: 4, motivation: 5 }, note: 'Speed day' },
      { day: 'Tue', date: 'May 5', scores: null, note: 'Rest' },
      { day: 'Wed', date: 'May 6', scores: { energy: 5, sleep: 5, soreness: 5, motivation: 5 }, note: 'Strength day' },
      { day: 'Thu', date: 'May 7', scores: null, note: 'Rest' },
      { day: 'Fri', date: 'May 8', scores: { energy: 4, sleep: 3, soreness: 3, motivation: 4 }, note: 'Light soreness' },
      { day: 'Sat', date: 'May 9', scores: null, note: 'Match' },
      { day: 'Sun', date: 'May 10', scores: { energy: 4, sleep: 5, soreness: 4, motivation: 4 }, note: 'Recovery' },
    ],
    weekAvg: 4.4,
    weekDelta: +0.2,
    sessions: '3/3',
    coachNote: "Linear acceleration is improving — 20m splits dropped another 0.1s. Soreness crept up Friday but he managed well. Next week: protect sleep on school nights.",
  },
  kennedy: {
    id: 'kennedy',
    name: 'Kennedy',
    initials: 'K',
    age: 15,
    position: 'Forward',
    avatarHue: 25,
    today: { energy: 3, sleep: 2, soreness: 4, motivation: 3, time: '8:18 PM', submitted: true },
    week: [
      { day: 'Mon', date: 'May 4', scores: { energy: 3, sleep: 4, soreness: 5, motivation: 4 }, note: 'Speed day' },
      { day: 'Tue', date: 'May 5', scores: null, note: 'Rest' },
      { day: 'Wed', date: 'May 6', scores: { energy: 4, sleep: 3, soreness: 4, motivation: 3 }, note: 'Strength day' },
      { day: 'Thu', date: 'May 7', scores: null, note: 'Rest' },
      { day: 'Fri', date: 'May 8', scores: { energy: 3, sleep: 3, soreness: 3, motivation: 3 }, note: 'Tired' },
      { day: 'Sat', date: 'May 9', scores: null, note: 'Match' },
      { day: 'Sun', date: 'May 10', scores: { energy: 3, sleep: 2, soreness: 4, motivation: 3 }, note: 'Late night' },
    ],
    weekAvg: 3.2,
    weekDelta: -0.3,
    sessions: '2/3',
    coachNote: "Sleep is the bottleneck — three of four readings under 3. Talk through phone-curfew before Wednesday. Hold intensity steady; quality over volume.",
  },
};

const TODAY_PLAN = {
  date: 'Wednesday, May 13',
  blocks: [
    {
      id: 'warmup',
      name: 'ATG Warm-up',
      duration: '12 min',
      status: 'complete',
      tag: 'Coach-led',
      exercises: [
        { name: 'Tibialis raises', detail: '2 × 25' },
        { name: 'KOT calf raises', detail: '2 × 10/side' },
        { name: 'ATG split squat', detail: '2 × 5/side · BW' },
        { name: 'Couch stretch', detail: '60s/side' },
      ],
    },
    {
      id: 'speed',
      name: 'Speed Block',
      duration: '28 min',
      status: 'active',
      tag: 'On-field',
      accent: 'speed',
      exercises: [
        { name: '20m acceleration', detail: '3 sets · rest 90s' },
        { name: '30m fly-in', detail: '3 sets · rest 2 min' },
        { name: 'Pro-agility shuttle', detail: '4 sets · rest 60s' },
      ],
    },
    {
      id: 'strength',
      name: 'Strength Block',
      duration: '35 min',
      status: 'queued',
      tag: 'Weight room',
      accent: 'strength',
      exercises: [
        { name: 'Front squat', detail: '3 × 5 @ RPE 7' },
        { name: 'Bulgarian split squat', detail: '3 × 8/side' },
        { name: 'Nordic curl', detail: '3 × 6' },
        { name: 'Hanging leg raise', detail: '3 × 10' },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// DEVICES — wearable / timing systems
// ─────────────────────────────────────────────────────────────
const DEVICES = [
  {
    id: 'freelap',
    name: 'Freelap Advanced Pack',
    category: 'Sprint timing',
    use: 'Soccer — 10y, 20y, flying 10, curved sprint',
    status: 'connected',
    battery: 82,
    lastSync: '14 min ago',
    color: '#4f8fff',
  },
  {
    id: 'output',
    name: 'Output Sports V2',
    category: 'Inertial sensor',
    use: 'Jumps, CMJ, RSI, asymmetry',
    status: 'connected',
    battery: 64,
    lastSync: '2 hr ago',
    color: '#a78bfa',
  },
  {
    id: 'polar',
    name: 'Polar H10',
    category: 'HR strap',
    use: 'Heart rate, recovery, HRV',
    status: 'connected',
    battery: 91,
    lastSync: 'Live',
    color: '#f87171',
  },
  {
    id: 'apex',
    name: 'STATSports APEX',
    category: 'GPS pod',
    use: 'Distance, HSR, sprint count, max speed',
    status: 'idle',
    battery: 45,
    lastSync: 'Yesterday',
    color: '#34d399',
  },
];

// ─────────────────────────────────────────────────────────────
// TEST DATA — sprints, jumps, load
// Per-athlete latest result + 5-attempt history (oldest → newest)
// ─────────────────────────────────────────────────────────────

// helper: direction='lower' means lower number is better (times)
const SPRINT_TESTS = {
  tristan: [
    { id: '10y',    label: '10-yard sprint', why: 'First-step acceleration',
      unit: 's', direction: 'lower', latest: 1.78, pr: 1.76, delta: -0.02,
      history: [1.84, 1.82, 1.81, 1.80, 1.78], date: 'May 10' },
    { id: '20y',    label: '20-yard sprint', why: 'Soccer-relevant acceleration',
      unit: 's', direction: 'lower', latest: 3.05, pr: 3.02, delta: -0.04,
      history: [3.14, 3.11, 3.09, 3.09, 3.05], date: 'May 10' },
    { id: 'fly10',  label: 'Flying 10', why: 'Top-speed exposure',
      unit: 's', direction: 'lower', latest: 1.12, pr: 1.10, delta: 0.00,
      history: [1.15, 1.13, 1.12, 1.12, 1.12], date: 'May 8' },
    { id: 'curved', label: 'Curved sprint', why: 'Soccer running line',
      unit: 's', direction: 'lower', latest: 3.18, pr: 3.15, delta: -0.01,
      history: [3.22, 3.21, 3.20, 3.19, 3.18], date: 'May 6' },
    { id: '505',    label: '5-10-5 shuttle', why: 'Change of direction',
      unit: 's', direction: 'lower', latest: 4.71, pr: 4.68, delta: -0.03,
      history: [4.82, 4.78, 4.75, 4.74, 4.71], date: 'May 6' },
  ],
  kennedy: [
    { id: '10y',    label: '10-yard sprint', why: 'First-step acceleration',
      unit: 's', direction: 'lower', latest: 1.92, pr: 1.88, delta: 0.01,
      history: [1.95, 1.91, 1.90, 1.91, 1.92], date: 'May 10' },
    { id: '20y',    label: '20-yard sprint', why: 'Soccer-relevant acceleration',
      unit: 's', direction: 'lower', latest: 3.24, pr: 3.20, delta: 0.00,
      history: [3.30, 3.27, 3.24, 3.24, 3.24], date: 'May 10' },
    { id: 'fly10',  label: 'Flying 10', why: 'Top-speed exposure',
      unit: 's', direction: 'lower', latest: 1.21, pr: 1.19, delta: -0.01,
      history: [1.25, 1.24, 1.22, 1.22, 1.21], date: 'May 8' },
    { id: 'curved', label: 'Curved sprint', why: 'Soccer running line',
      unit: 's', direction: 'lower', latest: 3.34, pr: 3.31, delta: 0.02,
      history: [3.38, 3.34, 3.32, 3.32, 3.34], date: 'May 6' },
    { id: '505',    label: '5-10-5 shuttle', why: 'Change of direction',
      unit: 's', direction: 'lower', latest: 4.95, pr: 4.92, delta: 0.00,
      history: [5.05, 5.02, 4.97, 4.95, 4.95], date: 'May 6' },
  ],
};

const JUMP_TESTS = {
  tristan: [
    { id: 'cmj',     label: 'Countermovement jump', why: 'Lower-body power',
      unit: 'cm', direction: 'higher', latest: 48.2, pr: 49.1, delta: +0.4,
      history: [46.8, 47.2, 47.5, 47.8, 48.2], date: 'May 10' },
    { id: 'rsi',     label: 'Repeated pogo / RSI', why: 'Elasticity, stiffness',
      unit: '', direction: 'higher', latest: 2.34, pr: 2.41, delta: +0.06,
      history: [2.18, 2.22, 2.28, 2.28, 2.34], date: 'May 9' },
    { id: 'broad',   label: 'Broad jump', why: 'Horizontal power',
      unit: 'cm', direction: 'higher', latest: 245, pr: 248, delta: +2,
      history: [238, 240, 242, 243, 245], date: 'May 8' },
    { id: 'slhop',   label: 'Single-leg hop & stick', why: 'Control / asymmetry',
      unit: '%', direction: 'higher', latest: 96, pr: 98, delta: +1,
      history: [92, 93, 94, 95, 96], date: 'May 6',
      note: 'L/R asymmetry 4%' },
  ],
  kennedy: [
    { id: 'cmj',     label: 'Countermovement jump', why: 'Lower-body power',
      unit: 'cm', direction: 'higher', latest: 41.6, pr: 42.8, delta: -0.3,
      history: [42.1, 42.4, 42.2, 41.9, 41.6], date: 'May 10' },
    { id: 'rsi',     label: 'Repeated pogo / RSI', why: 'Elasticity, stiffness',
      unit: '', direction: 'higher', latest: 1.92, pr: 2.04, delta: -0.05,
      history: [2.01, 1.98, 1.97, 1.97, 1.92], date: 'May 9' },
    { id: 'broad',   label: 'Broad jump', why: 'Horizontal power',
      unit: 'cm', direction: 'higher', latest: 218, pr: 224, delta: -1,
      history: [222, 220, 220, 219, 218], date: 'May 8' },
    { id: 'slhop',   label: 'Single-leg hop & stick', why: 'Control / asymmetry',
      unit: '%', direction: 'higher', latest: 88, pr: 91, delta: 0,
      history: [86, 87, 89, 88, 88], date: 'May 6',
      note: 'L/R asymmetry 9% — flag' },
  ],
};

const LOAD_METRICS = {
  tristan: {
    sessionRPE:     { label: 'Session RPE',      why: 'Internal load',     value: 7,    unit: '/10',  ctx: "Today's session" },
    weeklyLoad:     { label: 'Weekly load',      why: 'Duration × RPE',    value: 1840, unit: 'AU',   ctx: 'vs 1720 last wk', delta: +120 },
    gpsDistance:    { label: 'Total distance',   why: 'Soccer volume',     value: 6.42, unit: 'km',   ctx: 'this session' },
    hsRunning:      { label: 'High-speed run',   why: 'Speed exposure',    value: 412,  unit: 'm',    ctx: '>5.5 m/s' },
    sprintCount:    { label: 'Sprint count',     why: 'Neuromuscular load',value: 14,   unit: '',     ctx: '>7.0 m/s efforts' },
    maxSpeed:       { label: 'Max speed',        why: 'Top-speed benchmark',value: 8.62,unit: 'm/s',  ctx: '31.0 km/h' },
  },
  kennedy: {
    sessionRPE:     { label: 'Session RPE',      why: 'Internal load',     value: 8,    unit: '/10',  ctx: "Today's session" },
    weeklyLoad:     { label: 'Weekly load',      why: 'Duration × RPE',    value: 1620, unit: 'AU',   ctx: 'vs 1680 last wk', delta: -60 },
    gpsDistance:    { label: 'Total distance',   why: 'Soccer volume',     value: 5.88, unit: 'km',   ctx: 'this session' },
    hsRunning:      { label: 'High-speed run',   why: 'Speed exposure',    value: 348,  unit: 'm',    ctx: '>5.5 m/s' },
    sprintCount:    { label: 'Sprint count',     why: 'Neuromuscular load',value: 11,   unit: '',     ctx: '>7.0 m/s efforts' },
    maxSpeed:       { label: 'Max speed',        why: 'Top-speed benchmark',value: 8.14,unit: 'm/s',  ctx: '29.3 km/h' },
  },
};

// ─────────────────────────────────────────────────────────────
// FLAGS — auto-generated recommendations
// kind: speed | power | workload | freshness
// severity: warn (yellow/orange) | caution (red) | ready (green)
// ─────────────────────────────────────────────────────────────
const FLAGS = {
  tristan: [
    {
      id: 'fresh',
      kind: 'freshness',
      severity: 'ready',
      title: 'Return to freshness',
      summary: 'Sleep, soreness, and CMJ have returned to baseline.',
      rec: 'Likely ready for full speed exposure today.',
      signals: [
        { label: 'Sleep', value: '5/5', tone: 'good' },
        { label: 'Soreness', value: '4/5', tone: 'good' },
        { label: 'CMJ', value: '48.2 cm', tone: 'good' },
      ],
    },
  ],
  kennedy: [
    {
      id: 'speed',
      kind: 'speed',
      severity: 'caution',
      title: 'Speed flag',
      summary: '10-yard time is 3% slower than baseline and soreness is rated 4/5 sore.',
      rec: 'Remove max-velocity work today. Substitute technical acceleration and mobility.',
      signals: [
        { label: '10-yard', value: '+3.0%', tone: 'bad' },
        { label: 'Soreness', value: '2/5', tone: 'bad' },
      ],
    },
    {
      id: 'power',
      kind: 'power',
      severity: 'caution',
      title: 'Power flag',
      summary: 'CMJ is down 8% from rolling average after two high-load soccer days.',
      rec: 'Reduce lower-body lifting volume 25–40%.',
      signals: [
        { label: 'CMJ', value: '−8%', tone: 'bad' },
        { label: 'Load (2d)', value: 'High', tone: 'bad' },
      ],
    },
    {
      id: 'workload',
      kind: 'workload',
      severity: 'warn',
      title: 'Workload flag',
      summary: 'Sprint count and high-speed distance were high yesterday, readiness is Yellow today.',
      rec: 'No aggressive change-of-direction today.',
      signals: [
        { label: 'Sprints', value: '14 (high)', tone: 'warn' },
        { label: 'HSR', value: '412 m', tone: 'warn' },
        { label: 'Readiness', value: 'Yellow', tone: 'warn' },
      ],
    },
  ],
};

const TESTING_SCHEDULE = [
  { day: 'Monday', when: 'Before training', items: [
    { name: 'CMJ', detail: '×3' },
    { name: '10-yard sprint', detail: '×2' },
    { name: '20-yard sprint', detail: '×2' },
  ]},
  { day: 'Friday', when: 'Before training', items: [
    { name: 'CMJ', detail: '×3' },
    { name: 'Flying 10', detail: '×2' },
    { name: '5-10-5 shuttle', detail: '×2 each direction' },
  ]},
  { day: 'Every session', when: 'After training', items: [
    { name: 'Session RPE', detail: '0–10' },
    { name: 'Pain check', detail: 'Yes / No' },
    { name: 'Hydration', detail: 'Logged' },
    { name: 'Post-training fuel', detail: 'Logged' },
  ]},
  { day: 'Match days', when: 'GPS, if equipped', items: [
    { name: 'Total distance', detail: 'km' },
    { name: 'Max speed', detail: 'm/s' },
    { name: 'Sprint count', detail: '>7 m/s' },
    { name: 'High-speed distance', detail: '>5.5 m/s' },
    { name: 'Duration', detail: 'min' },
    { name: 'Session RPE', detail: '0–10' },
  ]},
];

const INGESTION_TIERS = [
  { id: 'manual',  tier: 'Manual entry',     method: 'Athlete/coach enters result',         mvp: true,  full: false, level: 1 },
  { id: 'csv',     tier: 'CSV upload',       method: 'Export from device app, upload here', mvp: true,  full: true,  level: 2 },
  { id: 'email',   tier: 'Email / share',    method: 'Forward export to ingest parser',     mvp: true,  full: true,  level: 2 },
  { id: 'api',     tier: 'API integration',  method: 'Pull / push data automatically',      mvp: false, full: true,  level: 3 },
  { id: 'sdk',     tier: 'Native SDK',       method: 'Direct integration with device API',  mvp: false, full: true,  level: 4 },
];

const DATA_SOURCES = [
  { id: 'freelap', name: 'Freelap Advanced Pack', current: 'csv',    target: 'api',    notes: 'CSV export via Freelap app',         color: '#4f8fff' },
  { id: 'output',  name: 'Output Sports V2',      current: 'csv',    target: 'api',    notes: 'CSV from web dashboard',             color: '#a78bfa' },
  { id: 'polar',   name: 'Polar H10',             current: 'sdk',    target: 'sdk',    notes: 'Bluetooth via Web Bluetooth API',    color: '#f87171' },
  { id: 'apex',    name: 'STATSports APEX',       current: 'csv',    target: 'api',    notes: 'CSV from Coach Series · API on Sonra tier', color: '#34d399' },
];

// ─────────────────────────────────────────────────────────────
// PROFILE — extended longitudinal data (4-week)
// ─────────────────────────────────────────────────────────────
const PROFILE_EXTRAS = {
  tristan: {
    weeklyReadiness: [4.0, 4.1, 4.2, 4.4],     // last 4 weeks, avg
    weeklyLoad:      [1580, 1650, 1720, 1840], // AU per week
    height: '5\'9"', weight: '142 lb',
    joined: 'Sep 2024',
    sessionsTotal: 47,
    streak: 12,
    notes: [
      { date: 'May 10', text: '20m split down 0.04s — best sustained block of the month.' },
      { date: 'May 6',  text: 'Strength day — front squat 3×5 @ 155, clean.' },
      { date: 'May 3',  text: 'Mentioned tight hip flexors → added 90/90 to warm-up.' },
    ],
    bests: [
      { test: '10-yard',    value: '1.76s',  date: 'Apr 19' },
      { test: '20-yard',    value: '3.02s',  date: 'Apr 19' },
      { test: 'CMJ',        value: '49.1 cm', date: 'Apr 26' },
      { test: 'Front squat',value: '165 lb × 3', date: 'May 1' },
    ],
  },
  kennedy: {
    weeklyReadiness: [3.6, 3.5, 3.5, 3.2],
    weeklyLoad:      [1500, 1580, 1680, 1620],
    height: '5\'6"', weight: '128 lb',
    joined: 'Sep 2024',
    sessionsTotal: 39,
    streak: 4,
    notes: [
      { date: 'May 9',  text: 'Phone-curfew conversation — agreed to 10pm shutdown school nights.' },
      { date: 'May 6',  text: 'CMJ down 8% — pulled lifting volume back 30%.' },
      { date: 'May 2',  text: 'Reported L-hamstring tightness after match — monitor.' },
    ],
    bests: [
      { test: '10-yard',    value: '1.88s',  date: 'Mar 22' },
      { test: '20-yard',    value: '3.20s',  date: 'Mar 22' },
      { test: 'CMJ',        value: '42.8 cm', date: 'Apr 5' },
      { test: 'Front squat',value: '125 lb × 3', date: 'Apr 12' },
    ],
  },
};

Object.assign(window, { INGESTION_TIERS, DATA_SOURCES, PROFILE_EXTRAS, EXERCISE_SLUGS });
