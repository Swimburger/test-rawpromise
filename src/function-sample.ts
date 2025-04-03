interface ResponseWithRaw<T> {
  data: T;
  rawResponse: Response;
}

export type FooResponse = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

class FooFetcher {
  getFoo = Object.assign(
    async (): Promise<FooResponse> => {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");
      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status} ${response.statusText}`
        );
      }
      const data = (await response.json()) as FooResponse;
      return data;
    },
    {
      withRawResponse: async (): Promise<ResponseWithRaw<FooResponse>> => {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");
        if (!response.ok) {
          throw new Error(
            `Request failed with status ${response.status} ${response.statusText}`
          );
        }
        const data = (await response.json()) as FooResponse;
        return { data, rawResponse: response };
      },
    }
  );
}

// Usage
(async () => {
  const fooFetcher = new FooFetcher();

  // Fetch parsed response
  const data = await fooFetcher.getFoo();
  console.log("Data:", data);

  // Fetch parsed response with raw response
  const { data: parsedData, rawResponse } = await fooFetcher.getFoo.withRawResponse();
  console.log("Parsed Data:", parsedData);
  console.log("Raw Response Status:", rawResponse.status);
})();
