import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Wallet, Shield, CheckCircle } from "lucide-react";
import WDK from "@tetherto/wdk";
import WalletManagerEvmErc4337 from "@tetherto/wdk-wallet-evm-erc-4337";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const ERC4337_SEPOLIA_CONFIG = {
  chainId: 11155111,
  provider: "https://sepolia.drpc.org",
  bundlerUrl: "https://api.candide.dev/public/v3/11155111",
  paymasterUrl: "https://api.candide.dev/public/v3/11155111",
  paymasterAddress: "0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba",
  entryPointAddress: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
  safeModulesVersion: "0.3.0" as const,
  paymasterToken: {
    address: "0xd077a400968890eacc75cdc901f0356c943e4fdb",
  },
  transferMaxFee: 100000,
};

export function DeployWallet() {
  const navigate = useNavigate();
  const location = useLocation();
  const sourceWallet = location.state?.sourceWallet || "";
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployError, setDeployError] = useState("");

  const createGcWalletAddress = async () => {
    const seedPhrase = WDK.getRandomSeedPhrase();
    const wdk = new WDK(seedPhrase).registerWallet(
      "ethereum",
      WalletManagerEvmErc4337,
      ERC4337_SEPOLIA_CONFIG
    );

    let account: { getAddress: () => Promise<string>; dispose?: () => void } | null = null;

    try {
      account = await wdk.getAccount("ethereum", 0);
      return await account.getAddress();
    } finally {
      account?.dispose?.();
      (wdk as { dispose?: () => void }).dispose?.();
    }
  };

  const handleDeploy = async () => {
    setDeployError("");
    setIsDeploying(true);

    try {
      const gcWallet = await createGcWalletAddress();
      navigate("/deposit", { state: { sourceWallet, gcWallet } });
    } catch (error) {
      setDeployError(error instanceof Error ? error.message : String(error));
      setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Wallet Connected</h1>
          <p className="text-gray-600">
            Your wallet has been successfully connected
          </p>
          {sourceWallet && (
            <p className="text-xs font-mono text-gray-500 break-all">{sourceWallet}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">GC Proxy Wallet</h3>
              <p className="text-sm text-gray-600 mt-1">
                Deploy a secure proxy wallet to manage your funds with enhanced security and privacy
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleDeploy}
          disabled={isDeploying}
          className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
        >
          <Wallet className="w-5 h-5 mr-2" />
          {isDeploying ? "Deploying GC Wallet..." : "Deploy GC Proxy Wallet"}
        </Button>
        {deployError && <p className="text-sm text-red-600 text-center">{deployError}</p>}
      </div>
    </div>
  );
}
