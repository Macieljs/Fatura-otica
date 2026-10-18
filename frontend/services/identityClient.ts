import { identityOperations, type IdentityOperations, type Schemas } from "@/generated/identity";

type Me = Schemas["Me"];
type Session = Schemas["Session"];
let accessToken: string | null = null;
let currentMe: Me | null = null;
let refreshInFlight: Promise<Session> | null = null;
let restoreInFlight: Promise<Me | null> | null = null;
let sessionVersion = 0;
export const SESSION_CHANGED = "fatura_otica_session_change";

function checkVersion(version: number) {
  if (version !== sessionVersion) throw new IdentityApiError(401, "session_changed", "A sessão foi alterada. Entre novamente.");
}

async function withCookieLock<T>(action: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks) return navigator.locks.request("fatura-identity-cookie", action);
  return action();
}

export class IdentityApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message);
    this.name = "IdentityApiError";
  }
}

function notify() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_CHANGED));
}

function clearSession() {
  accessToken = null;
  currentMe = null;
  sessionVersion++;
  notify();
}

function saveSession(session: Session) {
  accessToken = session.accessToken;
  currentMe = session.me;
  notify();
  return session;
}

async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const problem = await response.json().catch(() => null) as Partial<Schemas["Problem"]> | null;
    const message = response.status === 401 ? "Sessão inválida ou credenciais incorretas."
      : response.status === 403 ? "Você não tem permissão para esta ação."
      : response.status === 409 ? "A alteração conflita com o estado atual. Atualize os dados e tente novamente."
      : response.status === 429 ? "Muitas tentativas. Aguarde antes de tentar novamente."
      : response.status === 400 ? "Confira os dados informados e a validade do link."
      : "Não foi possível concluir a solicitação. Tente novamente.";
    throw new IdentityApiError(response.status, problem?.code ?? "request_failed", message);
  }
  if (response.status === 204 || response.headers.get("content-length") === "0") return undefined as T;
  const text = await response.text();
  return text ? JSON.parse(text) as T : undefined as T;
}

async function csrfToken(): Promise<string> {
  const response = await fetch(identityOperations.identityGetCsrfToken.path, {
    credentials: "include", cache: "no-store", headers: { Accept: "application/json" },
  });
  return (await readResponse<Schemas["CsrfToken"]>(response)).csrfToken;
}

async function refreshSession(): Promise<Session> {
  if (refreshInFlight) return refreshInFlight;
  const version = sessionVersion;
  refreshInFlight = withCookieLock(async () => {
    try {
      const csrf = await csrfToken();
      const response = await fetch(identityOperations.identityRefresh.path, {
        method: "POST", credentials: "include", cache: "no-store",
        headers: { "X-CSRF-Token": csrf, Accept: "application/json" },
      });
      const session = await readResponse<Session>(response);
      checkVersion(version);
      return saveSession(session);
    } catch (error) {
      if (version === sessionVersion) clearSession();
      throw error;
    } finally {
      refreshInFlight = null;
    }
  });
  return refreshInFlight;
}

export function getCurrentMe(): Me | null { return currentMe; }

export async function restoreSession(): Promise<Me | null> {
  if (currentMe) return currentMe;
  if (restoreInFlight) return restoreInFlight;
  restoreInFlight = refreshSession().then(session => session.me).catch(error => {
    if (error instanceof IdentityApiError && (error.status === 401 || error.status === 403)) return null;
    throw error;
  }).finally(() => { restoreInFlight = null; });
  return restoreInFlight;
}

export async function request<K extends keyof IdentityOperations>(
  operation: K, body?: IdentityOperations[K]["body"], path?: IdentityOperations[K]["path"],
): Promise<IdentityOperations[K]["response"]> {
  const version = sessionVersion;
  const definition = identityOperations[operation];
  const publicRequest = operation === "identityLogin" || operation === "identityCompleteActivation";
  let url: string = definition.path;
  if (path) for (const [key, value] of Object.entries(path)) url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
  if (url.includes("{")) throw new Error("Parâmetro de rota ausente.");
  const send = () => fetch(url, {
    method: definition.method, credentials: "include", cache: "no-store",
    headers: { Accept: "application/json", ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(!publicRequest && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const tokenAtStart = accessToken;
  let response = await send();
  checkVersion(version);
  if (response.status === 401 && !publicRequest && operation !== "identityRefresh" && operation !== "identityLogout" && operation !== "identityGetCsrfToken") {
    // Concurrent 401s share one rotation; a request arriving late reuses its result.
    if (accessToken === tokenAtStart) await refreshSession();
    response = await send();
    if (response.status === 401) clearSession();
  }
  const result = await readResponse<IdentityOperations[K]["response"]>(response);
  checkVersion(version);
  return result;
}

export async function login(email: string, password: string): Promise<Session> {
  // A late restoration must never overwrite this explicit sign-in.
  sessionVersion++;
  const version = sessionVersion;
  if (refreshInFlight) await refreshInFlight.catch(() => undefined);
  checkVersion(version);
  const session = await request("identityLogin", { email, password });
  checkVersion(version);
  return saveSession(session);
}

export function completeActivation(body: Schemas["ActivationRequest"]): Promise<void> {
  return request("identityCompleteActivation", body);
}

export async function selectBranch(branchId: string): Promise<Me> {
  const version = sessionVersion;
  const me = await request("identitySelectBranch", { branchId });
  checkVersion(version);
  currentMe = me;
  notify();
  return currentMe;
}

export async function reloadMe(): Promise<Me> {
  const version = sessionVersion;
  const me = await request("identityGetMe");
  checkVersion(version);
  currentMe = me;
  notify();
  return currentMe;
}

export async function logout(): Promise<void> {
  if (refreshInFlight) await refreshInFlight.catch(() => undefined);
  try { await withCookieLock(async () => {
    const csrf = await csrfToken();
    await readResponse<void>(await fetch(identityOperations.identityLogout.path, {
      method: "POST", credentials: "include", cache: "no-store",
      headers: { "X-CSRF-Token": csrf, Accept: "application/json" },
    }));
  });
  } finally { clearSession(); }
}

export const identityClient = { request, login, completeActivation, selectBranch, getCurrentMe, reloadMe, restoreSession, logout };
