const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || "ISI_URL_WEB_APP_GOOGLE_APPS_SCRIPT_ANDA";

export async function callApi(action, params = {}) {
  try {
    const url = new URL(GAS_URL);
    url.searchParams.append('action', action);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    const res = await fetch(url.toString());
    return await res.json();
  } catch (err) {
    console.error("API GET Error:", err);
    return { status: "error", message: err.message };
  }
}

export async function postApi(action, payload = {}) {
  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload })
    });
    return await res.json();
  } catch (err) {
    console.error("API POST Error:", err);
    return { status: "error", message: err.message };
  }
}
