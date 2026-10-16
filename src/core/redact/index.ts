export * from "./patterns.js";
export * from "./denylist.js";
export * from "./redactor.js";

import { redactContent } from "./redactor.js";
import { isDenylistedFile } from "./denylist.js";

export const redactSensitiveText = redactContent;
export const isDenyListedPath = isDenylistedFile;
