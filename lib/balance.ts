const BALANCE_STORAGE_KEY = 'gc_current_balance';

function normalizeAmount(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

export function getCurrentBalance() {
  if (typeof window === 'undefined') {
    return 0;
  }

  const rawValue = window.localStorage.getItem(BALANCE_STORAGE_KEY);
  const parsedValue = Number.parseFloat(rawValue ?? '0');
  return normalizeAmount(parsedValue);
}

export function setCurrentBalance(amount: number) {
  const normalizedAmount = normalizeAmount(amount);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(BALANCE_STORAGE_KEY, normalizedAmount.toFixed(2));
  }

  return normalizedAmount;
}

export function addToBalance(amount: number) {
  return setCurrentBalance(getCurrentBalance() + normalizeAmount(amount));
}

export function subtractFromBalance(amount: number) {
  const currentBalance = getCurrentBalance();
  const spendAmount = normalizeAmount(amount);

  if (spendAmount > currentBalance) {
    return {
      ok: false,
      balance: currentBalance,
    };
  }

  return {
    ok: true,
    balance: setCurrentBalance(currentBalance - spendAmount),
  };
}
