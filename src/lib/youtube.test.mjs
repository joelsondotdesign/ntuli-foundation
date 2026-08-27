import { test } from "node:test";
import assert from "node:assert/strict";
import { parseYouTube } from "./youtube.ts";

test("plain watch URL", () => {
  assert.deepEqual(parseYouTube("https://www.youtube.com/watch?v=EQwz7M7ZlqM"), { id: "EQwz7M7ZlqM" });
});

test("watch URL with a start time in seconds — the Eating my Art case", () => {
  assert.deepEqual(parseYouTube("https://www.youtube.com/watch?v=EQwz7M7ZlqM&t=44s"), { id: "EQwz7M7ZlqM", start: 44 });
});

test("start time expressed as minutes and seconds", () => {
  assert.deepEqual(parseYouTube("https://www.youtube.com/watch?v=EQwz7M7ZlqM&t=1m30s"), { id: "EQwz7M7ZlqM", start: 90 });
});

test("youtu.be short link", () => {
  assert.deepEqual(parseYouTube("https://youtu.be/rj-FctAmgjk"), { id: "rj-FctAmgjk" });
});

test("an id beginning with a hyphen survives", () => {
  assert.deepEqual(parseYouTube("https://www.youtube.com/watch?v=-F5ePSm3HHc"), { id: "-F5ePSm3HHc" });
});

test("URL without a scheme", () => {
  assert.deepEqual(parseYouTube("youtube.com/watch?v=r_zSByDvknI"), { id: "r_zSByDvknI" });
});

test("a bare video id is accepted", () => {
  assert.deepEqual(parseYouTube("EQwz7M7ZlqM"), { id: "EQwz7M7ZlqM" });
});

test("rubbish returns null rather than a broken embed", () => {
  assert.equal(parseYouTube("https://vimeo.com/12345"), null);
  assert.equal(parseYouTube("not a url"), null);
  assert.equal(parseYouTube(""), null);
});
