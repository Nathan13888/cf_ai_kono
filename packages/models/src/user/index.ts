import { type Static, Type } from "@sinclair/typebox";

// TODO: currently just a non-empty string but should be uuid
export const userIdSchema = Type.String({
    minLength: 1,
});
export type UserId = Static<typeof userIdSchema>;

export const userSchema = Type.Object({
    /** User ID */
    id: userIdSchema,
    // TODO: add more fields
});
export type User = Static<typeof userSchema>;

/**
 * Public user profile
 */
export const profileSchema = Type.Object({
    /** Name */
    name: Type.Optional(Type.String()),
});
export type Profile = Static<typeof profileSchema>;
