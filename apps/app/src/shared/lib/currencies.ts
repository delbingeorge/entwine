export interface Currency {
  code: string;
  label: string;
  locale: string;
  symbol: string;
}

const rupee: Currency = { code: "INR", label: "India", locale: "en-IN", symbol: "₹" };

export const currencies: Currency[] = [
  rupee,
  { code: "SGD", label: "Singapore", locale: "en-US", symbol: "S$" },
  { code: "MYR", label: "Malaysia", locale: "en-US", symbol: "RM" },
  { code: "IDR", label: "Indonesia", locale: "en-US", symbol: "Rp" },
  { code: "VND", label: "Vietnam", locale: "en-US", symbol: "₫" },
  { code: "THB", label: "Thailand", locale: "en-US", symbol: "฿" },
  { code: "PHP", label: "Philippines", locale: "en-US", symbol: "₱" },
];

export const defaultCurrency = rupee.code;

const currencyFor = (code: string) => currencies.find((entry) => entry.code === code) ?? rupee;

export const formatSalary = (amount: number, code: string) => {
  const currency = currencyFor(code);

  return new Intl.NumberFormat(currency.locale, {
    currency: currency.code,
    maximumFractionDigits: 0,
    notation: "compact",
    style: "currency",
  }).format(amount);
};
