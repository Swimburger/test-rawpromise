var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class FooFetcher {
    constructor() {
        this.getFoo = Object.assign(() => __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch("https://jsonplaceholder.typicode.com/posts/1");
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status} ${response.statusText}`);
            }
            const data = (yield response.json());
            return data;
        }), {
            withRawResponse: () => __awaiter(this, void 0, void 0, function* () {
                const response = yield fetch("https://jsonplaceholder.typicode.com/posts/1");
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status} ${response.statusText}`);
                }
                const data = (yield response.json());
                return { data, rawResponse: response };
            }),
        });
    }
}
// Usage
(() => __awaiter(void 0, void 0, void 0, function* () {
    const fooFetcher = new FooFetcher();
    // Fetch parsed response
    const data = yield fooFetcher.getFoo();
    console.log("Data:", data);
    // Fetch parsed response with raw response
    const { data: parsedData, rawResponse } = yield fooFetcher.getFoo.withRawResponse();
    console.log("Parsed Data:", parsedData);
    console.log("Raw Response Status:", rawResponse.status);
}))();
export {};
