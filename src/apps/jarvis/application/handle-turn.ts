import { JarvisAgent, type JarvisAgentOptions, type JarvisTurn } from "../agent/assistant.js";

export type JarvisTurnResult = JarvisTurn;

export class HandleJarvisTurn {
  private readonly agent = new JarvisAgent();

  async execute(
    userText: string,
    options: JarvisAgentOptions = {}
  ): Promise<JarvisTurnResult> {
    return this.agent.responder(userText, options);
  }
}
