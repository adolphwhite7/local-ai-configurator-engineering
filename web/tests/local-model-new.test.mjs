import assert from "node:assert/strict";
import test from "node:test";
import { newlySeenModels, NEW_MODEL_WEEK, NEW_MODEL_IDS } from "../lib/local-model-new.ts";

test("New lasts one week from first exposure, not every return visit", () => {
  let value = null;
  const storage = { getItem: () => value, setItem: (_, next) => { value = next; } };
  const first = 1_800_000_000_000;
  assert.deepEqual(newlySeenModels(storage, first), NEW_MODEL_IDS);
  assert.deepEqual(newlySeenModels(storage, first + NEW_MODEL_WEEK - 1), NEW_MODEL_IDS);
  assert.deepEqual(newlySeenModels(storage, first + NEW_MODEL_WEEK), []);
  assert.equal(JSON.parse(value).qwen359, first);
  assert.deepEqual(newlySeenModels(storage, first + NEW_MODEL_WEEK * 3), []);
});

test("presentation storage failures and malformed records do not affect planning", () => {
  assert.deepEqual(newlySeenModels(null), []);
  assert.deepEqual(newlySeenModels({ getItem() { throw new Error("blocked"); }, setItem() {} }), []);
  assert.deepEqual(newlySeenModels({ getItem() { return null; }, setItem() { throw new Error("full"); } }), []);
  for (const initial of ["invalid", "null", "[]", '{"qwen359":"old"}', '{"qwen359":-1}', '{"qwen359":999999}']) {
    let value = initial;
    assert.deepEqual(newlySeenModels({ getItem: () => value, setItem: (_, next) => { value = next; } }, 1000), NEW_MODEL_IDS);
  }
});

test("new DeepSeek labels do not restart an existing model's expired label", () => {
  const now=1_800_000_000_000;
  let value=JSON.stringify({qwen359:now-NEW_MODEL_WEEK});
  const storage={getItem:()=>value,setItem:(_,next)=>{value=next;}};
  assert.deepEqual(newlySeenModels(storage,now),["r1full"]);
  assert.equal(JSON.parse(value).qwen359,now-NEW_MODEL_WEEK);
});
