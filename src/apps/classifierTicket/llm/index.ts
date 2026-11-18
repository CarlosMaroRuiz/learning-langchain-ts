import { StringOutputParser } from "@langchain/core/output_parsers";
import { modelGoogle } from "../../../core/models/index.js";
import { ClassificationSchema } from "./schema.type.js";

//WithStructure is used to return a typed output schema.
export const structureLlm = modelGoogle.withStructuredOutput(ClassificationSchema);

export const llmString = modelGoogle.pipe(new StringOutputParser()); 