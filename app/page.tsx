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

export default function App() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const [inputAddress, setInputAddress] = useState("");
  const { address: connectedAddress } = useAccount();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-white font-sans text-gray-900">
      <div className="w-full max-w-md mx-auto px-2 sm:px-4 py-4 sm:py-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center mb-2">
            <img src="/base-logo.png" alt="Base Logo" className="w-8 h-8 mr-2" />
            <h1 className="text-2xl sm:text-3xl font-bold">Zakat MiniApp</h1>
          </div>
          <p className="text-sm text-gray-600">Calculate and pay Zakat on crypto assets</p>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <div className="flex flex-col sm:flex-row w-full gap-2">
            {/* Si wallet connecté, on affiche l'adresse, sinon on laisse le champ */}
            {connectedAddress ? (
              <div className="flex flex-col flex-1 gap-2">
                <input
                  type="text"
                  className="px-3 py-2 rounded-full border border-gray-200 bg-gray-100 text-base cursor-not-allowed"
                  value={connectedAddress}
                  readOnly
                  tabIndex={-1}
                />
                <button
                  className="px-3 py-2 bg-blue-500 text-white rounded-full font-semibold text-xs shadow hover:bg-blue-700 transition"
                  onClick={() => setInputAddress(connectedAddress)}
                >
                  Utiliser mon wallet connecté
                </button>
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
                  <span className="px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-full font-semibold text-base shadow hover:bg-blue-700 transition whitespace-nowrap w-full sm:w-auto text-center">Connecter</span>
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
