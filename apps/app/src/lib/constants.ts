// import { MODELS, ModelStatus } from "@kono/models";
// export const AVAILABLE_MODELS = Object.freeze(Object.fromEntries(
//   Object.entries(MODELS).filter(
//     ([_, model]) => model.status !== ModelStatus.Depr
//   )
// ) as typeof MODELS);

export {
  MODELS as AVAILABLE_MODELS,
  DEFAULT_MODEL,
  type ModelId,
} from "@kono/models";
