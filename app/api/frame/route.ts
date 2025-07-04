import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    version: "vNext",
    name: "Zakat MiniApp",
    description: "Calculate and pay your Zakat on crypto assets, gasless, directly depuis Farcaster.",
    image: "https://zakat-crypto.vercel.app/hero.png",
    url: "https://zakat-crypto.vercel.app",
    buttons: [
      {
        label: "Open Zakat App",
        action: "link",
        target: "https://zakat-crypto.vercel.app"
      }
    ]
  });
} 