import Select from "react-select";
import { onboardingSelectMenuProps, onboardingSelectStyles } from "./onboardingSelectStyles.js";

/**
 * Profile-step dropdown (matches grey text inputs).
 */
export function OnboardingSelect({
  id,
  label,
  required = false,
  className = "",
  options,
  value,
  onChange,
  placeholder = "Select…",
  isSearchable = false,
  isDisabled = false,
  isClearable = false,
}) {
  return (
    <label className={`onboarding-field ${className}`.trim()} htmlFor={id}>
      <span className="onboarding-field__label">
        {label}
        {required ? " *" : ""}
      </span>
      <div className="onboarding-rs-wrap">
        <Select
          inputId={id}
          instanceId={id}
          classNamePrefix="onboarding-rs"
          options={options}
          value={value}
          onChange={onChange}
          styles={onboardingSelectStyles}
          placeholder={placeholder}
          isSearchable={isSearchable}
          isDisabled={isDisabled}
          isClearable={isClearable}
          {...onboardingSelectMenuProps}
        />
      </div>
    </label>
  );
}

/**
 * Academic-step dropdown: pick adds a chip; control stays empty.
 */
export function OnboardingSelectAdd({
  id,
  label,
  options,
  selected,
  onSelect,
  onRemove,
  disabled,
  emptyMessage = "Select…",
  searchable,
}) {
  const selectedSet = new Set(selected);
  const available = options.filter((o) => !selectedSet.has(o.value));
  const isSearchable = searchable ?? options.length > 20;

  return (
    <section className="onboarding-academic-section onboarding-academic-section--dropdown">
      <label className="onboarding-academic-section-label" htmlFor={id}>
        {label}
      </label>
      <div className="onboarding-rs-wrap onboarding-rs-wrap--wide">
        <Select
          inputId={id}
          instanceId={id}
          classNamePrefix="onboarding-rs"
          options={available}
          value={null}
          onChange={(opt) => {
            if (opt?.value) onSelect(opt.value);
          }}
          styles={onboardingSelectStyles}
          placeholder={emptyMessage}
          isSearchable={isSearchable}
          isDisabled={disabled || available.length === 0}
          {...onboardingSelectMenuProps}
        />
      </div>
      <div className="onboarding-academic-chips" aria-live="polite">
        {selected.map((value) => (
          <AcademicChip
            key={value}
            label={labelForValue(value, options)}
            onRemove={() => onRemove(value)}
          />
        ))}
      </div>
    </section>
  );
}

function AcademicChip({ label, onRemove }) {
  return (
    <span className="onboarding-academic-chip">
      <span className="onboarding-academic-chip-label">{label}</span>
      <button
        type="button"
        className="onboarding-academic-chip-remove"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden fill="none">
          <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

function labelForValue(value, options) {
  return options.find((o) => o.value === value)?.label ?? value;
}
