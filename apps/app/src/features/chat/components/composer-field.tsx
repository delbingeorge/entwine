interface ComposerFieldProps {
  isDisabled: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  value: string;
}

export const ComposerField = ({ isDisabled, onChange, onSubmit, value }: ComposerFieldProps) => (
  <textarea
    className="composer-field max-h-[200px] min-h-[24px] w-full resize-none bg-transparent px-1 pt-0.5 text-[14px] leading-relaxed text-composer-ink outline-none [field-sizing:content] placeholder:text-composer-placeholder"
    disabled={isDisabled}
    onChange={(event) => {
      onChange(event.target.value);
    }}
    onKeyDown={(event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        onSubmit();
      }
    }}
    placeholder="Attach your resume, or tell me what you're looking for…"
    rows={1}
    value={value}
  />
);
