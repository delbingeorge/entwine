import { currencies } from "@/shared/lib/currencies";

interface SalaryFieldProps {
  currency: string;
  onCurrencyChange: (code: string) => void;
  onValueChange: (value: string) => void;
  value: string;
}

export const SalaryField = ({
  currency,
  onCurrencyChange,
  onValueChange,
  value,
}: SalaryFieldProps) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-raised pr-4 pl-2 focus-within:border-ink">
      <select
        aria-label="Currency"
        className="shrink-0 rounded-md bg-transparent py-3 pr-1 pl-2 text-ink-muted outline-none focus:text-ink"
        onChange={(event) => {
          onCurrencyChange(event.target.value);
        }}
        value={currency}
      >
        {currencies.map((entry) => (
          <option key={entry.code} value={entry.code}>
            {entry.symbol} {entry.code}
          </option>
        ))}
      </select>
      <input
        className="w-full bg-transparent py-3 text-ink outline-none placeholder:text-ink-muted"
        inputMode="numeric"
        onChange={(event) => {
          onValueChange(event.target.value.replace(/\D/gu, ""));
        }}
        placeholder="2500000"
        value={value}
      />
    </div>
    <p className="text-sm text-ink-muted">Per year. We never show this to companies.</p>
  </div>
);
