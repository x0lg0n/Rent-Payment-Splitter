import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { WalletSelector } from "@/components/dashboard/wallet-selector";
import { WalletKit } from "@/lib/wallet/wallet-kit";

vi.mock("@/lib/wallet/wallet-kit", () => ({
  WalletKit: {
    refreshSupportedWallets: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    getWalletInfo: vi.fn(),
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

describe("Wallet Connection Integration", () => {
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

  it("detects installed wallets on open", async () => {
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
      expect(WalletKit.refreshSupportedWallets).toHaveBeenCalled();
      expect(screen.getByText("Installed")).toBeInTheDocument();
    });
  });

  it("falls back to detection pending state when refresh fails", async () => {
    vi.mocked(WalletKit.refreshSupportedWallets).mockRejectedValue(
      new Error("Detection failed"),
    );

    renderSelector();

    await waitFor(() => {
      expect(screen.getAllByText("Detection pending").length).toBeGreaterThan(0);
    });
  });

  it("connects with selected wallet and closes on success", async () => {
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

  it("surfaces connection errors and allows retry", async () => {
    mockOnSelect.mockRejectedValueOnce(new Error("Connection failed"));
    mockOnSelect.mockResolvedValueOnce(undefined);
    renderSelector();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Continue with Freighter/i }),
      ).not.toBeDisabled();
    });

    const continueButton = screen.getByRole("button", {
      name: /Continue with Freighter/i,
    });

    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText("Connection failed")).toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledTimes(2);
    });
  });

  it("supports quick reconnect when last wallet exists", async () => {
    mockOnSelect.mockResolvedValue(undefined);
    renderSelector({ lastWalletId: "xbull", currentWalletId: "freighter" });

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

  it("opens install flow for unavailable wallet", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

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
      expect(screen.getByRole("button", { name: /Freighter/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Freighter/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Install Freighter/i }),
      ).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole("button", { name: /Install Freighter/i }));

    await waitFor(() => {
      expect(screen.getByText(/not detected/i)).toBeInTheDocument();
      expect(openSpy).toHaveBeenCalledWith(
        "https://freighter.app",
        "_blank",
        "noopener,noreferrer",
      );
    });
  });

  it("handles cancel and icon close actions", () => {
    renderSelector();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(
      screen.getByRole("button", { name: /Close wallet selector/i }),
    );

    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });
});
