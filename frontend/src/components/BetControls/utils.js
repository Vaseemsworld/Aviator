// utils.js
export const clampValue = (val, min = 10, max = 22000) =>
  Math.min(Math.max(val, min), max).toFixed(2);

export const handleChange = (e, setValue) => {
  const input = parseFloat(e.target.value);
  if (!isNaN(input)) {
    setValue(clampValue(input));
  }
};

export const handleIncrement = (value, setValue) => {
  const numeric = parseFloat(value);
  setValue(clampValue(numeric + 1));
};

export const handleDecrement = (value, setValue) => {
  const numeric = parseFloat(value);
  setValue(clampValue(numeric - 1));
};

export const handleBlur = (value, setValue) => {
  const numeric = parseFloat(value);
  setValue(!isNaN(numeric) ? clampValue(numeric) : "10.00");
};
