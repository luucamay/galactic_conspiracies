'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  BatteryCharging,
  MessageSquare,
  Phone,
  Radio,
  Loader2,
  AlertCircle,
  User,
  Shield,
  Mail,
  Wallet,
  ArrowDownUp,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { addToBalance, getCurrentBalance, subtractFromBalance } from '@/lib/balance';

export type PaymentAction = 'fuel' | 'inject' | 'call' | 'claim';

interface PaymentModalProps {
  action: PaymentAction;
  stationName: string;
  injectMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const ACTION_CONFIG = {
  fuel: {
    title: 'FUEL STATION',
    description: '+5 Minutes Stability',
    price: 1,
    icon: BatteryCharging,
    color: 'red',
  },
  inject: {
    title: 'INJECT MESSAGE',
    description: 'Broadcast system message',
    price: 10,
    icon: MessageSquare,
    color: 'purple',
  },
  call: {
    title: 'CALL STATION',
    description: 'Patch into live broadcast',
    price: 250,
    icon: Phone,
    color: 'green',
  },
  claim: {
    title: 'CLAIM FREQUENCY',
    description: 'Take ownership of this station',
    price: 500,
    icon: Radio,
    color: 'amber',
  },
};

type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';
type PaymentStep = 'buy' | 'connecting' | 'deploy' | 'deposit' | 'review' | 'transaction';
type TxStatus = 'submitting' | 'success';

export function PaymentModal({ action, stationName, injectMessage, onConfirm, onCancel }: PaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>('buy');
  const [txStatus, setTxStatus] = useState<TxStatus>('submitting');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [userName, setUserName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('galactic-conspiracies-user-name') || '';
    }
    return '';
  });
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('galactic-conspiracies-user-email') || '';
    }
    return '';
  });
  const [currentBalance, setCurrentBalance] = useState(0);
  const [amount, setAmount] = useState('0');
  const [sourceWallet, setSourceWallet] = useState('');
  const [gcWallet, setGcWallet] = useState('');
  const [stepError, setStepError] = useState('');
  const [connectAttempt, setConnectAttempt] = useState(0);

  const config = ACTION_CONFIG[action];
  const Icon = config.icon;

  const parsedAmount = Number.parseFloat(amount);
  const depositAmount = Number.isNaN(parsedAmount) ? 0 : parsedAmount;

  const colorClasses = {
    red: {
      bg: 'bg-red-500/10',
      bgHover: 'hover:bg-red-500/20',
      border: 'border-red-500/30',
      text: 'text-red-500',
      glow: 'shadow-red-500/20',
    },
    purple: {
      bg: 'bg-purple-500/10',
      bgHover: 'hover:bg-purple-500/20',
      border: 'border-purple-500/30',
      text: 'text-purple-500',
      glow: 'shadow-purple-500/20',
    },
    green: {
      bg: 'bg-green-500/10',
      bgHover: 'hover:bg-green-500/20',
      border: 'border-green-500/30',
      text: 'text-green-500',
      glow: 'shadow-green-500/20',
    },
    amber: {
      bg: 'bg-amber-500/10',
      bgHover: 'hover:bg-amber-500/20',
      border: 'border-amber-500/30',
      text: 'text-amber-500',
      glow: 'shadow-amber-500/20',
    },
  };

  const colors = colorClasses[config.color as keyof typeof colorClasses];

  useEffect(() => {
    setCurrentBalance(getCurrentBalance());
    setAmount(config.price.toFixed(2));
  }, [config.price]);

  useEffect(() => {
    if (step !== 'connecting') {
      return;
    }

    let isActive = true;

    const connectWallet = async () => {
      setStatus('processing');
      setStepError('');

      try {
        if (!window.ethereum) {
          throw new Error('No wallet found. Install MetaMask or another EVM wallet.');
        }

        const result = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = Array.isArray(result) ? (result as string[]) : [];
        const address = accounts[0];

        if (!address) {
          throw new Error('Wallet connected but no account was returned.');
        }

        if (!isActive) {
          return;
        }

        setSourceWallet(address);
        setStatus('idle');
        setStep('deploy');
      } catch (error) {
        if (!isActive) {
          return;
        }

        setStatus('error');
        setStepError(error instanceof Error ? error.message : String(error));
      }
    };

    void connectWallet();

    return () => {
      isActive = false;
    };
  }, [step, connectAttempt]);

  const isFormValid = userName.trim().length >= 2 && email.includes('@');
  const canContinueDeposit = depositAmount >= config.price;
  const fee = 0.5;
  const estimatedTime = 2;
  const amountLabel = useMemo(() => depositAmount.toFixed(2), [depositAmount]);

  const persistProfile = () => {
    localStorage.setItem('galactic-conspiracies-user-name', userName.trim());
    localStorage.setItem('galactic-conspiracies-user-email', email.trim());
  };

  const completeAction = () => {
    persistProfile();
    setTimeout(() => onConfirm(), 1200);
  };

  const handleBuy = () => {
    if (!isFormValid) {
      return;
    }

    setStepError('');
    const spendAttempt = subtractFromBalance(config.price);

    if (spendAttempt.ok) {
      setCurrentBalance(spendAttempt.balance);
      setStep('transaction');
      setTxStatus('success');
      completeAction();
      return;
    }

    setStep('connecting');
  };

  const handleDeploy = async () => {
    setStatus('processing');
    setStepError('');

    try {
      const response = await fetch('/api/wallet/deploy', {
        method: 'POST',
      });

      const payload = (await response.json()) as { gcWallet?: string; error?: string };

      if (!response.ok || !payload.gcWallet) {
        throw new Error(payload.error || 'Failed to deploy GC wallet.');
      }

      setGcWallet(payload.gcWallet);
      setStatus('idle');
      setStep('deposit');
    } catch (error) {
      setStatus('error');
      setStepError(error instanceof Error ? error.message : String(error));
    }
  };

  const handleConfirmDeposit = async () => {
    if (!canContinueDeposit) {
      return;
    }

    setStep('transaction');
    setTxStatus('submitting');
    setStatus('processing');

    await new Promise((resolve) => setTimeout(resolve, 2500));

    const updatedBalance = addToBalance(depositAmount);
    const spendAttempt = subtractFromBalance(config.price);

    if (spendAttempt.ok) {
      setCurrentBalance(spendAttempt.balance);
      setTxStatus('success');
      setStatus('success');
      completeAction();
    } else {
      setCurrentBalance(updatedBalance);
      setStatus('error');
      setStepError('Deposit finished, but balance is still too low for this action.');
      setStep('deposit');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-sm bg-zinc-950 rounded-2xl overflow-hidden border ${colors.border} shadow-2xl ${colors.glow}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${colors.bg} rounded-xl`}>
                <Icon className={`w-6 h-6 ${colors.text}`} />
              </div>
              <button
                onClick={onCancel}
                disabled={status === 'processing'}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            
            <h2 className="font-mono text-xl font-bold text-zinc-100 tracking-widest uppercase">
              {config.title}
            </h2>
            <p className="text-zinc-500 text-sm mt-1 font-sans">
              {config.description}
            </p>
            
            {action === 'inject' && injectMessage && (
              <div className="mt-4 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                <p className="font-mono text-xs text-zinc-400 mb-1">Message:</p>
                <p className="text-sm text-zinc-300 font-mono">&quot;{injectMessage}&quot;</p>
              </div>
            )}
            
            <div className="mt-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-sm">Station</span>
                <span className="font-mono text-zinc-100 text-sm uppercase">{stationName}</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800">
                <span className="text-zinc-400 text-sm">Total</span>
                <span className="font-mono text-2xl font-bold text-zinc-100">${config.price}</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="p-6 space-y-4">
            {step === 'buy' && (
              <>
                <div>
                  <label className="block text-xs text-zinc-500 font-mono uppercase tracking-widest mb-2">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-zinc-600 transition-colors font-mono placeholder:text-zinc-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 font-mono uppercase tracking-widest mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-zinc-600 transition-colors font-mono placeholder:text-zinc-700"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Current Balance</span>
                    <span className="font-mono text-zinc-100">{currentBalance.toFixed(2)} USDT</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Needed for {config.title}</span>
                    <span className="font-mono text-zinc-100">{config.price.toFixed(2)} USDT</span>
                  </div>
                </div>

                <button
                  onClick={handleBuy}
                  disabled={!isFormValid || status === 'processing'}
                  className="w-full py-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 hover:from-orange-500/20 hover:to-yellow-500/20 border border-orange-500/30 text-orange-400 font-semibold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Wallet className="w-5 h-5" />
                  Buy and Continue
                </button>
                <p className="text-center text-xs text-zinc-600">
                  If your balance is low, you will be guided to connect wallet and deposit funds.
                </p>
              </>
            )}

            {step === 'connecting' && (
              <div className="flex flex-col items-center py-6 text-center">
                {status === 'processing' ? (
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                ) : (
                  <div className="w-12 h-12 mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                )}
                <h3 className="font-mono text-lg font-bold text-zinc-100 uppercase tracking-widest">
                  Connecting Wallet
                </h3>
                <p className="text-zinc-500 text-sm mt-2">
                  {status === 'processing'
                    ? 'Approve the connection request in your EVM wallet.'
                    : stepError || 'Connection failed.'}
                </p>
                {status !== 'processing' && (
                  <button
                    onClick={() => {
                      setStatus('idle');
                      setConnectAttempt((prev) => prev + 1);
                    }}
                    className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                  >
                    Retry Connection
                  </button>
                )}
              </div>
            )}

            {step === 'deploy' && (
              <div className="space-y-4">
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-100">GC Proxy Wallet</h3>
                      <p className="text-sm text-zinc-500 mt-1">
                        Deploy a secure proxy wallet before depositing funds.
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-zinc-500 break-all">
                    Source wallet: {sourceWallet}
                  </p>
                </div>
                <button
                  onClick={() => void handleDeploy()}
                  disabled={status === 'processing'}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {status === 'processing' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wallet className="w-5 h-5" />}
                  {status === 'processing' ? 'Deploying GC Wallet...' : 'Deploy GC Proxy Wallet'}
                </button>
                {stepError && <p className="text-sm text-red-500 text-center">{stepError}</p>}
              </div>
            )}

            {step === 'deposit' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">Deposit Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={config.price}
                      step="0.01"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 pr-20 text-2xl font-mono text-zinc-100"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">USDT</div>
                  </div>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4 space-y-3 border border-zinc-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">You send</span>
                    <span className="font-mono text-zinc-100">{amountLabel} USDT</span>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <ArrowDownUp className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">You receive</span>
                    <span className="font-mono text-zinc-100">{amountLabel} USDT</span>
                  </div>
                </div>
                {!canContinueDeposit && (
                  <p className="text-xs text-amber-500">Deposit must be at least {config.price.toFixed(2)} USDT.</p>
                )}
                <button
                  onClick={() => setStep('review')}
                  disabled={!canContinueDeposit}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-4">
                  <div>
                    <p className="text-sm text-zinc-500 mb-1">Amount</p>
                    <p className="text-2xl font-bold text-zinc-100 font-mono">{amountLabel} USDT</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Source</p>
                    <p className="text-xs font-mono text-zinc-200 break-all">{sourceWallet}</p>
                  </div>
                  <div className="flex justify-center py-1">
                    <ArrowRight className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Destination</p>
                    <p className="text-xs font-mono text-zinc-200 break-all">{gcWallet}</p>
                  </div>
                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Clock className="w-4 h-4" />
                      <span>Estimated Time</span>
                    </div>
                    <span className="font-semibold text-zinc-100">~{estimatedTime} mins</span>
                  </div>
                </div>
                <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">You send</span>
                    <span className="font-semibold text-zinc-100">{amountLabel} USDT</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">You receive</span>
                    <span className="font-semibold text-zinc-100">{amountLabel} USDT</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-blue-500/20">
                    <span className="text-zinc-400">Transaction Fee</span>
                    <span className="font-semibold text-zinc-100">{fee.toFixed(2)} USDT</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStep('deposit')}
                    className="w-full py-3 border border-zinc-700 text-zinc-300 rounded-xl hover:bg-zinc-900 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => void handleConfirmDeposit()}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                  >
                    Confirm Order
                  </button>
                </div>
              </div>
            )}

            {step === 'transaction' && txStatus === 'submitting' ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <h3 className="font-mono text-lg font-bold text-zinc-100 uppercase tracking-widest">
                  Submitting Transaction
                </h3>
                <p className="text-zinc-500 text-sm mt-1 text-center">Please wait while we process your deposit.</p>
              </div>
            ) : null}

            {step === 'transaction' && txStatus === 'success' ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-8"
              >
                <div className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center mb-4`}>
                  <CheckCircle2 className={`w-8 h-8 ${colors.text}`} />
                </div>
                <h3 className="font-mono text-lg font-bold text-zinc-100 uppercase tracking-widest">
                  Transaction Successful
                </h3>
                <p className="text-zinc-500 text-sm mt-1 text-center">Funds deposited and action confirmed.</p>
                <p className="text-xs text-zinc-600 mt-3">New Balance: {currentBalance.toFixed(2)} USDT</p>
              </motion.div>
            ) : null}

            {status === 'error' && step !== 'connecting' ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-8"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-mono text-lg font-bold text-zinc-100 uppercase tracking-widest">
                  Transaction Failed
                </h3>
                <p className="text-zinc-500 text-sm mt-1">{stepError || 'Please try again.'}</p>
              </motion.div>
            ) : null}

            <div className="flex items-center justify-center gap-2 pt-2">
              <Shield className="w-3 h-3 text-zinc-600" />
              <p className="text-center text-xs text-zinc-600">
                Secure checkout flow adapted from the mobile wallet connection journey
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
