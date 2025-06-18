// Clamp a number between min and max
export const clampValue = (val, min = 1, max = 100000) => {
  const numeric = parseFloat(val);
  if (isNaN(numeric)) return min;
  return Math.min(Math.max(numeric, min), max);
};

// Format a number to 2 decimal places (string)
export const formatValue = (val, fallback = "0.00") => {
  const numeric = parseFloat(val);
  return !isNaN(numeric) ? numeric.toFixed(2) : fallback;
};

// Input change handler
export const handleChange = (e, setValue) => {
  const input = e.target.value;
  const numeric = parseFloat(input);
  if (!isNaN(numeric)) {
    const clamped = clampValue(numeric);
    setValue(formatValue(clamped));
  } else {
    setValue(0);
  }
};

// Increment value
export const handleIncrement = (value, setValue) => {
  const numeric = parseFloat(value);
  const clamped = clampValue(numeric + 1);
  setValue(formatValue(clamped));
};

// Decrement value
export const handleDecrement = (value, setValue, min = 1) => {
  const numeric = parseFloat(value);
  let newValue;
  if (numeric <= 2) {
    newValue = min;
  } else {
    newValue = numeric - 1;
  }
  const clamped = clampValue(newValue);
  setValue(formatValue(clamped));
};

// Blur handler – ensure clean formatting or fallback
export const handleBlur = (value, setValue, min = 10) => {
  const numeric = parseFloat(value);
  const valid = !isNaN(numeric);
  const clamped = valid ? clampValue(numeric) : min;
  if (clamped <= 1) {
    setValue(formatValue(min));
    return;
  }
  setValue(formatValue(clamped));
};
