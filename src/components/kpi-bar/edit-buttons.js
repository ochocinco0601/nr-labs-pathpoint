import React from 'react';
import PropTypes from 'prop-types';

import { Button } from 'nr1';
import { KPI_MODES } from '../../constants';

const KpiEditButtons = ({ kpiId, onClick }) => (
  <div className="kpi-buttons">
    <Button
      className="box-shadow"
      type={Button.TYPE.SECONDARY}
      iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__CLOSE}
      sizeType={Button.SIZE_TYPE.SMALL}
      onClick={() => onClick(kpiId, KPI_MODES.DELETE)}
    />
    <Button
      className="box-shadow"
      type={Button.TYPE.SECONDARY}
      iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__EDIT}
      sizeType={Button.SIZE_TYPE.SMALL}
      onClick={() => onClick(kpiId, KPI_MODES.EDIT)}
    />
  </div>
);

KpiEditButtons.propTypes = {
  kpiId: PropTypes.string,
  onClick: PropTypes.func,
};

export default KpiEditButtons;
