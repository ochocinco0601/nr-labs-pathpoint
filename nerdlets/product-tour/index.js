import React, { useContext, useEffect, useState } from 'react';

import { Button, Icon, nerdlet, PlatformStateContext } from 'nr1';

import { MODES, UI_CONTENT } from '../../src/constants';
import flows from './flows.json';
import content from './content.json';
import FlowListSteps from './flow-list-steps';
import FlowSteps from './flow-steps';

const ProductTourNerdlet = () => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState(MODES.INLINE);
  const { accountId } = useContext(PlatformStateContext);

  useEffect(() => {
    nerdlet.setConfig({
      actionControls: true,
      actionControlButtons: [
        {
          label: UI_CONTENT.GLOBAL.BUTTON_LABEL_CREATE_FLOW,
          type: Button.TYPE.PRIMARY,
          iconType: Icon.TYPE.DATAVIZ__DATAVIZ__SERVICE_MAP_CHART,
          onClick: () => createFlow(),
        },
      ],
      headerType: nerdlet.HEADER_TYPE.CUSTOM,
      headerTitle: step === 1 ? 'Project Hedgehog 🦔' : flows[0].document.name,
    });
  }, [step]);

  const createFlow = () => null; // TODO: create a new flow

  const nextHandler = () =>
    setStep((s) => (s === content.length - 1 ? s : s + 1));

  const backHandler = () => setStep((s) => (s === 1 ? s : s - 1));

  const dismissHandler = () => null; // TODO: close the tour

  return step === 1 ? (
    <FlowListSteps
      flows={flows}
      content={content[step]}
      nextHandler={nextHandler}
      dismissHandler={dismissHandler}
    />
  ) : (
    <FlowSteps
      step={step}
      flow={flows[0].document}
      accountId={accountId}
      mode={mode}
      setMode={setMode}
      user={{}}
      content={content[step]}
      nextHandler={nextHandler}
      backHandler={backHandler}
      ctaHandler={createFlow}
      dismissHandler={dismissHandler}
    />
  );
};

export default ProductTourNerdlet;
