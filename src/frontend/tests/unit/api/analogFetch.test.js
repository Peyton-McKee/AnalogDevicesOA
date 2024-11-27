import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { analogFetch } from '../../../src/api/fetch';
import { getMockFetch } from '../test-utils';

describe('analogFetch', () => {
  const mockResponse = { message: 'someMessage' };

  beforeEach(() => {
    global.fetch = getMockFetch(mockResponse);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should perform a GET request and return the data', async () => {
    const result = await analogFetch('/test-route');
    expect(fetch).toHaveBeenCalledWith('/test-route', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: undefined
    });
    expect(result).toEqual(mockResponse);
  });

  it('should perform a POST request with a body and return the data', async () => {
    const body = { key: 'value' };

    const result = await analogFetch('/test-route', { method: 'POST', body });
    expect(fetch).toHaveBeenCalledWith('/test-route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    expect(result).toEqual(mockResponse);
  });

  it('should throw an error for non-OK responses', async () => {
    global.fetch = getMockFetch("Something went wrong", false);

    await expect(analogFetch('/error-route')).rejects.toThrow('Error encountered: Something went wrong');
    expect(fetch).toHaveBeenCalledWith('/error-route', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: undefined
    });
  });
});
