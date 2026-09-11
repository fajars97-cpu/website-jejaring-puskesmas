import test from "node:test";
import assert from "node:assert/strict";
import { isRecoveryUrl, recoveryDestination } from "../src/lib/recovery.js";

test("recognizes recovery callbacks without treating ordinary routes as recovery", () => {
  assert.equal(isRecoveryUrl("https://example.test/app/?recovery=1#access_token=example&type=recovery"), true);
  assert.equal(isRecoveryUrl("https://example.test/app/#access_token=example&type=recovery"), true);
  assert.equal(isRecoveryUrl("https://example.test/app/#/jejaring"), false);
  assert.equal(isRecoveryUrl("https://example.test/app/#access_token=example&type=signup"), false);
});

test("restores the reset route under a deployment subdirectory without retaining tokens", () => {
  assert.equal(recoveryDestination("https://example.test/website-jejaring-puskesmas/?recovery=1#access_token=example&refresh_token=example&type=recovery"),
    "/website-jejaring-puskesmas/#/reset-password");
});

test("failed callbacks still reach reset page after clearing the error fragment", () => {
  assert.equal(recoveryDestination("https://example.test/?recovery=1#error=access_denied&error_code=otp_expired"), "/#/reset-password");
});
