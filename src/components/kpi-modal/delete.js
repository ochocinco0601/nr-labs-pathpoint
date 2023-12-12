import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { Button, HeadingText } from 'nr1';

const KpiModalDeleteContent = ({ kpi, setShowModal, updateKpiArray }) => {
  const clickHandler = useCallback(() => {
    updateKpiArray(kpi);
    setShowModal(false);
  }, [setShowModal, updateKpiArray]);

  return (
    <>
      <div>
        <div>
          <HeadingText type={HeadingText.TYPE.HEADING_3}>
            Are you sure you want to delete &quot;{kpi.name}&quot; KPI ?
          </HeadingText>
        </div>
      </div>
      <div className="kpi-modal-button-bar">
        <Button
          className="kpi-modal-buttons delete"
          type={Button.TYPE.DESTRUCTIVE}
          sizeType={Button.SIZE_TYPE.LARGE}
          spacingType={[Button.SPACING_TYPE.EXTRA_LARGE]}
          onClick={clickHandler}
        >
          Delete KPI
        </Button>
        <Button
          className={`kpi-modal-buttons cancel`}
          type={Button.TYPE.NORMAL}
          sizeType={Button.SIZE_TYPE.LARGE}
          spacingType={[Button.SPACING_TYPE.EXTRA_LARGE]}
          onClick={() => setShowModal(false)}
        >
          Cancel
        </Button>
      </div>
    </>
  );
};

KpiModalDeleteContent.propTypes = {
  kpi: PropTypes.object,
  setShowModal: PropTypes.func,
  updateKpiArray: PropTypes.func,
};

export default KpiModalDeleteContent;
