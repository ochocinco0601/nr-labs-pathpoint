import React from 'react';

const icons = {
  camera: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.5073 4.86951L11.8032 5.18182H12.2333H14.5V13H1.5V5.18182H3.76667H4.19684L4.49267 4.86951L6.26351 3H9.73649L11.5073 4.86951ZM15.5 4.18182H14.5H12.2333L10.1667 2H5.83333L3.76667 4.18182H1.5H0.5V5.18182V13V14H1.5H14.5H15.5V13V5.18182V4.18182ZM10.5 8.5C10.5 9.88071 9.38071 11 8 11C6.61929 11 5.5 9.88071 5.5 8.5C5.5 7.11929 6.61929 6 8 6C9.38071 6 10.5 7.11929 10.5 8.5ZM11.5 8.5C11.5 10.433 9.933 12 8 12C6.067 12 4.5 10.433 4.5 8.5C4.5 6.567 6.067 5 8 5C9.933 5 11.5 6.567 11.5 8.5Z"
    />
  ),
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
  'stage-shape-none': <rect x="0.5" y="4" width="15" height="9" rx="0.5" />,
  'stage-shape-start': (
    <polygon points="0.5 4 13.0333 4 15.4333 8.5 13.0333 13 0.5 13" />
  ),
  'stage-shape-connector': (
    <polygon points="3.274507 8.73529 3.399997 8.5 3.274507 8.26471 1 4 13.199967 4 15.599967 8.5 13.199967 13 1 13" />
  ),
  'stage-shape-stop': (
    <polygon points="3.204226 8.72932 3.322576 8.5 3.204226 8.27068 1 4 15.679266 4 15.679266 13 1 13" />
  ),
};

const TYPES = Object.keys(icons).reduce(
  (acc, icon) => ({ ...acc, [icon.toUpperCase()]: icon }),
  {}
);

export { icons, TYPES };
