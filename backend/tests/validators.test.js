import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeCrmStatus,
  sanitizeDataSource,
  sanitizeCrmRecord,
  hasContactInfo,
} from "../src/utils/validators.js";

describe("sanitizeCrmStatus", () => {
  test("valid status ko waisa hi rehne deta hai", () => {
    assert.equal(sanitizeCrmStatus("GOOD_LEAD_FOLLOW_UP"), "GOOD_LEAD_FOLLOW_UP");
  });

  test("invalid status ko khali kar deta hai", () => {
    assert.equal(sanitizeCrmStatus("RANDOM_STATUS"), "");
  });

  test("khali/undefined value ko khali hi rakhta hai", () => {
    assert.equal(sanitizeCrmStatus(""), "");
    assert.equal(sanitizeCrmStatus(undefined), "");
  });
});

describe("sanitizeDataSource", () => {
  test("valid data_source ko waisa hi rehne deta hai", () => {
    assert.equal(sanitizeDataSource("meridian_tower"), "meridian_tower");
  });

  test("invalid data_source ko khali kar deta hai", () => {
    assert.equal(sanitizeDataSource("kuch_bhi"), "");
  });
});

describe("sanitizeCrmRecord", () => {
  test("poore record ko sanitize karta hai, baaki fields chhedta nahi", () => {
    const record = {
      name: "John",
      crm_status: "INVALID_STATUS",
      data_source: "eden_park",
    };

    const result = sanitizeCrmRecord(record);

    assert.equal(result.name, "John");
    assert.equal(result.crm_status, "");
    assert.equal(result.data_source, "eden_park");
  });
});

describe("hasContactInfo", () => {
  test("email hone par true deta hai", () => {
    assert.equal(hasContactInfo({ email: "a@b.com", mobile_without_country_code: "" }), true);
  });

  test("mobile hone par true deta hai", () => {
    assert.equal(hasContactInfo({ email: "", mobile_without_country_code: "9876543210" }), true);
  });

  test("dono hone par bhi true deta hai", () => {
    assert.equal(hasContactInfo({ email: "a@b.com", mobile_without_country_code: "9876543210" }), true);
  });

  test("dono na hone par false deta hai", () => {
    assert.equal(hasContactInfo({ email: "", mobile_without_country_code: "" }), false);
  });

  test("sirf whitespace hone par bhi false deta hai", () => {
    assert.equal(hasContactInfo({ email: "   ", mobile_without_country_code: "  " }), false);
  });
});
