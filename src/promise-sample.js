var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export var ResponseWithRaw;
(function (ResponseWithRaw) {
    /**
     * A type guard to check if an object is of type ResponseWithRaw<T>
     */
    function is(obj) {
        return (typeof obj === "object" &&
            obj !== null &&
            "data" in obj &&
            "rawResponse" in obj &&
            obj.rawResponse instanceof Response);
    }
    ResponseWithRaw.is = is;
})(ResponseWithRaw || (ResponseWithRaw = {}));
export class FetchWithRawPromise {
    constructor(promise) {
        this.innerPromise = promise;
    }
    static fromFunction(fn, ...args) {
        return new FetchWithRawPromise(fn(...args));
    }
    static fromPromise(promise) {
        return new FetchWithRawPromise(promise);
    }
    static fromExecutor(executor) {
        const promise = new Promise(executor);
        return new FetchWithRawPromise(promise);
    }
    static fromResult(result) {
        // Create a resolved promise with the given result
        const promise = Promise.resolve(result);
        return new FetchWithRawPromise(promise);
    }
    then(onfulfilled, onrejected) {
        return this.innerPromise.then(onfulfilled ? ({ data }) => onfulfilled === null || onfulfilled === void 0 ? void 0 : onfulfilled(data) : undefined, onrejected);
    }
    catch(onrejected) {
        return this.innerPromise.catch(onrejected).then((result) => {
            if (ResponseWithRaw.is(result)) {
                return result.data;
            }
            // If the result is not of type ResponseWithRaw<T>, return it as-is
            return result;
        });
    }
    finally(onfinally) {
        return this.innerPromise.finally(onfinally).then(({ data }) => data);
    }
    withRawResponse() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.innerPromise;
        });
    }
}
export function getFoo() {
    return FetchWithRawPromise.fromFunction(() => __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("https://jsonplaceholder.typicode.com/posts/1");
        if (!response.ok) {
            // Reject the promise if the response is not ok
            throw new Error(`Request failed with status ${response.status} ${response.statusText}`);
        }
        const data = (yield response.json());
        return { data, rawResponse: response };
    }));
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield exampleUsage();
    yield exampleUsageWithRawResponse();
    yield stillLegalExampleUsage();
}))();
// this is fine
function exampleUsage() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield getFoo();
        console.log("Data:", data);
    });
}
// this is not fine
// The return type of an async function or method must be the global Promise<T> type. Did you mean to write 'Promise<FooResponse>'?ts(1064)
// This is just a TypeScript thing...
// async function illegalExampleUsage(): FetchWithRawPromise<FooResponse> {
//   return await getFoo();
// }
// this is fine
function stillLegalExampleUsage() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield getFoo();
    });
}
// this is fine
function exampleUsageWithRawResponse() {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, rawResponse } = yield getFoo().withRawResponse();
        console.log("Data:", data);
        console.log("Raw Response Status:", rawResponse.status);
    });
}
