interface SalaryFieldProps {
  onValueChange: (value: string) => void;
  value: string;
}

export const SalaryField = ({ onValueChange, value }: SalaryFieldProps) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-raised px-4 focus-within:border-ink">
      <span className="text-ink-muted">₹</span>
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
