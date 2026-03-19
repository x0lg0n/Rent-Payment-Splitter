import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { WalletSelector } from "@/components/dashboard/wallet-selector";
import { WalletKit } from "@/lib/wallet/wallet-kit";

vi.mock("@/lib/wallet/wallet-kit", () => ({
  WalletKit: {
    refreshSupportedWallets: vi.fn(),
  },
  SUPPORTED_WALLETS: [
    { id: "freighter", name: "Freighter", icon: "🚢" },
    { id: "xbull", name: "xBull", icon: "🐂" },
    { id: "albedo", name: "Albedo", icon: "⚪" },
    { id: "rabet", name: "Rabet", icon: "🐰" },
  ],
}));

const toSupportedWallets = (
  wallets: Array<{
    id: string;
    name: string;
    isAvailable: boolean;
    url: string;
  }>,
) =>
  wallets as unknown as Awaited<
    ReturnType<typeof WalletKit.refreshSupportedWallets>
  >;

describe("WalletSelector", () => {
  const mockOnClose = vi.fn();
  const mockOnSelect = vi.fn();

  const renderSelector = (props?: Partial<ComponentProps<typeof WalletSelector>>) =>
    render(
      <WalletSelector
        isOpen
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        {...props}
      />,
    );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(WalletKit.refreshSupportedWallets).mockResolvedValue(
      toSupportedWallets([]),
    );
  });

  it("renders when open", () => {
    renderSelector();
    expect(screen.getByText("Connect wallet")).toBeInTheDocument();
    expect(
      screen.getByText("Choose one Stellar wallet and connect directly."),
    ).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <WalletSelector
        isOpen={false}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />,
    );
    expect(screen.queryByText("Connect wallet")).not.toBeInTheDocument();
  });

  it("shows installed status from wallet detection", async () => {
    vi.mocked(WalletKit.refreshSupportedWallets).mockResolvedValue(
      toSupportedWallets([
        {
          id: "freighter",
          name: "Freighter",
          isAvailable: true,
          url: "https://freighter.app",
        },
      ]),
    );

    renderSelector();

    await waitFor(() => {
      expect(screen.getByText("Installed")).toBeInTheDocument();
    });
  });

  it("shows install link for unavailable wallets", async () => {
    vi.mocked(WalletKit.refreshSupportedWallets).mockResolvedValue(
      toSupportedWallets([
        {
          id: "freighter",
          name: "Freighter",
          isAvailable: false,
          url: "https://freighter.app",
        },
      ]),
    );

    renderSelector();

    await waitFor(() => {
      expect(screen.getByText(/Install from/i)).toBeInTheDocument();
    });
  });

  it("connects selected wallet and closes on success", async () => {
    mockOnSelect.mockResolvedValue(undefined);
    renderSelector();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Continue with Freighter/i }),
      ).not.toBeDisabled();
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Continue with Freighter/i }),
    );

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith("freighter");
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("shows connecting state while awaiting onSelect", async () => {
    mockOnSelect.mockImplementation(() => new Promise(() => {}));
    renderSelector();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Continue with Freighter/i }),
      ).not.toBeDisabled();
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Continue with Freighter/i }),
    );

    expect(screen.getByText("Connecting...")).toBeInTheDocument();
  });

  it("shows install flow error for unavailable selected wallet", async () => {
    const windowOpenSpy = vi
      .spyOn(window, "open")
      .mockImplementation(() => null);

    vi.mocked(WalletKit.refreshSupportedWallets).mockResolvedValue(
      toSupportedWallets([
        {
          id: "freighter",
          name: "Freighter",
          isAvailable: false,
          url: "https://freighter.app",
        },
      ]),
    );

    renderSelector();

    await waitFor(() => {
      expect(screen.getByText("Freighter")).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /Freighter/i,
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Install Freighter/i }),
      ).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole("button", { name: /Install Freighter/i }));

    await waitFor(() => {
      expect(screen.getByText(/not detected/i)).toBeInTheDocument();
      expect(windowOpenSpy).toHaveBeenCalled();
    });
  });

  it("uses lastWalletId as initial selected wallet", async () => {
    renderSelector({ lastWalletId: "xbull" });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Continue with xBull/i }),
      ).toBeInTheDocument();
    });
  });

  it("shows quick reconnect and current wallet sections", async () => {
    mockOnSelect.mockResolvedValue(undefined);

    renderSelector({
      lastWalletId: "xbull",
      currentWalletId: "freighter",
    });

    expect(screen.getByText("Currently connected")).toBeInTheDocument();
    expect(screen.getByText("Quick reconnect")).toBeInTheDocument();

    const quickReconnectButton = screen.getByRole("button", {
      name: /Quick reconnect/i,
    });

    await waitFor(() => {
      expect(quickReconnectButton).not.toBeDisabled();
    });

    fireEvent.click(quickReconnectButton);

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith("xbull");
    });
  });

  it("calls onClose for cancel and icon close actions", () => {
    renderSelector();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(
      screen.getByRole("button", { name: /Close wallet selector/i }),
    );

    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });
});
