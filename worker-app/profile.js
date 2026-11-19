/*
 * Profile page data.
 *
 * SAMPLE PROFILE: there's no sign-in yet, so the worker is hard-coded.
 * Their reports come from the database (GET /api/reports?reporter=NAME);
 * sample reports for this name are in db/seed.sql.
 *
 * INTEGRATION POINT: replace with the signed-in user's profile.
 */

/* eslint-disable no-unused-vars */

const SAMPLE_PROFILE = {
  name: "Jordan Reyes",
  role: "Carpenter Foreman",
  company: "Layton Construction",
  homeJob: "JOB-001",
  memberSince: "2024-01",
};
