import axios from "axios";

const BASE_CHAIN_ID = 8453;
const COVALENT_API_KEY = process.env.NEXT_PUBLIC_COVALENT_API_KEY;

export interface ZakatAsset {
  symbol: string;
  name: string;
  type: string; // token, defi, nft, etc.
  balance: number;
  usd: number;
  contract_address: string;
  logo_url?: string;
  is_liquid: boolean;
}

export interface ZakatScreeningResult {
  totalNetUSD: number;
  zakatDue: number;
  isRedevable: boolean;
  nisab: number;
  assets: ZakatAsset[];
  diagnostic: string;
}

// Règles Zakat :
// - On inclut les tokens liquides (ETH, stablecoins, tokens listés)
// - On exclut les NFT, tokens vestés, staking bloqué, dettes
// - On peut améliorer avec Debank/Zapper plus tard

export async function screenWalletForZakat(address: string, nisab: number = 500): Promise<ZakatScreeningResult> {
  // 1. Récupérer tous les actifs du wallet
  const url = `https://api.covalenthq.com/v1/${BASE_CHAIN_ID}/address/${address}/balances_v2/?nft=false&no-nft-fetch=true&key=${COVALENT_API_KEY}`;
  const { data } = await axios.get(url);
  const items = data.data.items;

  // 2. Filtrer selon les règles Zakat
  const assets: ZakatAsset[] = items.map((item: unknown) => {
    if (
      typeof item === "object" &&
      item !== null &&
      "contract_ticker_symbol" in item &&
      "contract_name" in item &&
      "type" in item &&
      "balance" in item &&
      "contract_decimals" in item &&
      "quote" in item &&
      "contract_address" in item
    ) {
      const typedItem = item as {
        contract_ticker_symbol: string;
        contract_name: string;
        type: string;
        balance: string;
        contract_decimals: number;
        quote: number;
        contract_address: string;
        logo_url?: string;
      };
      const isStable = ["USDC", "USDT", "DAI", "TUSD", "USDP", "GUSD", "LUSD"].includes(typedItem.contract_ticker_symbol);
      const isETH = typedItem.contract_ticker_symbol === "ETH";
      const isLiquid = isStable || isETH || (typedItem.type === "cryptocurrency" && typedItem.quote > 10);
      return {
        symbol: typedItem.contract_ticker_symbol,
        name: typedItem.contract_name,
        type: typedItem.type,
        balance: Number(typedItem.balance) / 10 ** typedItem.contract_decimals,
        usd: typedItem.quote || 0,
        contract_address: typedItem.contract_address,
        logo_url: typedItem.logo_url,
        is_liquid: isLiquid,
      };
    }
    return {} as ZakatAsset;
  });

  // 3. Détection automatique des dettes DeFi (tokens de type 'debt', 'borrow', 'loan', 'liability' ou solde négatif)
  const debtKeywords = ["debt", "borrow", "loan", "liability"];
  type CovalentItem = {
    contract_name?: string;
    contract_ticker_symbol?: string;
    type?: string;
    balance?: string | number;
    quote?: number;
  };
  const defiDebts = items.filter((item: unknown) => {
    if (!item || typeof item !== "object") return false;
    const i = item as CovalentItem;
    const name = (i.contract_name || "").toLowerCase();
    const symbol = (i.contract_ticker_symbol || "").toLowerCase();
    const type = (i.type || "").toLowerCase();
    const balance = Number(i.balance || 0);
    return (
      debtKeywords.some(k => name.includes(k) || symbol.includes(k) || type.includes(k)) ||
      balance < 0
    );
  });
  const totalDebtsUSD = defiDebts.reduce((sum: number, item: CovalentItem) => {
    return sum + (item.quote || 0);
  }, 0);

  // 4. Exclure les actifs non liquides
  const liquidAssets = assets.filter(a => a.is_liquid && a.usd > 0.5);
  const totalNetUSD = liquidAssets.reduce((sum, a) => sum + a.usd, 0) - totalDebtsUSD;

  // 5. Calcul Zakat
  const isRedevable = totalNetUSD >= nisab;
  const zakatDue = isRedevable ? totalNetUSD * 0.025 : 0;
  const diagnostic = isRedevable
    ? `Vous êtes redevable de la Zakat. Montant dû : $${zakatDue.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n\nNote : Le calcul est basé sur le solde net actuel (après dettes DeFi détectées). Pour une conformité totale à la jurisprudence, la Zakat doit porter sur le minimum annuel conservé, ce qui nécessite l'historique complet du wallet.`
    : `Vous n'êtes pas redevable de la Zakat (total inférieur au Nisab).\n\nNote : Le calcul est basé sur le solde net actuel (après dettes DeFi détectées). Pour une conformité totale à la jurisprudence, la Zakat doit porter sur le minimum annuel conservé, ce qui nécessite l'historique complet du wallet.`;

  return {
    totalNetUSD,
    zakatDue,
    isRedevable,
    nisab,
    assets: liquidAssets,
    diagnostic,
  };
}

// Fonction utilitaire pour récupérer le prix du gramme d'or et d'argent en USD
export async function fetchGoldSilverPrice(): Promise<{ gold: number; silver: number }> {
  // Exemple avec Metals-API ou une API publique, ici on simule la réponse
  // Remplace ce code par un appel réel à une API si tu as une clé
  // Ex : https://metals-api.com/api/latest?base=USD&symbols=XAU,XAG
  // Ici, on prend des valeurs fictives pour la démo
  const goldPricePerGram = 75; // USD/gramme (à remplacer par la vraie valeur de l'API)
  const silverPricePerGram = 0.95; // USD/gramme (à remplacer par la vraie valeur de l'API)
  return { gold: goldPricePerGram, silver: silverPricePerGram };
}

// Nouvelle fonction : récupérer l'historique des transactions d'un wallet (entrées/sorties)
export async function fetchWalletTransactions(address: string, chainId: number = BASE_CHAIN_ID) {
  // Voir doc : https://www.covalenthq.com/docs/api/
  // Endpoint : /v1/{chain_id}/address/{address}/transactions_v2/
  const url = `https://api.covalenthq.com/v1/${chainId}/address/${address}/transactions_v2/?no-logs=true&key=${COVALENT_API_KEY}`;
  const { data } = await axios.get(url);
  // data.data.items est la liste des transactions
  return data.data.items;
}

// Type minimal pour une transaction Covalent utilisée dans simulateMonthlyNetBalance
type Transaction = {
  block_signed_at: string;
  value_quote: number;
  to_address: string;
  from_address: string;
};

// Utilitaire : Simuler le solde net mensuel sur 1 an à partir des transactions (ETH + stablecoins)
export async function simulateMonthlyNetBalance(address: string, chainId: number = BASE_CHAIN_ID) {
  const transactions: Transaction[] = await fetchWalletTransactions(address, chainId);
  // On ne garde que les 12 derniers mois
  const now = new Date();
  const months: { date: string; value: number }[] = [];
  // Initialisation : on part du solde actuel
  let currentBalanceUSD = 0;
  // On va stocker le solde à la fin de chaque mois
  // Pour chaque mois, on rejoue les transactions de ce mois
  for (let i = 11; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = month.toISOString().slice(0, 7); // "YYYY-MM"
    // Transactions du mois
    const txs = transactions.filter((tx) => tx.block_signed_at && tx.block_signed_at.slice(0, 7) === monthStr);
    // On additionne les entrées (to_address == address) et on soustrait les sorties (from_address == address)
    let netUSD = 0;
    for (const tx of txs) {
      // On ne prend que les transferts d'ETH ou stablecoins (on peut raffiner)
      if (tx.value_quote && tx.value_quote > 0) {
        if (tx.to_address && tx.to_address.toLowerCase() === address.toLowerCase()) {
          netUSD += tx.value_quote;
        } else if (tx.from_address && tx.from_address.toLowerCase() === address.toLowerCase()) {
          netUSD -= tx.value_quote;
        }
      }
    }
    currentBalanceUSD += netUSD;
    months.push({ date: monthStr, value: Math.max(0, currentBalanceUSD) });
  }
  // Le minimum annuel conservé (hawl) est le plus bas solde net sur 1 an
  const hawl = Math.min(...months.map(m => m.value));
  return { months, hawl };
}

// Calcul hawl simple : solde net actuel, solde net il y a 1 an, minimum, plus-value
export async function computeHawlSimple(address: string, chainId: number = BASE_CHAIN_ID) {
  // 1. Solde net actuel (déjà filtré dans screenWalletForZakat)
  const { assets } = await screenWalletForZakat(address);
  const soldeActuel = assets.reduce((sum, a) => sum + a.usd, 0);

  // 2. Transactions sur 1 an
  const transactions: Transaction[] = await fetchWalletTransactions(address, chainId);
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  // 3. On ne garde que les transferts d'ETH et stablecoins (on peut raffiner)
  // On part du solde actuel et on "remonte" chaque transaction de l'année écoulée
  let soldeUnAn = soldeActuel;
  for (const tx of transactions) {
    if (!tx.block_signed_at) continue;
    const txDate = new Date(tx.block_signed_at);
    if (txDate > oneYearAgo) {
      // Si c'est une entrée, on soustrait (elle n'était pas encore là il y a 1 an)
      if (tx.to_address && tx.to_address.toLowerCase() === address.toLowerCase()) {
        soldeUnAn -= tx.value_quote || 0;
      }
      // Si c'est une sortie, on additionne (elle était encore là il y a 1 an)
      if (tx.from_address && tx.from_address.toLowerCase() === address.toLowerCase()) {
        soldeUnAn += tx.value_quote || 0;
      }
    }
  }
  soldeUnAn = Math.max(0, soldeUnAn);
  const hawl = Math.min(soldeActuel, soldeUnAn);
  const plusValue = soldeActuel - soldeUnAn;
  return { soldeActuel, soldeUnAn, hawl, plusValue };
} 