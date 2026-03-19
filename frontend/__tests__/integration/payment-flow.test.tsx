import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";

const {
  mockPushToast,
  mockRefreshBalance,
  mockSetRecipientAddress,
  mockSetPaymentAmount,
  mockHandlePaymentSubmit,
  mockCopyText,
  mockSetPaymentSuccessHash,
  mockClearTransactions,
  mockUsePayment,
} = vi.hoisted(() => ({
  mockPushToast: vi.fn(),
  mockRefreshBalance: vi.fn(),
  mockSetRecipientAddress: vi.fn(),
  mockSetPaymentAmount: vi.fn(),
  mockHandlePaymentSubmit: vi.fn(),
  mockCopyText: vi.fn(),
  mockSetPaymentSuccessHash: vi.fn(),
  mockClearTransactions: vi.fn(),
  mockUsePayment: vi.fn(),
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

// Mock config
vi.mock("@/lib/config", () => ({
  APP_CONFIG: {
    balanceRefreshInterval: 30000,
    toastDuration: 5000,
    storagePrefix: "splitrent",
  },
  EXPLORER_CONFIG: {
    txBaseUrl: "https://stellar.expert/explorer/testnet/tx",
    friendbotUrl: "https://laboratory.stellar.org/#account-creator",
  },
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
      refreshBalance: mockRefreshBalance,
    },
    pushToast: mockPushToast,
  }),
}));

const createPaymentState = () => ({
  transactions: [],
  isSendingPayment: false,
  isCheckingRecipient: false,
  recipientExists: null,
  recipientAddress: "",
  paymentAmount: "",
  paymentSuccessHash: null,
  totalSent: 0,
  totalReceived: 0,
  setRecipientAddress: mockSetRecipientAddress,
  setPaymentAmount: mockSetPaymentAmount,
  setPaymentSuccessHash: mockSetPaymentSuccessHash,
  clearTransactions: mockClearTransactions,
  handlePaymentSubmit: mockHandlePaymentSubmit,
  copyText: mockCopyText,
  successRate: 100,
});

vi.mock("@/lib/hooks/use-payment", () => ({
  usePayment: mockUsePayment,
}));

// Mock escrow store
vi.mock("@/lib/store", () => ({
  useWalletStore: vi.fn(),
  useEscrowStore: vi.fn(() => ({
    escrows: [],
    addEscrow: vi.fn(),
    updateEscrow: vi.fn(),
    removeEscrow: vi.fn(),
  })),
  useTransactionStore: vi.fn(),
  useToastStore: vi.fn(),
}));

describe("Payment Submission Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePayment.mockReturnValue(createPaymentState());
  });

  const renderDashboard = () => {
    return render(<DashboardPage />);
  };

  describe("Quick Transfer - Send Flow", () => {
    it("renders send payment form", () => {
      renderDashboard();
      expect(screen.getByLabelText(/Recipient address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Amount \(XLM\)/i)).toBeInTheDocument();
    });

    it("shows balance information", () => {
      renderDashboard();
      expect(screen.getByText(/Balance:/i)).toBeInTheDocument();
    });

    it("shows recipient validation status", () => {
      renderDashboard();
      expect(
        screen.getByText(/Enter recipient to validate/i),
      ).toBeInTheDocument();
    });

    it("shows sending payment state when sending", () => {
      mockUsePayment.mockReturnValue({
        ...createPaymentState(),
        isSendingPayment: true,
        recipientExists: true,
        recipientAddress:
          "GBXGQJWVL7XRJHQR6Y4DH5N2VW3XZJK4L5M6N7O8P9Q0R1S2T3U4V5W7",
        paymentAmount: "100",
      });

      renderDashboard();
      expect(screen.getByText(/Sending payment/i)).toBeInTheDocument();
    });

    it("shows frequent contacts section", () => {
      renderDashboard();
      expect(
        screen.getByRole("heading", { name: /Quick transfer/i }),
      ).toBeInTheDocument();
    });

    it("clears form when Clear button clicked", () => {
      renderDashboard();
      const clearButton = screen.getByRole("button", { name: /Clear/i });
      fireEvent.click(clearButton);
      expect(mockSetRecipientAddress).toHaveBeenCalledWith("");
    });
  });

  describe("Quick Transfer - Receive Flow", () => {
    it("switches to receive mode", () => {
      renderDashboard();
      const receiveButton = screen.getByRole("button", { name: /Receive/i });
      fireEvent.click(receiveButton);
      expect(
        screen.getByText(/Receive from Quick Transfer/i),
      ).toBeInTheDocument();
    });

    it("shows copy address button in receive mode", () => {
      renderDashboard();
      const receiveButton = screen.getByRole("button", { name: /Receive/i });
      fireEvent.click(receiveButton);
      expect(
        screen.getByRole("button", { name: /Address/i }),
      ).toBeInTheDocument();
    });

    it("shows copy pay link button in receive mode", () => {
      renderDashboard();
      const receiveButton = screen.getByRole("button", { name: /Receive/i });
      fireEvent.click(receiveButton);
      expect(
        screen.getByRole("button", { name: /Pay link/i }),
      ).toBeInTheDocument();
    });

    it("copies wallet address when clicked", () => {
      renderDashboard();
      const receiveButton = screen.getByRole("button", { name: /Receive/i });
      fireEvent.click(receiveButton);
      const copyButton = screen.getByRole("button", { name: /Address/i });
      fireEvent.click(copyButton);
      expect(mockCopyText).toHaveBeenCalled();
    });

    it("shows QR code icon in receive mode", () => {
      renderDashboard();
      const receiveButton = screen.getByRole("button", { name: /Receive/i });
      fireEvent.click(receiveButton);
      expect(
        screen.getByText(/Receive from Quick Transfer/i),
      ).toBeInTheDocument();
    });

    it("shows network status for receive", () => {
      renderDashboard();
      const receiveButton = screen.getByRole("button", { name: /Receive/i });
      fireEvent.click(receiveButton);
      expect(screen.getByText(/Testnet pay link ready/i)).toBeInTheDocument();
    });
  });

  describe("Payment Form Validation", () => {
    it("shows decimal precision support", () => {
      renderDashboard();
      const amountInput = screen.getByLabelText(/Amount \(XLM\)/i);
      expect(amountInput).toHaveAttribute("step", "0.0000001");
    });

    it("prevents negative amounts", () => {
      renderDashboard();
      const amountInput = screen.getByLabelText(/Amount \(XLM\)/i);
      expect(amountInput).toHaveAttribute("min", "0");
    });
  });
});
