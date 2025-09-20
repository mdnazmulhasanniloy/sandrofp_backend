type CallbackArgs<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  [key: string]: unknown;
};

const callbackFn = <T = unknown>(
  callback: (args: CallbackArgs<T>) => void,
  result: CallbackArgs<T>,
) => {
  if (typeof callback === 'function') {
    callback(result);
  }
};
export default callbackFn;
