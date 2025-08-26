import RepoFlowClient from "./clients/RepoFlowClient";
import envConfig from "./config/envConfig";
import { SyncService } from "./services/SyncService";
import AsciiArtManager from "./utils/AsciiArtManager";
import Logger from "./utils/Logger";
import RepoFlowVersionManager from "./utils/RepoFlowVersionManager";

const SetupServer = async (): Promise<void> => {
  try {
    await AsciiArtManager.printPlatformName();

    const repoflowVersion =
      await RepoFlowVersionManager.getCurrentRepoFlowVersion();
    console.log(`RepoFlow Sync Version: ${repoflowVersion}`);
    console.log(`Process ID: ${process.pid}`);

    let isInShutdown = false;

    const mainClient = new RepoFlowClient(
      envConfig.MAIN_INSTANCE_URL,
      envConfig.MAIN_INSTANCE_USERNAME,
      envConfig.MAIN_INSTANCE_PASSWORD,
      "MAIN"
    );

    const targetInstances: string[] = envConfig.TARGET_INSTANCES.split(",")
      .map((name) => name.trim())
      .filter((name) => name !== "");
    const targetClients = targetInstances.map(
      (name) =>
        new RepoFlowClient(
          process.env[`${name.toUpperCase()}_URL`]!,
          process.env[`${name.toUpperCase()}_USERNAME`]!,
          process.env[`${name.toUpperCase()}_PASSWORD`]!,
          name
        )
    );

    const syncService = new SyncService(mainClient, targetClients);

    syncService.runSync();

    const shutdown = async (): Promise<void> => {
      if (isInShutdown) {
        return;
      } else {
        isInShutdown = true;
      }
      isInShutdown = true;
      Logger.info("Shutdown initiated...");
      const forceShutdown = setTimeout(() => {
        Logger.error(
          "Forced shutdown: Server did not terminate within 10 seconds."
        );
        process.exit(1);
      }, 10 * 1000);

      try {
        Logger.info("Server shut down cleanly.");
        clearTimeout(forceShutdown);
        process.exit(0);
      } catch (error) {
        console.error(`Error during shutdown: ${error}`);
        process.exit(1);
      }
    };

    process.on("SIGTERM", () => {
      Logger.info("SIGTERM received. Shutting down...");
      shutdown();
    });
    process.on("SIGINT", () => {
      Logger.info("SIGINT received. Shutting down...");
      shutdown();
    });
  } catch (error) {
    console.log(`Error while setting up server: ${error}`);
    console.log(error);
    process.exit(1);
  }
};

SetupServer();

process.on("uncaughtException", (error) => {
  console.log("uncaughtException");
  console.error("Error message:", error.message); // Log error message
  console.error("Stack trace:\n", error.stack); // Log the stack trace
  process.exit(1);
});
