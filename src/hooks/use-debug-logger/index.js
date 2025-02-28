import { useCallback } from 'react';

const useDebugLogger = ({ allowDebug = false }) => {
  const debugLogJson = useCallback(
    (obj, title = 'Debug info') => {
      if (allowDebug && obj) {
        try {
          const jsonString = JSON.stringify(obj);
          console.groupCollapsed(title);
          console.debug(jsonString);
          console.groupEnd();
        } catch (e) {
          console.error(
            `Error [${title}]: Unable to convert debug output to JSON string`,
            e
          );
        }
      }
    },
    [allowDebug]
  );

  const debugString = useCallback(
    (str, title = 'Debug info') => {
      if (allowDebug && str) {
        console.groupCollapsed(title);
        console.debug(str);
        console.groupEnd();
      }
    },
    [allowDebug]
  );

  return { debugLogJson, debugString };
};

export default useDebugLogger;
