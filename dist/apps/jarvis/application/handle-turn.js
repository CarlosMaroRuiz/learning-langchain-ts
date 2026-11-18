import { JarvisAgent } from "../agent/assistant.js";
export class HandleJarvisTurn {
    agent = new JarvisAgent();
    async execute(userText, options = {}) {
        return this.agent.responder(userText, options);
    }
}
//# sourceMappingURL=handle-turn.js.map