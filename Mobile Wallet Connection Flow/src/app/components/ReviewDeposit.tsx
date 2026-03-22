import { useNavigate, useLocation } from "react-router";
import { Button } from "./ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { getCurrentBalance } from "../balance";

export function ReviewDeposit() {
  const navigate = useNavigate();
  const location = useLocation();
  const amount = location.state?.amount || 0;
  const currentBalance = getCurrentBalance();
  const sourceWallet = location.state?.sourceWallet || "";
  const gcWallet = location.state?.gcWallet || "";
  const estimatedTime = 2;
  const transactionFee = 0.5;

  const handleConfirm = () => {
    navigate("/transaction", { state: { amount, sourceWallet, gcWallet } });
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

          {/* Review Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            {/* Amount */}
            <div className="pb-5 border-b border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Amount</p>
              <p className="text-3xl font-bold text-gray-900">{amount.toFixed(2)} USDT</p>
            </div>

            {/* Source */}
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Source</p>
              <p className="text-sm font-mono text-gray-900 break-all">
                {sourceWallet}
              </p>
            </div>

            {/* Arrow Indicator */}
            <div className="flex justify-center py-2">
              <ArrowRight className="w-5 h-5 text-blue-600" />
            </div>

            {/* Destination */}
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Destination</p>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900">GC Wallet</p>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {gcWallet}
                </p>
              </div>
            </div>

            {/* Estimated Time */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Estimated Time</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">~{estimatedTime} mins</span>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">You send</span>
              <span className="font-semibold text-gray-900">{amount.toFixed(2)} USDT</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">You receive</span>
              <span className="font-semibold text-gray-900">{amount.toFixed(2)} USDT</span>
            </div>
            <div className="flex items-center justify-between text-sm pt-3 border-t border-blue-100">
              <span className="text-gray-700">Transaction Fee</span>
              <span className="font-semibold text-gray-900">{transactionFee.toFixed(2)} USDT</span>
            </div>
          </div>

          {/* Confirm Button */}
          <Button
            onClick={handleConfirm}
            className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
          >
            Confirm Order
          </Button>
        </div>
      </div>
    </div>
  );
}
