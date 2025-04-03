interface ResponseWithRaw<T> {
  data: T;
  rawResponse: Response;
}

class FetchWithRawPromise<T> implements PromiseLike<T> {
  private innerPromise: Promise<ResponseWithRaw<T>>;

  constructor(
    executor: (
      resolve: (value: ResponseWithRaw<T>) => void,
      reject: (reason?: unknown) => void
    ) => void
  ) {
    this.innerPromise = new Promise<ResponseWithRaw<T>>(executor);
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.innerPromise.then(
      (result) =>
        onfulfilled
          ? onfulfilled(result.data)
          : (result.data as unknown as TResult1),
      onrejected
    );
  }

  async withRawResponse(): Promise<ResponseWithRaw<T>> {
    return await this.innerPromise;
  }
}

function getFoo(): FetchWithRawPromise<FooResponse> {
  return new FetchWithRawPromise<FooResponse>(async (resolve) => {
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
    return resolve({ data, rawResponse: response });
  });
}

type FooResponse = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

(async () => {
  await exampleUsage();
  await exampleUsageWithRawResponse();
})();

// this is fine
async function exampleUsage(): Promise<void> {
  const data = await getFoo();
  console.log("Data:", data);
}

// this is not fine
// The return type of an async function or method must be the global Promise<T> type. Did you mean to write 'Promise<FooResponse>'?ts(1064)
// This is just a TypeScript thing...
async function illegalExampleUsage(): FetchWithRawPromise<FooResponse> {
  return await getFoo();
}

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
