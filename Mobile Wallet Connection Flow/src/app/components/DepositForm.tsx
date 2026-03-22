import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ArrowDownUp } from "lucide-react";
import { getCurrentBalance } from "../balance";

export function DepositForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [amount, setAmount] = useState("");
  const [currentBalance, setCurrentBalance] = useState(0);
  const sourceWallet = location.state?.sourceWallet || "";
  const gcWallet = location.state?.gcWallet || "";
  const buyAmount = location.state?.buyAmount;

  useEffect(() => {
    setCurrentBalance(getCurrentBalance());

    if (typeof buyAmount === "number" && Number.isFinite(buyAmount) && buyAmount > 0) {
      setAmount(String(buyAmount));
    }
  }, [buyAmount]);

  const handleContinue = () => {
    if (amount && parseFloat(amount) > 0) {
      navigate("/review", {
        state: {
          amount: parseFloat(amount),
          sourceWallet,
          gcWallet,
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Deposit</h1>
            <p className="text-sm text-gray-600">
              Current Balance: <span className="font-semibold">${currentBalance.toFixed(2)} USDT</span>
            </p>
          </div>

          {/* Amount Input */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Amount</label>
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="h-16 text-3xl pr-20 border-gray-200"
                  min="0"
                  step="0.01"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-500">
                  USDT
                </div>
              </div>
            </div>

            {/* Exchange Display */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">You send</span>
                <span className="font-semibold text-gray-900">
                  {amount || "0"} USDT
                </span>
              </div>
              
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <ArrowDownUp className="w-4 h-4 text-blue-600" />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">You receive</span>
                <span className="font-semibold text-gray-900">
                  {amount || "0"} USDT
                </span>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
