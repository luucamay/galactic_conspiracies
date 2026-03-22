import { useLocation, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { getCurrentBalance, subtractFromBalance } from "../balance";

export function Welcome() {
  const navigate = useNavigate();
  const location = useLocation();
  const [amount, setAmount] = useState("0");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const stateAmount = location.state?.buyAmount;

    if (typeof stateAmount === "number" && Number.isFinite(stateAmount)) {
      setAmount(String(stateAmount));
    }

    setCurrentBalance(getCurrentBalance());
  }, [location.state]);

  const handleBuy = () => {
    setFeedback("");

    if (displayAmount <= 0) {
      setFeedback("Enter a valid mins amount greater than zero.");
      return;
    }

    const buyResult = subtractFromBalance(displayAmount);

    if (buyResult.ok) {
      setCurrentBalance(buyResult.balance);
      setFeedback(`Purchase complete: ${displayAmount} mins bought.`);
      return;
    }

    navigate("/connecting", {
      state: {
        buyAmount: displayAmount,
      },
    });
  };

  const parsedAmount = Number(amount);
  const displayAmount = Number.isNaN(parsedAmount) ? 0 : parsedAmount;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-gray-900">buy mins for live show</h1>
          <p className="text-sm text-gray-600">
            Current Balance: <span className="font-semibold text-gray-900">{currentBalance.toFixed(2)} USDT</span>
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="show-mins-input" className="text-sm text-gray-600 block">
            Amount
          </label>
          <Input
            id="show-mins-input"
            type="number"
            min="0"
            step="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="h-12 text-lg"
          />
        </div>

        <p className="text-center text-gray-600">
          extend show by <span className="font-semibold text-gray-900">{displayAmount}</span> mins
        </p>

        <Button onClick={handleBuy} className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700">
          Buy
        </Button>

        {feedback && <p className="text-sm text-center text-gray-600">{feedback}</p>}
      </div>
    </div>
  );
}
