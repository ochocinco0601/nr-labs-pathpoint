import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  AccountStorageMutation,
  HeadingText,
  navigation,
  nerdlet,
  useAccountsQuery,
  usePlatformState,
} from 'nr1';

import { useFetchUser } from '../../src/hooks';

import StartPage from './start';
import BlankFlow from './blank';
import { uuid } from '../../src/utils';
import { MODES, NERD_STORAGE } from '../../src/constants';
import ImportFlow from './import';

const CreateFlowNerdlet = () => {
  const [page, setPage] = useState('start');
  const [accountName, setAccountName] = useState();
  const [{ accountId }] = usePlatformState();
  const { user } = useFetchUser();
  const { data: accounts } = useAccountsQuery();

  useEffect(() => {
    const acctName = (accounts.find((acc) => acc.id === accountId) || {}).name;
    setAccountName(acctName);
  }, [accountId, accounts]);

  useEffect(() => {
    nerdlet.setConfig({
      timePicker: false,
    });
  }, []);

  const createHandler = useCallback(
    async (acctId, doc = {}) => {
      if (!acctId) return;
      const id = uuid();
      const document = {
        ...doc,
        id,
        created: {
          user,
          timestamp: Date.now(),
        },
      };
      const {
        data: { nerdStorageWriteDocument: { id: writeId } = {} } = {},
        error,
      } = await AccountStorageMutation.mutate({
        accountId: acctId,
        actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
        collection: NERD_STORAGE.FLOWS_COLLECTION,
        documentId: id,
        document,
      });
      if (error) console.error('Error creating flow', error);
      if (writeId === id) {
        navigation.openNerdlet({
          id: 'home',
          urlState: {
            flow: { id },
            mode: MODES.EDIT,
            refreshFlows: true,
          },
        });
      }
    },
    [user]
  );

  const cancelHandler = () => setPage('start');

  const content = useMemo(() => {
    if (!page || page === 'start') return <StartPage onSelect={setPage} />;
    if (page === 'blank')
      return (
        <BlankFlow
          accountId={accountId}
          accountName={accountName}
          onCreate={createHandler}
          onCancel={cancelHandler}
        />
      );
    if (page === 'import')
      return (
        <ImportFlow
          accountId={accountId}
          accountName={accountName}
          onCreate={createHandler}
          onCancel={cancelHandler}
        />
      );
    return null;
  }, [page]);

  return (
    <div className="container nerdlet">
      <div className="create-flow">
        <header>
          <HeadingText type={HeadingText.TYPE.HEADING_2}>
            Create Flow
          </HeadingText>
        </header>
        {content}
      </div>
    </div>
  );
};

export default CreateFlowNerdlet;
