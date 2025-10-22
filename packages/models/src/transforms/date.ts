import { FormatRegistry, Type } from "@sinclair/typebox";

// Register the 'date-time' format validator
// This is a simple ISO 8601 date-time validation
function isDateTime(value: string): boolean {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (!isoDateRegex.test(value)) {
        return false;
    }

    const date = new Date(value);
    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().startsWith(value.replace("Z", ""))
    );
}

// Register the format
FormatRegistry.Set("date-time", isDateTime);

// Create a reusable DateTimeString transform
export const DateTimeString = Type.Transform(
    Type.String({ format: "date-time" }),
)
    .Decode((value) => new Date(value))
    .Encode((value) => value.toISOString());

// Create a nullable DateTime transform for optional timestamps
export const NullableDateTimeString = Type.Transform(
    Type.Union([Type.String({ format: "date-time" }), Type.Null()]),
)
    .Decode((value) => (value ? new Date(value) : null))
    .Encode((value) => (value ? value.toISOString() : null));
