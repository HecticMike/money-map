import { useCallback, useEffect, useMemo, useState } from "react";

export type SupportedCurrency = "GBP" | "EUR";

interface CurrencyMeta {
  label: string;
  symbol: string;
  locale: string;
}

export const CURRENCY_META: Record<SupportedCurrency, CurrencyMeta> = {
  GBP: { label: "British Pound (GBP)", symbol: "\u00A3", locale: "en-GB" },
  EUR: { label: "Euro (EUR)", symbol: "\u20AC", locale: "en-IE" }
};

const STORAGE_KEY = "money-map-currency";

export const useCurrency = () => {
  const [currency, setCurrency] = useState<SupportedCurrency>("GBP");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "EUR" || stored === "GBP") {
      setCurrency(stored);
    } else {
      window.localStorage.setItem(STORAGE_KEY, "GBP");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);

  const formatAmount = useMemo(() => {
    return new Intl.NumberFormat(CURRENCY_META[currency].locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, [currency]);

  const format = useCallback(
    (value: number) => formatAmount.format(value),
    [formatAmount]
  );

  return {
    currency,
    setCurrency,
    meta: CURRENCY_META[currency],
    format
  };
};

export const CURRENCY_SELECT_OPTIONS = (
  Object.entries(CURRENCY_META) as Array<[SupportedCurrency, CurrencyMeta]>
).map(([code, meta]) => ({
  code,
  label: meta.label
}));
