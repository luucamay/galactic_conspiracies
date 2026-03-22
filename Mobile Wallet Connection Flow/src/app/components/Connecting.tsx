import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function Connecting() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(true);
  const buyAmount = location.state?.buyAmount;

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error("No wallet found. Install MetaMask or another EVM wallet.");
    }

    const result = await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = Array.isArray(result) ? (result as string[]) : [];
    const address = accounts[0];

    if (!address) {
      throw new Error("Wallet connected but no account was returned.");
    }

    return address;
  }, []);

  const beginConnection = useCallback(async () => {
    setError("");
    setIsConnecting(true);

    try {
      const sourceWallet = await connectWallet();
      navigate("/deploy-wallet", {
        state: {
          sourceWallet,
          buyAmount,
        },
      });
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : String(connectError));
      setIsConnecting(false);
    }
  }, [connectWallet, navigate]);

  useEffect(() => {
    beginConnection();
  }, [beginConnection]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-6">
          {isConnecting ? (
            <Loader2 className="w-16 h-16 mx-auto text-blue-600 animate-spin" />
          ) : (
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl font-semibold">
              !
            </div>
          )}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">Connecting Wallet</h2>
            {isConnecting ? (
              <p className="text-gray-600">
                Please approve the connection request in your wallet
              </p>
            ) : (
              <p className="text-red-600">{error}</p>
            )}
          </div>
          {!isConnecting && (
            <Button onClick={beginConnection} className="w-full h-12 bg-blue-600 hover:bg-blue-700">
              Retry Connection
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
