"use client";

import {
  useMiniKit,
} from "@coinbase/onchainkit/minikit";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Name, Identity, Avatar, EthBalance } from "@coinbase/onchainkit/identity";
import { useEffect, useState } from "react";
import TokenBalances from "../components/TokenBalances";
import ZakatCalculator from "../components/ZakatCalculator";
import { useAccount } from "wagmi";

// Fonction pour valider une adresse Ethereum
const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export default function App() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const [inputAddress, setInputAddress] = useState("");
  const [buttonError, setButtonError] = useState<string | null>(null);
  const { address: connectedAddress } = useAccount();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Nettoyer l'erreur quand l'adresse change
  useEffect(() => {
    if (connectedAddress && isValidEthereumAddress(connectedAddress)) {
      setButtonError(null);
    }
  }, [connectedAddress]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-white font-sans text-gray-900">
      <div className="w-full max-w-md mx-auto px-2 sm:px-4 py-4 sm:py-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center mb-2">
            <span className="text-3xl mr-2" role="img" aria-label="Islamic Star and Crescent">☪️</span>
            <h1 className="text-2xl sm:text-3xl font-bold">Zakat MiniApp</h1>
          </div>
          <p className="text-sm text-gray-600">Calculate and pay Zakat on crypto assets</p>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <div className="flex flex-col sm:flex-row w-full gap-2">
            {/* Si wallet connecté, on affiche l'adresse, sinon on laisse le champ */}
            {connectedAddress && isValidEthereumAddress(connectedAddress) ? (
              <div className="flex flex-col flex-1 gap-2">
                <input
                  type="text"
                  className="px-3 py-2 rounded-full border border-gray-200 bg-gray-100 text-base cursor-not-allowed"
                  value={connectedAddress}
                  readOnly
                  tabIndex={-1}
                />
                {/* Affichage debug de l'adresse connectée */}
                <div className="text-xs text-gray-500 break-all text-center">Connected address: {connectedAddress}</div>
                <button
                  className="px-3 py-2 bg-blue-500 text-white rounded-full font-semibold text-xs shadow hover:bg-blue-700 transition disabled:opacity-50"
                  onClick={() => {
                    setButtonError(null);
                    try {
                      if (connectedAddress && isValidEthereumAddress(connectedAddress)) {
                        setInputAddress(connectedAddress);
                      } else {
                        const errorMsg = "No valid wallet address available. Please reconnect your wallet.";
                        setButtonError(errorMsg);
                      }
                    } catch {
                      const errorMsg = "An error occurred. Please try again.";
                      setButtonError(errorMsg);
                    }
                  }}
                  disabled={!connectedAddress || !isValidEthereumAddress(connectedAddress)}
                >
                  Use my connected wallet
                </button>
                {(!connectedAddress || !isValidEthereumAddress(connectedAddress)) && (
                  <div className="text-red-500 text-xs mt-1 text-center">
                    Wallet address not ready or invalid. Please reconnect.
                  </div>
                )}
                {buttonError && (
                  <div className="text-red-500 text-xs mt-1 text-center">
                    {buttonError}
                  </div>
                )}
              </div>
            ) : (
              <input
                type="text"
                placeholder="Collez une adresse 0x..."
                className="flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                value={inputAddress}
                onChange={e => setInputAddress(e.target.value)}
                maxLength={42}
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            )}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <Wallet>
                <ConnectWallet>
                  <span className="px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-full font-semibold text-base shadow hover:bg-blue-700 transition whitespace-nowrap w-full sm:w-auto text-center">Connect</span>
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <Avatar />
                    <Name />
                    <EthBalance />
                  </Identity>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>
          </div>
        </div>
        <TokenBalances address={inputAddress} />
        <ZakatCalculator address={inputAddress} />
        {/* Ici on ajoutera le calcul de la Zakat, et le paiement */}
        <div className="mt-6 sm:mt-8" />
      </div>
    </div>
  );
}
