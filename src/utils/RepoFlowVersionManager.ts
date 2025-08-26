import FilesManager from "./FilesManager";
import Logger from "./Logger";

const RepoFlowVersionFilePath = "./repoflow-version.txt";

let currentRepoFlowVersion: string | null = null;

const getCurrentRepoFlowVersion = async (): Promise<string> => {
  try {
    if (currentRepoFlowVersion !== null) {
      return currentRepoFlowVersion;
    }

    const version: string = await FilesManager.readFile(
      RepoFlowVersionFilePath,
      "utf8"
    );
    currentRepoFlowVersion = version.trim();
    return currentRepoFlowVersion;
  } catch (error) {
    Logger.error(`Error while getting RepoFlow version: ${error}`);
    return "unknown";
  }
};

const RepoFlowVersionManager: {
  getCurrentRepoFlowVersion: () => Promise<string>;
} = {
  getCurrentRepoFlowVersion,
};

export default RepoFlowVersionManager;
