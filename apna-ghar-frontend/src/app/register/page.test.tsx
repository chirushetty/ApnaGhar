import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "./page";
import { AuthProvider } from "@/lib/auth-context";
import * as api from "@/lib/api";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return { ...actual, login: vi.fn(), register: vi.fn() };
});

function renderRegister() {
  return render(
    <AuthProvider>
      <RegisterPage />
    </AuthProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("RegisterPage", () => {
  it("renders name, email and password fields and a submit button", () => {
    renderRegister();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("rejects a short password without calling the api", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText(/name/i), "New User");
    await user.type(screen.getByLabelText(/email/i), "new@user.com");
    await user.type(screen.getByLabelText(/password/i), "123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/at least 6 characters/i)).toBeInTheDocument();
    expect(api.register).not.toHaveBeenCalled();
  });

  it("registers and redirects home on success", async () => {
    vi.mocked(api.register).mockResolvedValue({
      token: "t",
      user: { id: "1", email: "new@user.com", displayName: "New User" },
    });
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText(/name/i), "New User");
    await user.type(screen.getByLabelText(/email/i), "new@user.com");
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(api.register).toHaveBeenCalledWith("new@user.com", "secret123", "New User");
    expect(push).toHaveBeenCalledWith("/");
  });

  it("shows the server error when the email is already registered", async () => {
    vi.mocked(api.register).mockRejectedValue(new api.ApiError("Email already registered.", 409));
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText(/name/i), "New User");
    await user.type(screen.getByLabelText(/email/i), "taken@user.com");
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/email already registered/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
