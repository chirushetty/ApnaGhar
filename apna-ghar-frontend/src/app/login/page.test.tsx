import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./page";
import { AuthProvider } from "@/lib/auth-context";
import * as api from "@/lib/api";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return { ...actual, login: vi.fn(), register: vi.fn() };
});

function renderLogin() {
  return render(
    <AuthProvider>
      <LoginPage />
    </AuthProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("LoginPage", () => {
  it("renders email and password fields and a submit button", () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("shows a validation error and does not call the api on empty submit", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole("button", { name: /log in/i }));
    expect(await screen.findByText(/enter your email and password/i)).toBeInTheDocument();
    expect(api.login).not.toHaveBeenCalled();
  });

  it("logs in and redirects home on success", async () => {
    vi.mocked(api.login).mockResolvedValue({
      token: "t",
      user: { id: "1", email: "a@b.com", displayName: "A" },
    });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/email/i), "a@b.com");
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(api.login).toHaveBeenCalledWith("a@b.com", "secret123");
    expect(push).toHaveBeenCalledWith("/");
  });

  it("shows the server error message on failed login", async () => {
    vi.mocked(api.login).mockRejectedValue(new api.ApiError("Invalid email or password.", 401));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/email/i), "a@b.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
