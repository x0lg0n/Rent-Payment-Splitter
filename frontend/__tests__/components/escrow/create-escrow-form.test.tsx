import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateEscrowForm } from "@/components/escrow/create-escrow-form";

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

const walletAddress =
  "GBCSNSTWXGE3CBTKENYSMB4MNI3AEORJYIE3P6SR7JJQE42SC4UYHRQK";
const landlordAddress =
  "GAFWIKJAN4XAC6A3PDPPPPXLMLKMLS3TP7LEX2VB4QQ4UY4E5ADKMNZ4";
const participantAddress =
  "GC2POKDBQNDPQNIQFHRKJ65FUBBKV4PZQIC5VEGJ4IM7QQNZRAO3FQJR";

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

const fillValidEqualSplitForm = () => {
  fireEvent.change(screen.getByLabelText(/landlord wallet/i), {
    target: { value: landlordAddress },
  });
  fireEvent.change(screen.getByPlaceholderText(/Participant 1 address/i), {
    target: { value: participantAddress },
  });
  fireEvent.change(screen.getByLabelText(/total rent \(xlm\)/i), {
    target: { value: "1200" },
  });
  setFutureDeadline();
};

describe("CreateEscrowForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  it("renders core fields and defaults to equal split", () => {
    renderForm();

    expect(screen.getByText("Create rent escrow")).toBeInTheDocument();
    expect(screen.getByLabelText(/landlord wallet/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Equal split/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/total rent \(xlm\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/funding deadline/i)).toBeInTheDocument();
  });

  it("shows wallet warning and disables submit when disconnected", () => {
    renderForm(null);

    expect(
      screen.getByText(/Connect your wallet to create an escrow/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create escrow/i })).toBeDisabled();
  });

  it("validates required fields on submit", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: /Create escrow/i }));

    await waitFor(() => {
      expect(screen.getByText("Landlord address is required")).toBeInTheDocument();
      expect(screen.getByText("Participant 1 address is required")).toBeInTheDocument();
      expect(
        screen.getByText("Total rent is required for equal split"),
      ).toBeInTheDocument();
      expect(screen.getByText("Deadline is required")).toBeInTheDocument();
    });
  });

  it("supports adding and removing participants", () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: /Add/i }));
    expect(screen.getAllByPlaceholderText(/Participant \d+ address/i)).toHaveLength(2);

    const removeButtons = screen
      .getAllByRole("button")
      .filter((button) => button.querySelector("svg") && button.getAttribute("type") === "button");
    fireEvent.click(removeButtons[removeButtons.length - 1]);

    expect(screen.getAllByPlaceholderText(/Participant \d+ address/i)).toHaveLength(1);
  });

  it("switches to custom mode and validates share amount", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: /Custom shares/i }));
    fireEvent.change(screen.getByLabelText(/landlord wallet/i), {
      target: { value: landlordAddress },
    });
    fireEvent.change(screen.getByPlaceholderText(/Participant 1 address/i), {
      target: { value: participantAddress },
    });
    fireEvent.change(screen.getByPlaceholderText(/Share \(XLM\)/i), {
      target: { value: "0" },
    });
    setFutureDeadline();

    fireEvent.click(screen.getByRole("button", { name: /Create escrow/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Share (must be greater than 0|amount is required)/i),
      ).toBeInTheDocument();
    });
  });

  it("submits equal split payload when form is valid", async () => {
    renderForm();
    fillValidEqualSplitForm();

    fireEvent.click(screen.getByRole("button", { name: /Create escrow/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    const payload = mockOnSubmit.mock.calls[0][0];
    expect(payload.landlord).toBe(landlordAddress);
    expect(payload.participants).toEqual([participantAddress]);
    expect(payload.shares).toEqual([BigInt(1200 * 10_000_000)]);
    expect(typeof payload.deadline).toBe("bigint");
  });

  it("shows loading state while submitting", async () => {
    mockOnSubmit.mockImplementation(() => new Promise(() => {}));
    renderForm();
    fillValidEqualSplitForm();

    fireEvent.click(screen.getByRole("button", { name: /Create escrow/i }));

    await waitFor(() => {
      expect(screen.getByText("Creating...")).toBeInTheDocument();
    });
  });

  it("shows submit error when onSubmit rejects", async () => {
    mockOnSubmit.mockRejectedValue(new Error("Network error"));
    renderForm();
    fillValidEqualSplitForm();

    fireEvent.click(screen.getByRole("button", { name: /Create escrow/i }));

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("calls onCancel from cancel button", () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
