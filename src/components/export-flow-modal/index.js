import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { Button, HeadingText, JsonChart } from 'nr1';

import Modal from '../modal';

const ExportFlowModal = ({ flowDoc, hidden = true, onClose }) => {
  const [data, setData] = useState(null);
  const linkRef = useRef(null);

  useEffect(() => {
    const { created: _, ...flow } = flowDoc || {}; // eslint-disable-line no-unused-vars
    setData(flow);
  }, [flowDoc]);

  const downloadButtonClickHandler = useCallback(() => {
    const exportBtn = linkRef.current;
    if (!exportBtn) return;

    const jsonStr = JSON.stringify(data);
    const blob = new Blob([JSON.stringify(jsonStr)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const fileName = `${(data?.name || 'flow')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()}.json`;
    exportBtn.download = fileName;
    exportBtn.href = url;
    exportBtn.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const closeHandler = () => onClose?.();

  return (
    <Modal hidden={hidden} onClose={closeHandler}>
      <div className="export-flow-modal">
        <div className="json-content">
          <HeadingText
            className="export-header"
            type={HeadingText.TYPE.HEADING_3}
          >
            Export flow
          </HeadingText>
          <JsonChart className="json-chart" data={data} fullHeight fullWidth />
        </div>
        <div className="button-bar">
          <a ref={linkRef} className="hidden-download-btn" />
          <Button
            disabled={!data}
            variant={Button.VARIANT.PRIMARY}
            onClick={downloadButtonClickHandler}
          >
            Download
          </Button>
        </div>
      </div>
    </Modal>
  );
};

ExportFlowModal.propTypes = {
  flowDoc: PropTypes.object,
  hidden: PropTypes.bool,
  onClose: PropTypes.func,
};

export default ExportFlowModal;
