// Performance Coach — API client
// Talks to FastAPI at API_BASE. Falls back to in-memory data if a request fails
// (so the prototype still renders during dev or when offline).

(function () {
  // Override via <meta name="api-base" content="http://host:port"> or window.API_BASE
  const meta = document.querySelector('meta[name="api-base"]');
  const API_BASE =
    window.API_BASE ||
    (meta && meta.content) ||
    // when served from the FastAPI static/ mount, use same-origin
    (location.origin && location.origin !== 'null' ? location.origin : 'http://192.168.68.53:8081');

  async function req(path, opts = {}) {
    const res = await fetch(`${API_BASE}/api/v1${path}`, {
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      ...opts,
    });
    if (!res.ok) throw new Error(`${res.status} ${path}`);
    if (res.status === 204) return null;
    return res.json();
  }

  const API = {
    base: API_BASE,
    listAthletes:        ()                  => req('/athletes'),
    getAthlete:          (id)                => req(`/athletes/${id}`),
    todayCheckin:        (id)                => req(`/athletes/${id}/checkins/today`),
    postCheckin:         (id, body)          => req(`/athletes/${id}/checkins`,
                                                   { method: 'POST', body: JSON.stringify(body) }),
    rangeCheckins:       (id, from, to)      => req(`/athletes/${id}/checkins?from=${from}&to=${to}`),
    sessionToday:        ()                  => req('/sessions/today'),
    setBlockStatus:      (sid, bid, status)  => req(`/sessions/${sid}/blocks/${bid}/status`,
                                                   { method: 'PUT', body: JSON.stringify({ status }) }),
    listTests:           (id, type='sprint') => req(`/athletes/${id}/tests?type=${type}`),
    postTest:            (id, body)          => req(`/athletes/${id}/tests`,
                                                   { method: 'POST', body: JSON.stringify(body) }),
    load:                (id, range='session') => req(`/athletes/${id}/load?range=${range}`),
    flags:               (id)                => req(`/athletes/${id}/flags`),
    ingestCsv:           (provider, athleteId, file) => {
      const fd = new FormData();
      fd.append('provider', provider);
      if (athleteId) fd.append('athlete_id', athleteId);
      fd.append('file', file);
      return fetch(`${API_BASE}/api/v1/ingest/csv`, { method: 'POST', body: fd }).then(r => r.json());
    },
  };

  // useApi(fn, deps) — lightweight hook that loads, retries, and exposes status.
  // Returns { data, error, loading, reload }.
  function useApi(loader, deps = []) {
    const [state, setState] = React.useState({ data: null, error: null, loading: true });
    const run = React.useCallback(() => {
      setState(s => ({ ...s, loading: true, error: null }));
      Promise.resolve(loader())
        .then(data => setState({ data, error: null, loading: false }))
        .catch(error => setState({ data: null, error, loading: false }));
    }, deps); // eslint-disable-line
    React.useEffect(run, [run]);
    return { ...state, reload: run };
  }

  window.API = API;
  window.useApi = useApi;
})();
