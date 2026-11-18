import { StringOutputParser } from "@langchain/core/output_parsers";
import { modelGoogle } from "../../../core/models/index.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { DocInput } from "../types/index.js";


const nodellmText = modelGoogle.pipe(new StringOutputParser());

export const chatNode = (prompt:string) => ChatPromptTemplate.fromTemplate<DocInput>(prompt).pipe(nodellmText);
