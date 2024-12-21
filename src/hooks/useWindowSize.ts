import { useState, useEffect } from "react";

export interface Size {
  width: number;
  height: number;
}

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState<Size>({
    width: 0,
    height: 0,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isIpadProView = windowSize
    ? 992 < windowSize.width && windowSize.width < 1366
    : false;
  const isIpadView = windowSize
    ? 667 < windowSize.width && windowSize.width < 993
    : false;
  const isMobileHorizontalView = windowSize
    ? 575 < windowSize.width && windowSize.width < 768
    : false;
  const isMobileView = windowSize ? windowSize.width < 576 : false;
  const isMobileMode = isMobileView || isMobileHorizontalView;

  const isMediumDesktop = windowSize
    ? 992 < windowSize.width && windowSize.width <= 1280
    : false;

  return {
    windowSize,
    isMobileView,
    isIpadProView,
    isIpadView,
    isMobileHorizontalView,
    isMobileMode,
    isMediumDesktop,
  } as const;
}
