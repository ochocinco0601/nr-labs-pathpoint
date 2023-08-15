import { useEffect } from 'react';
import {
  AccountStorageMutation,
  AccountStorageQuery,
  useAccountStorageMutation,
} from 'nr1';

import { NERD_STORAGE } from '../../constants';

const useFlowWriter = ({ accountId, user }) => {
  const [write, { data, error: writeError }] = useAccountStorageMutation({
    actionType: useAccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
    collection: NERD_STORAGE.FLOWS_COLLECTION,
    accountId,
  });

  useEffect(() => {
    const writeToLog = async (documentId) => {
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
    };

    const { nerdStorageWriteDocument: { id } = {} } = data || {};
    if (id) writeToLog(id);
  }, [data]);

  useEffect(() => {
    if (writeError) console.error('Error writing flow', writeError);
  }, [writeError]);

  return { write, data };
};

export default useFlowWriter;
