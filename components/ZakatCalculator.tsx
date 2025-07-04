import React, { useEffect, useState } from "react";
import Image from "next/image";
import { screenWalletForZakat, ZakatScreeningResult, fetchGoldSilverPrice } from "../lib/zakatScreening";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import PayZakatButton from "./PayZakatButton";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
  address: string | null;
}

export default function ZakatCalculator({ address }: Props) {
  const [nisab, setNisab] = useState(0);
  const [goldPrice, setGoldPrice] = useState<number | null>(null);
  const [silverPrice, setSilverPrice] = useState<number | null>(null);
  const [result, setResult] = useState<ZakatScreeningResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debts, setDebts] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    setResult(null);
    screenWalletForZakat(address, nisab)
      .then(res => {
        // On ne filtre plus selon la durée de détention (champ retiré)
        const totalNetUSD = Math.max(0, res.assets.reduce((sum, a) => sum + a.usd, 0) - debts);
        const isRedevable = totalNetUSD >= nisab;
        const zakatDue = isRedevable ? totalNetUSD * 0.025 : 0;
        setResult({ ...res, totalNetUSD, zakatDue, isRedevable, diagnostic: isRedevable
          ? `You are liable for Zakat. Amount due: $${zakatDue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
          : `You are not liable for Zakat (total is below the Nisab).` });
      })
      .catch(() => setError("Error while analyzing the wallet."))
      .finally(() => setLoading(false));
  }, [address, nisab, debts]);

  // Récupérer le prix de l'or/argent au chargement
  React.useEffect(() => {
    fetchGoldSilverPrice().then(({ gold, silver }) => {
      setGoldPrice(gold);
      setSilverPrice(silver);
      setNisab(Math.min(gold * 85, silver * 595));
    });
  }, []);

  // Mettre à jour le Nisab si la référence change
  React.useEffect(() => {
    if (goldPrice && silverPrice) {
      setNisab(Math.min(goldPrice * 85, silverPrice * 595));
    }
  }, [goldPrice, silverPrice]);

  // Vérification de l'adresse APRÈS les hooks
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return null;
  }

  if (!address) return null;

  return (
    <div className="mt-6 sm:mt-8 w-full">
      <div className="bg-white rounded-xl shadow p-3 sm:p-6 border border-gray-100 flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 justify-between text-sm sm:text-base">
          <span className="font-semibold">Nisab threshold (in $ equivalent to 595g silver)</span>
          <input
            type="text"
            className="w-32 px-3 py-2 rounded border border-gray-200 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
            value={nisab.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            readOnly
            tabIndex={-1}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 justify-between mt-2 text-sm sm:text-base">
          <span className="font-semibold">Debts to deduct ($)</span>
          <input
            type="number"
            min={0}
            step={1}
            className="w-32 px-3 py-2 rounded border border-gray-200 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={debts}
            onChange={e => setDebts(Number(e.target.value))}
          />
        </div>
        {loading && <div className="text-center text-gray-400">Analyzing...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {result && (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
              <span className="text-gray-600">Net total subject to Zakat</span>
              <span className="font-mono font-bold text-lg">${result.totalNetUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
              <span className="text-gray-600">Zakat amount (2.5%)</span>
              <span className="font-mono font-bold text-blue-600 text-lg">${result.zakatDue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className={"text-center mt-2 font-semibold " + (result.isRedevable ? "text-green-600" : "text-gray-500")}>{result.diagnostic}</div>
            {/* Score Halal */}
            {typeof result.halalScore === "number" && (
              <div className="mt-3 flex flex-col items-center">
                <span className="font-semibold text-sm text-gray-700 mb-1">Score Halal du wallet</span>
                <div className="w-full max-w-xs bg-gray-200 rounded-full h-4 mb-1">
                  <div
                    className="h-4 rounded-full"
                    style={{
                      width: `${result.halalScore}%`,
                      background: result.halalScore >= 80 ? '#16a34a' : result.halalScore >= 50 ? '#facc15' : '#dc2626',
                      transition: 'width 0.5s',
                    }}
                  />
                </div>
                <span className="font-mono text-base font-bold" style={{ color: result.halalScore >= 80 ? '#16a34a' : result.halalScore >= 50 ? '#facc15' : '#dc2626' }}>{result.halalScore} / 100</span>
              </div>
            )}
            <details className="mt-2 text-xs sm:text-sm" open>
              <summary className="cursor-pointer text-blue-500">Details of included assets</summary>
              <ul className="mt-2 space-y-1 max-h-40 overflow-auto pr-2">
                {result.assets.map(asset => {
                  let logo = asset.logo_url;
                  if (!logo) {
                    if (asset.symbol === "ETH") {
                      logo = "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png";
                    } else if (asset.contract_address && asset.contract_address !== "") {
                      logo = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${asset.contract_address}/logo.png`;
                    } else {
                      logo = "/icon.png";
                    }
                  }
                  return (
                    <li key={asset.contract_address} className="flex items-center gap-2 text-xs sm:text-sm">
                      <Image
                        src={logo}
                        alt={asset.symbol}
                        className="w-5 h-5 rounded-full border"
                        width={20}
                        height={20}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "/icon.png";
                        }}
                        unoptimized
                      />
                      <span>{asset.symbol}</span>
                      <span className="ml-auto font-mono">{asset.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                      <span className="text-gray-500">(${asset.usd.toLocaleString(undefined, { maximumFractionDigits: 2 })})</span>
                    </li>
                  );
                })}
              </ul>
            </details>
            {result.isRedevable && result.zakatDue > 0 && !paymentSuccess && (
              <PayZakatButton
                amount={result.zakatDue}
                onSuccess={txHash => setPaymentSuccess(txHash)}
              />
            )}
            {paymentSuccess && (
              <div className="mt-4 text-center text-green-700 font-semibold">
                ✅ Zakat payment successful!<br />
                <a href={`https://basescan.org/tx/${paymentSuccess}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">View transaction</a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 