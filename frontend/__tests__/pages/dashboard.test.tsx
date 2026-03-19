import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";
import { useWalletStore } from "@/lib/store";
import { useEscrowStore } from "@/lib/store";

// Mock the stores
vi.mock("@/lib/store", () => ({
  useWalletStore: vi.fn(),
  useEscrowStore: vi.fn(),
  useTransactionStore: vi.fn(),
  useToastStore: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock the dashboard context
vi.mock("@/components/dashboard/dashboard-context", () => ({
  useDashboardContext: () => ({
    wallet: {
      walletAddress: "GBXGQJWVL7XRJHQR6Y4DH5N2VW3XZJK4L5M6N7O8P9Q0R1S2T3U4V5W6",
      walletNetwork: "TESTNET",
      walletBalance: 1000,
      walletOnTestnet: true,
      walletOnMainnet: false,
      isRefreshingBalance: false,
      lastBalanceUpdated: new Date(),
      refreshBalance: vi.fn(),
    },
    pushToast: vi.fn(),
  }),
}));

// Mock usePayment hook
vi.mock("@/lib/hooks/use-payment", () => ({
  usePayment: () => ({
    transactions: [],
    isSendingPayment: false,
    isCheckingRecipient: false,
    recipientExists: null,
    recipientAddress: "",
    paymentAmount: "",
    setRecipientAddress: vi.fn(),
    setPaymentAmount: vi.fn(),
    handlePaymentSubmit: vi.fn(),
    copyText: vi.fn(),
    successRate: 100,
  }),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useWalletStore).mockReturnValue({
      walletAddress: "GBXGQJWVL7XRJHQR6Y4DH5N2VW3XZJK4L5M6N7O8P9Q0R1S2T3U4V5W6",
      walletNetwork: "TESTNET",
      walletBalance: 1000,
      isConnecting: false,
      setWallet: vi.fn(),
      disconnect: vi.fn(),
    });
    vi.mocked(useEscrowStore).mockReturnValue({
      escrows: [],
      addEscrow: vi.fn(),
      updateEscrow: vi.fn(),
      removeEscrow: vi.fn(),
    });
  });

  it("renders dashboard page with main sections", () => {
    render(<DashboardPage />);
    expect(
      screen.getByText(/Rent payment control center/i),
    ).toBeInTheDocument();
  });

  it("displays wallet balance", () => {
    render(<DashboardPage />);
    expect(screen.getAllByText(/1,000\.00 XLM/i).length).toBeGreaterThan(0);
  });

  it("shows USD estimate of balance", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/\$120\.00 USD/i)).toBeInTheDocument();
  });

  it("displays auto-refresh indicator", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Auto-refresh in/i)).toBeInTheDocument();
  });

  it("shows wallet health section", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Wallet health/i)).toBeInTheDocument();
  });

  it("displays wallet health score", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/100\/100/i)).toBeInTheDocument();
  });

  it("shows wallet health label", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Excellent/i)).toBeInTheDocument();
  });

  it("displays wallet address summary", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/GBXG\.\.\.V5W6/i)).toBeInTheDocument();
  });

  it("shows transaction count", () => {
    render(<DashboardPage />);
    expect(
      screen.getByRole("heading", { name: /^Transactions$/i }),
    ).toBeInTheDocument();
  });

  it("shows escrow count", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Escrows/i)).toBeInTheDocument();
  });

  it("displays success rate", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/100\.0%/i)).toBeInTheDocument();
  });

  it("shows quick transfer section", () => {
    render(<DashboardPage />);
    expect(
      screen.getByRole("heading", { name: /^Quick transfer$/i }),
    ).toBeInTheDocument();
  });

  it("has Send and Receive tabs", () => {
    render(<DashboardPage />);
    expect(screen.getAllByRole("button", { name: /^Send$/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /^Receive$/i }).length).toBeGreaterThan(0);
  });

  it("shows quick action buttons", () => {
    render(<DashboardPage />);
    expect(
      screen.getByRole("button", { name: /Split Bill/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Top Up/i })).toBeInTheDocument();
  });

  it("displays network status badge", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/TESTNET/i)).toBeInTheDocument();
  });

  it("shows wallet health tips button", () => {
    render(<DashboardPage />);
    expect(
      screen.getByRole("button", { name: /Quick wallet tip/i }),
    ).toBeInTheDocument();
  });

  it("renders search functionality", () => {
    render(<DashboardPage />);
    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();
  });

  it("displays balance refresh timer", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Auto-refresh in \d+s/i)).toBeInTheDocument();
  });

  it("shows estimated USD label", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/est\./i)).toBeInTheDocument();
  });

  it("displays wallet address section label", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/^Address$/i)).toBeInTheDocument();
  });

  it("renders health progress bar", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Health score/i)).toBeInTheDocument();
  });

  it("shows connected wallet status", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/TESTNET/i)).toBeInTheDocument();
  });

  it("displays page subtitle", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Live wallet balance/i)).toBeInTheDocument();
  });
});
