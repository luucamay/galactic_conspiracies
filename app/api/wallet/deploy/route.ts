import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ERC4337_SEPOLIA_CONFIG = {
  chainId: 11155111,
  provider: 'https://sepolia.drpc.org',
  bundlerUrl: 'https://api.candide.dev/public/v3/11155111',
  paymasterUrl: 'https://api.candide.dev/public/v3/11155111',
  paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  safeModulesVersion: '0.3.0' as const,
  paymasterToken: {
    address: '0xd077a400968890eacc75cdc901f0356c943e4fdb',
  },
  transferMaxFee: 100000,
};

export async function POST() {
  let walletManager: { getAccount: (index: number) => Promise<{ getAddress: () => Promise<string>; dispose?: () => void }>; dispose?: () => void } | null = null;
  let account: { getAddress: () => Promise<string>; dispose?: () => void } | null = null;

  try {
    const [{ default: WDK }, { default: WalletManagerEvmErc4337 }] = await Promise.all([
      import('@tetherto/wdk'),
      import('@tetherto/wdk-wallet-evm-erc-4337'),
    ]);

    const seedPhrase = WDK.getRandomSeedPhrase();

    walletManager = new WalletManagerEvmErc4337(seedPhrase, ERC4337_SEPOLIA_CONFIG);
    account = await walletManager.getAccount(0);
    const gcWallet = await account.getAddress();

    return NextResponse.json({ gcWallet });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to deploy wallet',
      },
      { status: 500 }
    );
  } finally {
    account?.dispose?.();
    walletManager?.dispose?.();
  }
}
