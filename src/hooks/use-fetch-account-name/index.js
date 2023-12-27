import { useEffect, useState } from 'react';
import { useNerdGraphQuery } from 'nr1';

const useFetchAccount = ({ accountId } = {}) => {
  const [accountObject, setAccountObject] = useState({});

  const { loading, error, data } = useNerdGraphQuery({
    query: `query($id: Int!) { actor { account(id: $id) { name } } }`,
    variables: { id: accountId },
  });

  useEffect(() => {
    if (error) console.error('Error fetching data', error);
  }, [error]);

  useEffect(() => {
    if (data?.actor?.account && !loading) {
      setAccountObject(data.actor.account);
    }
  }, [data, loading]);

  return { accountObject };
};

export default useFetchAccount;
