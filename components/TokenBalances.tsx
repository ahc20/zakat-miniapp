import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
// import { useAccount } from "wagmi"; // On n'utilise plus useAccount ici

// Liste des tokens à afficher (ETH, USDC, DAI, WBTC)
const TOKENS = [
  { symbol: "ETH", contract: null, decimals: 18 },
  { symbol: "USDC", contract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
  { symbol: "DAI", contract: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 },
  { symbol: "WBTC", contract: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8 },
];

// ID de la chaîne Base (mainnet)
const BASE_CHAIN_ID = 8453;

interface TokenBalance {
  symbol: string;
  balance: number;
  logo: string;
  usd: number;
}

interface TokenBalancesProps {
  address: string | null;
}

export default function TokenBalances({ address }: TokenBalancesProps) {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    const fetchBalances = async () => {
      try {
        const url = `https://api.covalenthq.com/v1/${BASE_CHAIN_ID}/address/${address}/balances_v2/?key=${process.env.NEXT_PUBLIC_COVALENT_API_KEY}`;
        const { data } = await axios.get(url);
        const items = data.data.items;
        const filtered = TOKENS.map((token) => {
          const found = items.find((i: unknown) => {
            if (typeof i === "object" && i && "contract_ticker_symbol" in i) {
              return (i as { contract_ticker_symbol: string }).contract_ticker_symbol === token.symbol;
            }
            return false;
          });
          let logo = "/icon.png";
          if (token.symbol === "ETH") {
            logo = "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png";
          } else if (token.contract) {
            logo = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${token.contract}/logo.png`;
          }
          if (!found) return { symbol: token.symbol, balance: 0, logo, usd: 0 };
          return {
            symbol: token.symbol,
            balance: Number(found.balance) / 10 ** token.decimals,
            logo,
            usd: found.quote || 0,
          };
        });
        setBalances(filtered);
      } catch {
        setError("Erreur lors de la récupération des soldes.");
      } finally {
        setLoading(false);
      }
    };
    fetchBalances();
  }, [address]);

  if (!address) return null;

  return (
    <div className="mt-6 sm:mt-8 w-full">
      <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-center">Vos soldes</h2>
      <div className="bg-white rounded-xl shadow p-2 sm:p-4 flex flex-col gap-2 sm:gap-3 border border-gray-100">
        {loading && <div className="text-center text-gray-400">Chargement...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {!loading && !error && balances.map((token) => (
          <div key={token.symbol} className="flex flex-col xs:flex-row items-start xs:items-center justify-between py-2 px-1 sm:px-2 rounded hover:bg-gray-50 transition text-xs sm:text-base gap-1 xs:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image
                src={token.logo}
                alt={token.symbol}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border"
                width={24}
                height={24}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/icon.png";
                }}
                unoptimized
              />
              <span className="font-medium">{token.symbol}</span>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs sm:text-base">{token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
              <div className="text-xs text-gray-500">${token.usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 