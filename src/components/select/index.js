import React from 'react';
import PropTypes from 'prop-types';

import { Dropdown, DropdownItem } from 'nr1';

const Select = ({ title = '', label = '', items = [], onSelect }) => (
  <Dropdown title={title} label={label}>
    {items.map((item, i) => (
      <DropdownItem
        key={i}
        onClick={() => onSelect(item, i)}
        selected={item.selected}
      >
        {item.option}
      </DropdownItem>
    ))}
  </Dropdown>
);

Select.propTypes = {
  title: PropTypes.string,
  label: PropTypes.string,
  items: PropTypes.arrayOf,
  onSelect: PropTypes.func,
};

export default Select;
