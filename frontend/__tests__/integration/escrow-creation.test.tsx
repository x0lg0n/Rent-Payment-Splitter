import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateEscrowForm } from "@/components/escrow/create-escrow-form";

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

const walletAddress =
  "GBCSNSTWXGE3CBTKENYSMB4MNI3AEORJYIE3P6SR7JJQE42SC4UYHRQK";
const landlordAddress =
  "GAFWIKJAN4XAC6A3PDPPPPXLMLKMLS3TP7LEX2VB4QQ4UY4E5ADKMNZ4";
const participantOne =
  "GC2POKDBQNDPQNIQFHRKJ65FUBBKV4PZQIC5VEGJ4IM7QQNZRAO3FQJR";
const participantTwo =
  "GAJTHCOPPLJVA6R2D4OLUHC4EFRNSRTCNO7UNH4QYWCNDWHNY6YVNUFJ";

const renderForm = (connectedWallet: string | null = walletAddress) =>
  render(
    <CreateEscrowForm
      onSubmit={mockOnSubmit}
      onCancel={mockOnCancel}
      walletAddress={connectedWallet}
    />,
  );

const setFutureDeadline = () => {
  const deadlineInput = screen.getByLabelText(/funding deadline/i);
  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);
  fireEvent.change(deadlineInput, { target: { value: futureDate } });
};

describe("Escrow Creation Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  it("completes an equal-split submission flow", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/landlord wallet/i), {
      target: { value: landlordAddress },
    });
    fireEvent.change(screen.getByPlaceholderText(/Participant 1 address/i), {
      target: { value: participantOne },
    });
    fireEvent.change(screen.getByLabelText(/total rent \(xlm\)/i), {
      target: { value: "1000" },
    });
    setFutureDeadline();

    fireEvent.click(screen.getByRole("button", { name: /Create escrow/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    const payload = mockOnSubmit.mock.calls[0][0];
    expect(payload.landlord).toBe(landlordAddress);
    expect(payload.participants).toEqual([participantOne]);
    expect(payload.shares).toEqual([BigInt(1000 * 10_000_000)]);
    expect(typeof payload.deadline).toBe("bigint");
  });

  it("completes a custom-share submission flow with multiple participants", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: /Custom shares/i }));
    fireEvent.change(screen.getByLabelText(/landlord wallet/i), {
      target: { value: landlordAddress },
    });

    fireEvent.change(screen.getByPlaceholderText(/Participant 1 address/i), {
      target: { value: participantOne },
    });
    fireEvent.change(screen.getByPlaceholderText(/Share \(XLM\)/i), {
      target: { value: "600" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Add/i }));

    fireEvent.change(screen.getByPlaceholderText(/Participant 2 address/i), {
      target: { value: participantTwo },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/Share \(XLM\)/i)[1], {
      target: { value: "400" },
    });
    setFutureDeadline();

    fireEvent.click(screen.getByRole("button", { name: /Create escrow/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    const payload = mockOnSubmit.mock.calls[0][0];
    expect(payload.participants).toEqual([participantOne, participantTwo]);
    expect(payload.shares).toEqual([
      BigInt(600 * 10_000_000),
      BigInt(400 * 10_000_000),
    ]);
  });

  it("blocks submission for invalid landlord", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/landlord wallet/i), {
      target: { value: "invalid" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create escrow/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid Stellar address")).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("blocks duplicate participant addresses", async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/landlord wallet/i), {
      target: { value: landlordAddress },
    });
    fireEvent.change(screen.getByPlaceholderText(/Participant 1 address/i), {
      target: { value: participantOne },
    });

    fireEvent.click(screen.getByRole("button", { name: /Add/i }));
    fireEvent.change(screen.getByPlaceholderText(/Participant 2 address/i), {
      target: { value: participantOne },
    });
    fireEvent.change(screen.getByLabelText(/total rent \(xlm\)/i), {
      target: { value: "1000" },
    });
    setFutureDeadline();

    fireEvent.click(screen.getByRole("button", { name: /Create escrow/i }));

    await waitFor(() => {
      expect(screen.getByText(/Duplicate of participant 1/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("shows submit loading and failure states", async () => {
    mockOnSubmit.mockImplementationOnce(() => new Promise(() => {}));
    renderForm();

    fireEvent.change(screen.getByLabelText(/landlord wallet/i), {
      target: { value: landlordAddress },
    });
    fireEvent.change(screen.getByPlaceholderText(/Participant 1 address/i), {
      target: { value: participantOne },
    });
    fireEvent.change(screen.getByLabelText(/total rent \(xlm\)/i), {
      target: { value: "1000" },
    });
    setFutureDeadline();

    fireEvent.click(screen.getByRole("button", { name: /Create escrow/i }));

    await waitFor(() => {
      expect(screen.getByText("Creating...")).toBeInTheDocument();
    });
  });

  it("shows disconnected-wallet guard and supports cancellation", () => {
    renderForm(null);

    expect(screen.getByRole("button", { name: /Create escrow/i })).toBeDisabled();
    expect(
      screen.getByText(/Connect your wallet to create an escrow/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
