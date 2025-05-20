import { Type } from "@sinclair/typebox";

export enum ModelStatus {
  Active = "active",
  Beta = "beta",
  Deprecated = "deprecated",
}
export const modelStatusSchema = Type.Enum(ModelStatus, { default: ModelStatus.Active });
