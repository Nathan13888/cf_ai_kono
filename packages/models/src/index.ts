// Required for string formats with Typebox. See <https://github.com/sinclairzx81/typebox/discussions/853#discussioncomment-9252628>
import { FormatRegistry } from "@sinclair/typebox";
import Formats from "ajv-formats";
FormatRegistry.Set("email", (value) =>
    (Formats.get("email") as RegExp).test(value),
);
FormatRegistry.Set("uuid", (value) =>
    (Formats.get("uuid") as RegExp).test(value),
);

export * from "./chat";
export * from "./model";
export * from "./transforms/date";
export * from "./upload";
export * from "./user";
