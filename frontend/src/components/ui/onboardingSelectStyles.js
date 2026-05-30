/** Shared react-select styling for all onboarding dropdowns */

export const onboardingSelectStyles = {
  control: (base, state) => ({
    ...base,
    width: "100%",
    backgroundColor: "#d9d9d9",
    border: "none",
    borderRadius: "7px",
    boxShadow: "none",
    minHeight: "48px",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    opacity: state.isDisabled ? 0.55 : 1,
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "2px 12px",
    minHeight: "48px",
  }),
  indicatorsContainer: (base) => ({
    ...base,
    minHeight: "48px",
  }),
  placeholder: (base) => ({
    ...base,
    color: "rgba(0, 0, 0, 0.45)",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#000000",
  }),
  input: (base) => ({
    ...base,
    color: "#000000",
    margin: 0,
    padding: 0,
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#1a1a1a",
    paddingRight: 10,
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "7px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: 220,
    padding: 0,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "0.9375rem",
    backgroundColor: state.isSelected
      ? "#8fce9c"
      : state.isFocused
        ? "rgba(143, 206, 156, 0.4)"
        : "#ffffff",
    color: "#000000",
    cursor: "pointer",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

export const onboardingSelectMenuProps = {
  menuPortalTarget: typeof document !== "undefined" ? document.body : null,
  menuPosition: "fixed",
};
