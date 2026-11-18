import { startJarvisServer } from "./transport/http/server.js";

const JarvisApp = async (): Promise<void> => {
  await startJarvisServer();
};

export default JarvisApp;
