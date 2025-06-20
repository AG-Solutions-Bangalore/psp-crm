import { ChevronsUpDown } from "lucide-react";
import React from "react";
import ReactSelect from "react-select";

export const MemoizedSelect = React.memo(
  ({ value, onChange, options, placeholder }) => {
    const selectOptions = options.map((option) => ({
      value: option.value,
      label: option.label,
    }));

    const selectedOption = selectOptions.find(
      (option) => option.value === value
    );

    const customStyles = {
      control: (base, state) => ({
        ...base,
        borderRadius: "0.7rem",
        borderWidth: "0.1px",
        cursor: "pointer",
        borderColor: state.isFocused ? "#1f7a57" : base.borderColor,
        boxShadow: state.isFocused ? "0 0 0 0.1px #1f7a57" : "none",
        fontSize: "0.875rem",
        "&:hover": {
          borderColor: "#1f7a57",
        },
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? "#1f7a57" : "white",
        borderRadius: "0.7rem",
        textTransform: "uppercase",
        color: state.isFocused ? "white" : "#111827",
        "&:active": {
          backgroundColor: "#1f7a57",
          color: "white",
        },
      }),

      menu: (provided) => ({
        ...provided,
        borderRadius: "6px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }),
      placeholder: (provided) => ({
        ...provided,
        color: "#616161",
        fontSize: "14px",
        display: "flex",
        flexDirection: "row",
        alignItems: "start",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }),
      singleValue: (provided) => ({
        ...provided,
        color: "black",
        fontSize: "14px",
      }),
    };

    const DropdownIndicator = () => (
      <div className="p-2 flex items-center ">
        <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400" />
      </div>
    );

    return (
      <ReactSelect
        value={selectedOption}
        onChange={(selected) => onChange(selected ? selected.value : "")}
        options={selectOptions}
        placeholder={placeholder}
        styles={customStyles}
        components={{
          IndicatorSeparator: () => null,
          DropdownIndicator,
        }}
      />
    );
  }
);
