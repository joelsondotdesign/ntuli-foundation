import { test } from "node:test";
import assert from "node:assert/strict";
import { parseInstagram } from "./instagram.ts";

test("a reel URL is accepted and returned unchanged", () => {
  assert.equal(
    parseInstagram("https://www.instagram.com/reel/C1a2b3c4d5e/"),
    "https://www.instagram.com/reel/C1a2b3c4d5e/",
  );
});

test("an address without a scheme is normalised to https, not left relative", () => {
  assert.equal(
    parseInstagram("instagram.com/reel/C1a2b3c4d5e/"),
    "https://instagram.com/reel/C1a2b3c4d5e/",
  );
});

test("http is upgraded to https", () => {
  assert.equal(parseInstagram("http://instagram.com/p/abc/"), "https://instagram.com/p/abc/");
});

test("a profile URL is accepted", () => {
  assert.equal(parseInstagram("https://instagram.com/ntulifoundation"), "https://instagram.com/ntulifoundation");
});

test("surrounding whitespace is tolerated", () => {
  assert.equal(parseInstagram("  https://instagram.com/p/abc/  "), "https://instagram.com/p/abc/");
});

test("a non-Instagram address is rejected", () => {
  assert.equal(parseInstagram("https://www.youtube.com/watch?v=EQwz7M7ZlqM"), null);
  assert.equal(parseInstagram("https://vimeo.com/12345"), null);
});

test("a lookalike host is not mistaken for Instagram", () => {
  assert.equal(parseInstagram("https://instagram.com.evil.example/p/abc/"), null);
  assert.equal(parseInstagram("https://notinstagram.com/p/abc/"), null);
});

test("rubbish returns null", () => {
  assert.equal(parseInstagram("not a url"), null);
  assert.equal(parseInstagram(""), null);
});
