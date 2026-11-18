import type { TicketClassification } from "../llm/schema.type.js";

export interface ClasifierTicket{
    classification:TicketClassification,
    message:string,
    userPlan:"free" | "pro"
}