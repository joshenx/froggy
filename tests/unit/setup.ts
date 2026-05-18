import { afterEach } from "vitest";

afterEach(() => {
  delete process.env.FROGGY_MVP_STORE;
});
