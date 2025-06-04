import { Type, type Static } from "@sinclair/typebox";

export const userIdSchema = Type.String({ format: "uuid" });
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
})
export type Profile = Static<typeof profileSchema>;
