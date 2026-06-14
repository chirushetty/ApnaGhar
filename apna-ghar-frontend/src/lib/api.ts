// Typed client for the ApnaGhar .NET backend.
// Base URL comes from NEXT_PUBLIC_API_BASE_URL (e.g. http://localhost:5180);
// it falls back to a relative path so a same-origin proxy also works.

export interface UserDto {
  id: string;
  email: string;
  displayName: string;
}

export interface AuthResponse {
  token: string;
  user: UserDto;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    // Backend returns { message } for auth errors and RFC-7807 { title } for validation.
    return data?.message ?? data?.title ?? `Request failed (${res.status}).`;
  } catch {
    return `Request failed (${res.status}).`;
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new ApiError(await extractErrorMessage(res), res.status);
  }

  return res.json() as Promise<T>;
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return postJson<AuthResponse>("/api/auth/login", { email, password });
}

export function register(
  email: string,
  password: string,
  displayName: string,
): Promise<AuthResponse> {
  return postJson<AuthResponse>("/api/auth/register", { email, password, displayName });
}
