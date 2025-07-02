import React, { useState } from "react";
import { useAccount } from "wagmi";
import { parseUnits } from "ethers";

interface Props {
  amount: number; // montant en USD
  onSuccess: (txHash: string) => void;
}

// Adresse USDC sur Base mainnet
const USDC_ADDRESS = "0xd9AAEC86B65d86F6A7B5B1b0c42FFA531710b6CA";
// Adresse de l'ONG destinataire
const ONG_ADDRESS = "0x1111111111111111111111111111111111111111"; // À personnaliser
// NB : USDC a 6 décimales

export default function PayZakatButton({ amount, onSuccess }: Props) {
  const { isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Préparation de la transaction (envoi USDC)
  // Pour simplifier, on suppose que l'utilisateur a déjà approuvé l'USDC (sinon il faudrait gérer approve + transferFrom)

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      // On utilise ethers pour créer la transaction ERC20
      const { ethers } = await import("ethers");
      // @ts-expect-error Web3Provider nécessite window.ethereum côté client
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const usdc = new ethers.Contract(
        USDC_ADDRESS,
        ["function transfer(address to, uint256 amount) public returns (bool)"],
        signer
      );
      const tx = await usdc.transfer(ONG_ADDRESS, parseUnits(amount.toString(), 6));
      await tx.wait();
      onSuccess(tx.hash);
    } catch (e: unknown) {
      if (typeof e === "object" && e && "message" in e) {
        setError((e as { message?: string }).message || "Erreur lors du paiement.");
      } else {
        setError("Erreur lors du paiement.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected || amount <= 0) return null;

  return (
    <div className="mt-6 sm:mt-8 w-full flex flex-col items-center">
      <button
        className="w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-3 bg-blue-600 text-white rounded-full font-semibold text-base sm:text-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
        onClick={handlePay}
        disabled={loading}
      >
        {loading ? "Paiement en cours..." : `Payer maintenant ($${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC)`}
      </button>
      {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
    </div>
  );
} 