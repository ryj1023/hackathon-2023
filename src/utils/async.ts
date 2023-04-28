export const retrier = async <T>(fn: () => Promise<T>, isSuccess: (val: T) => boolean, maxRetries = 3) => {
  let retries = 0;
  let res: T;
  do {
    if (retries > 0) {
      console.log(`Retrying... (${retries}/${maxRetries})`);
    }
    res = await fn();
    retries++;
  } while (!isSuccess(res) && retries < maxRetries);

  console.log(res);

  return res;
}