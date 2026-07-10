import { ALLOWED_CRM_STATUS, ALLOWED_DATA_SOURCE } from "../constants/crm.js";

// Agar AI ne koi invalid crm_status bhej diya (jo allowed list mein nahi hai),
// to use khali kar dete hain — assignment ke rule ke mutabik
export function sanitizeCrmStatus(value) {
  if (!value) return "";
  return ALLOWED_CRM_STATUS.includes(value) ? value : "";
}

// Same logic data_source ke liye
export function sanitizeDataSource(value) {
  if (!value) return "";
  return ALLOWED_DATA_SOURCE.includes(value) ? value : "";
}

// Ek record ko poore CRM schema ke against sanitize karta hai (safety net)
export function sanitizeCrmRecord(record) {
  return {
    ...record,
    crm_status: sanitizeCrmStatus(record.crm_status),
    data_source: sanitizeDataSource(record.data_source),
  };
}

// Rule 7: record ke paas email YA mobile mein se kam se kam ek hona chahiye
export function hasContactInfo(record) {
  const email = (record.email || "").trim();
  const mobile = (record.mobile_without_country_code || "").trim();
  return email.length > 0 || mobile.length > 0;
}
