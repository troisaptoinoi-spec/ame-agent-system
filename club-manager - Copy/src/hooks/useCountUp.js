import { useState, useEffect } from 'react';

export function useCountUp(endValue, duration = 1500) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime = null;
    let isString = typeof endValue === 'string';
    let target = isString ? parseInt(endValue.replace(/\D/g, '')) || 0 : endValue;
    if (target === 0) {
      setValue(endValue);
      return;
    }

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function (easeOutExpo)
      const ease = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      const currentVal = Math.floor(target * ease);

      if (isString) {
        setValue(endValue.replace(target.toString(), currentVal.toString()));
      } else {
        setValue(currentVal);
      }

      if (percentage < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [endValue, duration]);

  return value;
}
