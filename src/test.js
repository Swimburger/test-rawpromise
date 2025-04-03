import { getFoo } from "./promise-sample.js";

(async () => {
  await exampleUsage();
  await exampleUsageWithRawResponse();
  await stillLegalExampleUsage();
})();

// this is fine
async function exampleUsage() {
  const data = await getFoo();
  console.log("Data:", data);
}

// this is fine
async function stillLegalExampleUsage() {
  return await getFoo();
}

// this is fine
async function exampleUsageWithRawResponse() {
  const { data, rawResponse } = await getFoo().withRawResponse();
  console.log("Data:", data);
  console.log("Raw Response Status:", rawResponse.status);
}