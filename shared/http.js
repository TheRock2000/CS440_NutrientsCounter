async function readJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  return JSON.parse(text);
}

async function fetchJson(url, options = {}) {
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body
  });

  return {
    ok: response.ok,
    status: response.status,
    headers: response.headers,
    body: await readJsonResponse(response)
  };
}

module.exports = {
  fetchJson,
  readJsonResponse
};
