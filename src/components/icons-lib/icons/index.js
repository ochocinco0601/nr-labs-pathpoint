import React from 'react';

const icons = {
  handle: (
    <>
      <circle cx="5" cy="3.5" r="1.5" />
      <circle cx="11" cy="3.5" r="1.5" />
      <circle cx="5" cy="8.5" r="1.5" />
      <circle cx="11" cy="8.5" r="1.5" />
      <circle cx="5" cy="13.5" r="1.5" />
      <circle cx="11" cy="13.5" r="1.5" />
    </>
  ),
};

const TYPES = Object.keys(icons).reduce(
  (acc, icon) => ({ ...acc, [icon.toUpperCase()]: icon }),
  {}
);

export { icons, TYPES };
