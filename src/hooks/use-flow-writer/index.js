import { useCallback } from 'react';
import { AccountStorageMutation, AccountStorageQuery } from 'nr1';

import { NERD_STORAGE } from '../../constants';

const useFlowWriter = ({ accountId, user }) => {
  const write = useCallback(async ({ documentId, document }) => {
    const { data: { nerdStorageWriteDocument } = {}, error: flowWriteError } =
      await AccountStorageMutation.mutate({
        actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
        collection: NERD_STORAGE.FLOWS_COLLECTION,
        accountId,
        documentId,
        document: document,
      });

    if (flowWriteError) {
      console.error(flowWriteError);
      return;
    }

    if (nerdStorageWriteDocument) {
      const { data: logsData, error: logReadError } =
        await AccountStorageQuery.query({
          accountId,
          collection: NERD_STORAGE.EDITS_LOG_COLLECTION,
          documentId,
        });
      if (logReadError) return;

      const { logs = [] } = logsData || {};
      AccountStorageMutation.mutate({
        accountId,
        actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
        collection: NERD_STORAGE.EDITS_LOG_COLLECTION,
        documentId,
        document: {
          logs: [
            ...logs,
            {
              timestamp: Date.now(),
              user,
            },
          ],
        },
      });
    }
  }, []);

  return { write };
};

export default useFlowWriter;
