import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "./ui/button";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { addToBalance, getCurrentBalance } from "../balance";

export function TransactionStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<"submitting" | "success">("submitting");
  const [currentBalance, setCurrentBalance] = useState(getCurrentBalance());
  
  const amount = location.state?.amount || 0;
  const sourceWallet = location.state?.sourceWallet || "";
  const gcWallet = location.state?.gcWallet || "";

  useEffect(() => {
    // Simulate transaction processing
    const timer = setTimeout(() => {
      const updatedBalance = addToBalance(amount);
      setCurrentBalance(updatedBalance);
      setStatus("success");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    navigate("/", {
      state: {
        buyAmount: amount,
      },
    });
  };

  const handleNewDeposit = () => {
    navigate("/deposit", { state: { sourceWallet, gcWallet } });
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

          {/* Status Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            {/* Status Icon and Title */}
            <div className="text-center space-y-4">
              {status === "submitting" ? (
                <>
                  <Loader2 className="w-16 h-16 mx-auto text-blue-600 animate-spin" />
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Submitting Transaction
                  </h2>
                  <p className="text-sm text-gray-600">
                    Please wait while we process your transaction
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Transaction Successful
                  </h2>
                  <p className="text-sm text-gray-600">
                    Your deposit has been processed successfully
                  </p>
                </>
              )}
            </div>

            {/* Transaction Details */}
            {status === "success" && (
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900">Transaction Details</h3>
                
                {/* Source */}
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Source</p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {sourceWallet}
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex justify-center py-1">
                  <ArrowRight className="w-5 h-5 text-blue-600" />
                </div>

                {/* Destination */}
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Destination</p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {gcWallet}
                  </p>
                </div>

                {/* Amount Received */}
                <div className="bg-green-50 rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">You received</span>
                    <span className="text-lg font-bold text-green-600">
                      {amount.toFixed(2)} USDT
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {status === "success" && (
            <div className="space-y-3">
              <Button
                onClick={handleNewDeposit}
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
              >
                New Deposit
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full h-14 text-lg border-gray-300"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
