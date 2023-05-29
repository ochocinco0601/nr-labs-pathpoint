import React from 'react';
import PropTypes from 'prop-types';

import { Button } from 'nr1';
import { KPI_MODES } from '../../constants';

const KpiEditButtons = ({ index, onClick }) => (
  <div className="kpi-buttons">
    <Button
      className="box-shadow"
      type={Button.TYPE.SECONDARY}
      iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__CLOSE}
      sizeType={Button.SIZE_TYPE.SMALL}
      onClick={() => onClick(index, KPI_MODES.DELETE)}
    />
    <Button
      className="box-shadow"
      type={Button.TYPE.SECONDARY}
      iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__EDIT}
      sizeType={Button.SIZE_TYPE.SMALL}
      onClick={() => onClick(index, KPI_MODES.EDIT)}
    />
  </div>
);

KpiEditButtons.propTypes = {
  index: PropTypes.number,
  onClick: PropTypes.func,
};

export default KpiEditButtons;
