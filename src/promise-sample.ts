export interface ResponseWithRaw<T> {
  data: T;
  rawResponse: Response;
}

export namespace ResponseWithRaw {
  /**
   * A type guard to check if an object is of type ResponseWithRaw<T>
   */
  export function is<T>(obj: unknown): obj is ResponseWithRaw<T> {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "data" in obj &&
      "rawResponse" in obj &&
      obj.rawResponse instanceof Response
    );
  }
}

export class PromiseWithRawResponse<T> implements PromiseLike<T> {
  private innerPromise: Promise<ResponseWithRaw<T>>;

  private constructor(promise: Promise<ResponseWithRaw<T>>) {
    this.innerPromise = promise;
  }

  public static fromFunction<T>(
    fn: () => Promise<ResponseWithRaw<T>>,
    ...args: Parameters<typeof fn>
  ): PromiseWithRawResponse<T> {
    return new PromiseWithRawResponse<T>(fn(...args));
  }

  public static fromPromise<T>(
    promise: Promise<ResponseWithRaw<T>>
  ): PromiseWithRawResponse<T> {
    return new PromiseWithRawResponse<T>(promise);
  }

  public static fromExecutor<T>(
    executor: (
      resolve: (value: ResponseWithRaw<T>) => void,
      reject: (reason?: unknown) => void
    ) => void
  ): PromiseWithRawResponse<T> {
    const promise = new Promise<ResponseWithRaw<T>>(executor);
    return new PromiseWithRawResponse<T>(promise);
  }

  public static fromResult<T>(
    result: ResponseWithRaw<T>
  ): PromiseWithRawResponse<T> {
    // Create a resolved promise with the given result
    const promise = Promise.resolve(result);
    return new PromiseWithRawResponse<T>(promise);
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: (value: T) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: unknown) => TResult2 | PromiseLike<TResult2>
  ): Promise<TResult1 | TResult2> {
    return this.innerPromise.then(
      onfulfilled ? ({ data }) => onfulfilled?.(data) : undefined,
      onrejected
    );
  }

  catch<TResult = never>(
    onrejected?: (reason: unknown) => TResult | PromiseLike<TResult>
  ): Promise<T | TResult> {
    return this.innerPromise.catch(onrejected).then((result) => {
      if (ResponseWithRaw.is<T>(result)) {
        return result.data;
      }
      // If the result is not of type ResponseWithRaw<T>, return it as-is
      return result as unknown as TResult;
    });
  }

  finally(onfinally?: () => void): Promise<T> {
    return this.innerPromise.finally(onfinally).then(({ data }) => data);
  }

  async withRawResponse(): Promise<ResponseWithRaw<T>> {
    return await this.innerPromise;
  }
}

export function getFoo(): PromiseWithRawResponse<FooResponse> {
  return PromiseWithRawResponse.fromFunction<FooResponse>(async () => {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts/1"
    );
    if (!response.ok) {
      // Reject the promise if the response is not ok
      throw new Error(
        `Request failed with status ${response.status} ${response.statusText}`
      );
    }
    const data = (await response.json()) as FooResponse;
    return { data, rawResponse: response };
  });
}

export type FooResponse = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

(async () => {
  await exampleUsage();
  await exampleUsageWithRawResponse();
  await stillLegalExampleUsage();
})();

// this is fine
async function exampleUsage(): Promise<void> {
  const data = await getFoo();
  console.log("Data:", data);
}

// this is not fine
// The return type of an async function or method must be the global Promise<T> type. Did you mean to write 'Promise<FooResponse>'?ts(1064)
// This is just a TypeScript thing...
// async function illegalExampleUsage(): FetchWithRawPromise<FooResponse> {
//   return await getFoo();
// }

// this is fine
async function stillLegalExampleUsage(): Promise<FooResponse> {
  return await getFoo();
}

// this is fine
async function exampleUsageWithRawResponse(): Promise<void> {
  const { data, rawResponse } = await getFoo().withRawResponse();
  console.log("Data:", data);
  console.log("Raw Response Status:", rawResponse.status);
}
