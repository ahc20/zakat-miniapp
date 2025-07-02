# Zakat Mini App

> **Over 1.9 billion Muslims worldwide** are required to pay Zakat, a form of annual almsgiving and one of the Five Pillars of Islam. As cryptocurrencies become increasingly popular, calculating Zakat on digital assets is a new challenge for many. This app provides an automated, Sharia-compliant solution for accurately calculating and paying Zakat on crypto holdings, ensuring that Muslim crypto users can fulfill their religious obligations with confidence and ease.

---

## Overview

**Zakat Mini App** is a Next.js application that automatically calculates the Zakat due on your crypto assets (ETH, stablecoins, etc.) according to Islamic finance rules:
- Dynamic Nisab threshold (real-time silver price)
- Automatic detection of holdings during one year
- Calculation of the due amount (2.5%)
- Modern, responsive interface
- Direct connection with Coinbase Wallet

## Main Features

- **Secure connection** with Coinbase Wallet
- **Display of net balance** of your liquid assets
- **Automatic deduction** of DeFi debts
- **Instant calculation** of Zakat due
- **Nisab threshold** display
- **Simplified payment** (USDC, customizable)
- **Mobile-optimized experience**

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/ahc20/zakat-miniapp.git
cd zakat-miniapp/my-minikit-app
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file at the root with:

```
NEXT_PUBLIC_ONCHAINKIT_API_KEY=YOUR_ONCHAINKIT_KEY
NEXT_PUBLIC_COVALENT_API_KEY=YOUR_COVALENT_KEY
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=Zakat Mini App
NEXT_PUBLIC_ICON_URL=/icon.png
NEXT_PUBLIC_URL=https://zakatminiapp.vercel.app
```

> For notifications and webhooks, also configure `REDIS_URL` if needed.

## Local Development

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Deployment

Continuous deployment on Vercel:
- [https://zakatminiapp-m59jvnpml-ahcenes-projects-73c0778c.vercel.app](https://zakatminiapp-m59jvnpml-ahcenes-projects-73c0778c.vercel.app)

To deploy manually:
```bash
vercel --prod
```

## Usage

1. Connect your Coinbase wallet
2. Click "Use my connected wallet" to autofill your address
3. View your balances and Zakat due
4. (Optional) Pay directly in USDC

## Customization

- To add other wallets: see wagmi/OnchainKit documentation
- To change the recipient NGO: edit `ONG_ADDRESS` in `components/PayZakatButton.tsx`
- To adjust the tokens considered: edit `TOKENS` in `components/TokenBalances.tsx`

## Useful Links

- [GitHub Repository](https://github.com/ahc20/zakat-miniapp)
- [OnchainKit Documentation](https://docs.base.org/builderkits/onchainkit/overview)
- [MiniKit Documentation](https://docs.base.org/builderkits/minikit/overview)
- [Covalent API](https://www.covalenthq.com/docs/api/)

## Base Builder Tools Integration

This project leverages several Base Builder tools to deliver a best-in-class onchain user experience:

- **MiniKit**: Used as the foundation for building the mini app UI and wallet connection.
- **OnchainKit**: Provides prebuilt components for wallet connection, identity, and transaction flows.
- **Paymaster (Gasless Transactions)**: Integrated to allow users to perform Zakat payments without paying gas fees themselves. The app uses the Base Paymaster service to sponsor user transactions (see below for details).

### Paymaster Integration (Gasless Transactions)

- The Zakat payment flow is implemented using a Paymaster, so users can pay their Zakat (in USDC) without needing ETH, and demonstrates the power of Base's gas credits program.

---

**License: MIT**
