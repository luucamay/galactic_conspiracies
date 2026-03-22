import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Wallet } from "lucide-react";

export function Welcome() {
  const navigate = useNavigate();

  const handleConnect = () => {
    navigate("/connecting");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-blue-600 rounded-full flex items-center justify-center">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Welcome to GC</h1>
          <p className="text-gray-600">
            Connect your crypto wallet to get started with GC's secure proxy wallet service
          </p>
        </div>

        <Button
          onClick={handleConnect}
          className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
        >
          Connect Crypto Wallet
        </Button>
      </div>
    </div>
  );
}
