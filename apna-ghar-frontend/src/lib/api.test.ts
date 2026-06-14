import { describe, it, expect, vi, beforeEach } from "vitest";
import { login, register, ApiError } from "./api";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("api client", () => {
  it("login posts credentials and returns the auth response", async () => {
    const body = { token: "t", user: { id: "1", email: "a@b.com", displayName: "A" } };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => body });
    vi.stubGlobal("fetch", fetchMock);

    const res = await login("a@b.com", "pw");

    expect(res).toEqual(body);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toContain("/api/auth/login");
    expect(opts.method).toBe("POST");
    expect(opts.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(opts.body)).toEqual({ email: "a@b.com", password: "pw" });
  });

  it("login throws ApiError carrying status and server message on failure", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: "Invalid email or password." }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(login("a@b.com", "wrong")).rejects.toBeInstanceOf(ApiError);
    await expect(login("a@b.com", "wrong")).rejects.toMatchObject({
      status: 401,
      message: "Invalid email or password.",
    });
  });

  it("register posts email, password and displayName", async () => {
    const body = { token: "t", user: { id: "1", email: "a@b.com", displayName: "A" } };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => body });
    vi.stubGlobal("fetch", fetchMock);

    await register("a@b.com", "pw", "A");

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toContain("/api/auth/register");
    expect(JSON.parse(opts.body)).toEqual({
      email: "a@b.com",
      password: "pw",
      displayName: "A",
    });
  });
});
