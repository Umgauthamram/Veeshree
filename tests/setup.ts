import { beforeEach } from "vitest";
import { logger } from "../src/utils/logger.js";

beforeEach(() => {
  logger.setJson(false);
  logger.setQuiet(false);
  logger.setLevel("info");
});
