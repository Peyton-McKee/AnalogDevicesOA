type Method = 'GET' | 'POST';

interface FetchOptions {
  body?: object;
  method?: Method;
}

/**
 *
 * @param route
 * @param param1
 * @returns
 */
export const analogFetch = async <T>(route: string, { body = {}, method = 'GET' }: FetchOptions = {}): Promise<T> => {
  const response = await fetch(route, {
    body: method === 'GET' ? undefined : JSON.stringify(body),
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error encountered: ' + await response.text());
  }

  const data = await response.json();

  return data as T;
};
