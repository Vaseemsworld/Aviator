import { useState,useEffect } from "react";

function useSyncedRefWithRAF(ref) {
  const [value, setValue] = useState(ref.current);

  useEffect(() => {
    let animationFrameId;

    const updateValue = () => {
      setValue(ref.current);
      animationFrameId = requestAnimationFrame(updateValue);
    };

    animationFrameId = requestAnimationFrame(updateValue);
    return () => cancelAnimationFrame(animationFrameId);
  }, [ref]);

  return value;
}

export default useSyncedRefWithRAF;