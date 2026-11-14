import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { AuthProvider, useAuth, AUTH_STORAGE_KEY } from "./auth-context";
import * as api from "./api";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api")>();
  return { ...actual, login: vi.fn(), register: vi.fn() };
});

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("auth context", () => {
  it("login stores token and user, and persists to localStorage", async () => {
    vi.mocked(api.login).mockResolvedValue({
      token: "t",
      user: { id: "1", email: "a@b.com", displayName: "A" },
    });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login("a@b.com", "pw");
    });

    expect(result.current.user?.email).toBe("a@b.com");
    expect(result.current.token).toBe("t");
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)!).token).toBe("t");
  });

  it("logout clears state and storage", async () => {
    vi.mocked(api.login).mockResolvedValue({
      token: "t",
      user: { id: "1", email: "a@b.com", displayName: "A" },
    });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login("a@b.com", "pw");
    });
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it("hydrates from localStorage on mount", async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: "t2", user: { id: "9", email: "x@y.com", displayName: "X" } }),
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.user?.email).toBe("x@y.com"));
    expect(result.current.token).toBe("t2");
  });
});
