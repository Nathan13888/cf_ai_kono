import { Type } from "@sinclair/typebox";

export enum UploadType {
    Text = "text",
    Image = "image",
    PDF = "pdf",
    Audio = "audio",
    Video = "video",
    // TODO: other multi-modal types?
}
export const uploadIdSchema = Type.String({ format: "uuid" });
export const uploadType = Type.Enum(UploadType);

export const uploadImagesSchema = Type.Object({
    id: uploadIdSchema,
    name: Type.String(),
    type: uploadType,
});
