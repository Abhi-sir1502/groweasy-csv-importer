import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { rowsToObjects, chunkArray } from "../src/utils/csvUtils.js";

describe("rowsToObjects", () => {
  test("headers ko keys aur row values ko sahi se map karta hai", () => {
    const headers = ["name", "email"];
    const rows = [["John Doe", "john@example.com"]];

    const result = rowsToObjects(headers, rows);

    assert.deepEqual(result, [{ name: "John Doe", email: "john@example.com" }]);
  });

  test("missing values ko empty string se bharta hai", () => {
    const headers = ["name", "email", "city"];
    const rows = [["John Doe", "john@example.com"]]; // city missing

    const result = rowsToObjects(headers, rows);

    assert.equal(result[0].city, "");
  });

  test("multiple rows ko sahi se handle karta hai", () => {
    const headers = ["name"];
    const rows = [["A"], ["B"], ["C"]];

    const result = rowsToObjects(headers, rows);

    assert.equal(result.length, 3);
    assert.equal(result[1].name, "B");
  });

  test("empty rows array ke liye empty array return karta hai", () => {
    const result = rowsToObjects(["name"], []);
    assert.deepEqual(result, []);
  });
});

describe("chunkArray", () => {
  test("array ko sahi size ke chunks mein todta hai", () => {
    const arr = [1, 2, 3, 4, 5];
    const result = chunkArray(arr, 2);

    assert.deepEqual(result, [[1, 2], [3, 4], [5]]);
  });

  test("agar array size se chota hai to ek hi chunk banta hai", () => {
    const result = chunkArray([1, 2], 20);
    assert.deepEqual(result, [[1, 2]]);
  });

  test("empty array ke liye empty result deta hai", () => {
    const result = chunkArray([], 5);
    assert.deepEqual(result, []);
  });

  test("exact multiple size ke liye barabar chunks banata hai", () => {
    const result = chunkArray([1, 2, 3, 4], 2);
    assert.deepEqual(result, [[1, 2], [3, 4]]);
  });
});
