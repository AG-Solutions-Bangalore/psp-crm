import { useEffect, useState } from "react";
import DevToolsDialog from "./DevToolsDialog";

const DevToolsBlocker = () => {
  const [devToolsDetected, setDevToolsDetected] = useState(false);
  useEffect(() => {
    const threshold = 160;

    function detectDevTools() {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold =
        window.outerHeight - window.innerHeight > threshold;

      let debuggerDetected = false;
      const start = performance.now();
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        debuggerDetected = true;
      }

      return widthThreshold || heightThreshold || debuggerDetected;
    }

    const intervalId = setInterval(() => {
      const isOpen = detectDevTools();
      setDevToolsDetected(isOpen);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  if (devToolsDetected) {
    return <DevToolsDialog open={devToolsDetected} />;
  }

  return null;
};

export default DevToolsBlocker;
