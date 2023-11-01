import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';

const defaults = {
  raw: [],
  withStatuses: [],
  setStatuses: () => {},
};

export const StagesContext = createContext(defaults);
export const StagesDispatchContext = createContext(null);

export const StagesContextProvider = ({ value, children }) => {
  const [withStatuses, setWithStatuses] = useState([]);

  const setStatuses = (stagesWithStatuses) =>
    setWithStatuses(stagesWithStatuses);

  return (
    <StagesContext.Provider value={{ raw: value, withStatuses, setStatuses }}>
      {children}
    </StagesContext.Provider>
  );
};

StagesContextProvider.propTypes = {
  value: PropTypes.shape({
    raw: PropTypes.array,
    withStatuses: PropTypes.array,
    setStatuses: PropTypes.func,
  }),
  children: PropTypes.element,
};
