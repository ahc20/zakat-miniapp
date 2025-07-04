import React, { useMemo, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { Interface, parseUnits } from "ethers";
import { Transaction, TransactionButton, TransactionStatus, TransactionStatusAction, TransactionStatusLabel, TransactionToast, TransactionToastIcon, TransactionToastLabel, TransactionToastAction, TransactionResponse } from "@coinbase/onchainkit/transaction";

interface Props {
  amount: number; // montant en USD
  onSuccess: (txHash: string) => void;
}

// Adresse USDC sur Base mainnet
const USDC_ADDRESS = "0xd9AAEC86B65d86F6A7B5B1b0c42FFA531710b6CA" as `0x${string}`;
// Adresse de l'ONG destinataire
const ONG_ADDRESS = "0xdaccc0b740dbed96f9b14eecd6b542dc2557d74f" as `0x${string}`; // Adresse de dons personnalisée
// NB : USDC a 6 décimales

export default function PayZakatButton({ amount, onSuccess }: Props) {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const [detailedError, setDetailedError] = useState<string | null>(null);

  // Prepare the transaction call for USDC transfer (with Paymaster sponsorship)
  const calls = useMemo(() => {
    if (!address || amount <= 0) return [];
    // Arrondir à 6 décimales pour USDC, toujours avec un point
    const roundedAmount = Number(amount).toFixed(6).replace(',', '.');
    // ERC20 transfer(address,uint256)
    const iface = new Interface([
      "function transfer(address to, uint256 amount) public returns (bool)"
    ]);
    return [
      {
        to: USDC_ADDRESS,
        data: iface.encodeFunctionData("transfer", [ONG_ADDRESS, parseUnits(roundedAmount, 6)]) as `0x${string}`,
        value: BigInt(0),
        // Paymaster sponsorship is handled by OnchainKit Transaction component
      }
    ];
  }, [address, amount]);

  // Affiche un bouton de connexion si le wallet n'est pas connecté
  const showConnectButton = !isConnected;
  const coinbaseWallet = connectors.find(connector => connector.name === 'Coinbase Wallet');

  return (
    <div className="mt-6 sm:mt-8 w-full flex flex-col items-center">
      {showConnectButton && coinbaseWallet && (
        <div className="mb-4 text-center">
          <button
            onClick={() => connect({ connector: coinbaseWallet })}
            className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold text-base shadow hover:bg-blue-700 transition-colors"
          >
            Connect your wallet to pay your zakat
          </button>
        </div>
      )}
      <div className="mb-2 text-center font-semibold text-blue-700">
        {`Amount to pay: $${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC (gasless transaction)`}
      </div>
      <Transaction
        calls={calls}
        // Paymaster sponsorship is enabled by default on Base with OnchainKit
        onSuccess={async (response: TransactionResponse) => {
          const txHash = response.transactionReceipts[0].transactionHash;
          onSuccess(txHash);
        }}
        onError={(error) => {
          setDetailedError(error?.message || JSON.stringify(error));
        }}
      >
        <TransactionButton
          className="w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-3 bg-blue-600 text-white rounded-full font-semibold text-base sm:text-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
        />
        <TransactionStatus>
          <TransactionStatusAction />
          <TransactionStatusLabel />
        </TransactionStatus>
        <TransactionToast className="mb-4">
          <TransactionToastIcon />
          <TransactionToastLabel />
          <TransactionToastAction />
        </TransactionToast>
      </Transaction>
      {detailedError && (
        <div className="text-red-500 text-xs mt-2 text-center">
          {detailedError}
        </div>
      )}
    </div>
  );
} 