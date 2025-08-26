import {
  RepoFlowClient,
  RepositorySummary,
  Workspace,
} from "../clients/RepoFlowClient";
import { WorkspaceService } from "./WorkspaceService";
import { DiffResult, RepositoryService } from "./RepositoryService";
import Logger from "../utils/Logger";
import envConfig from "../config/envConfig";
import { AxiosError } from "axios";
import { PackageType } from "../models/packages";
import { sleep } from "../utils/sleep";

export class SyncService {
  constructor(
    private mainClient: RepoFlowClient,
    private targetClients: RepoFlowClient[]
  ) {}

  async runSync(): Promise<void> {
    Logger.info("Starting sync cycle...");

    const mainWorkspaces = await this.mainClient.listWorkspaces();

    for (const targetClient of this.targetClients) {
      try {
        Logger.info(`Syncing target instance: ${targetClient.instanceName}`);

        const targetWorkspaces: Workspace[] =
          await targetClient.listWorkspaces();
        const workspaceDiff: {
          toCreate: { id: string; name: string }[];
          toDelete: { id: string; name: string }[];
        } = WorkspaceService.diffWorkspaces(mainWorkspaces, targetWorkspaces);

        // Sync workspaces
        for (const workspaceInfo of workspaceDiff.toCreate) {
          const workspaceId: string = await targetClient.createWorkspace(
            workspaceInfo.name
          );
          Logger.info(
            `Created workspace ${workspaceInfo.name} with ID ${workspaceId} on target instance ${targetClient.instanceName}`
          );
          targetWorkspaces.push({ id: workspaceId, name: workspaceInfo.name });
        }

        for (const workspaceInfo of workspaceDiff.toDelete) {
          await targetClient.deleteWorkspace(
            workspaceInfo.name,
            workspaceInfo.id
          );
        }

        // Wait a bit for the target instance to stabilize after workspace changes
        await sleep(500);

        // Sync repositories in each workspace
        for (const mainWorkspace of mainWorkspaces) {
          const mainRepos: RepositorySummary[] =
            await this.mainClient.listRepositories(mainWorkspace.id);

          const targetWorkspaceId: RepositorySummary["id"] | undefined =
            targetWorkspaces.find((w) => w.name === mainWorkspace.name)?.id;

          if (!targetWorkspaceId) {
            Logger.error(
              `No target workspace found for main workspace: ${mainWorkspace.name}, after it should have been created`
            );
            continue;
          }

          const targetRepos: RepositorySummary[] =
            await targetClient.listRepositories(targetWorkspaceId);

          const repoDiff: DiffResult = RepositoryService.diffRepositories(
            mainRepos,
            targetRepos,
            envConfig.REPO_NAME_PREFIX
          );

          for (const repoName of repoDiff.toCreate) {
            const originalRepoName = repoName.replace(
              envConfig.REPO_NAME_PREFIX,
              ""
            );

            const repo: RepositorySummary | undefined = mainRepos.find(
              (mainRepo) => mainRepo.name === originalRepoName
            );
            if (!repo) {
              continue;
            }

            let remoteUrl: string = `${envConfig.MAIN_INSTANCE_URL}/${repo.packageType}/${mainWorkspace.name}/${originalRepoName}`;

            if (repo.packageType === PackageType.UNIVERSAL) {
              remoteUrl = `${envConfig.MAIN_INSTANCE_URL}/${repo.packageType}/${mainWorkspace.name}/${originalRepoName}/{package-name}/{version}/{file}`;
            }
            if (repo.packageType === PackageType.DOCKER) {
              remoteUrl = `${envConfig.MAIN_INSTANCE_URL}/${mainWorkspace.name}/${originalRepoName}`;
            }

            const targetWorkspace: Workspace | undefined =
              targetWorkspaces.find((w) => w.name === mainWorkspace.name);

            if (!targetWorkspace) {
              continue;
            }

            await targetClient.createRemoteRepository(
              targetWorkspace.id,
              mainWorkspace.name,
              repoName,
              repo.packageType,
              remoteUrl,
              envConfig.MAIN_INSTANCE_USERNAME,
              envConfig.MAIN_INSTANCE_PASSWORD
            );
          }

          for (const repo of repoDiff.toDelete) {
            await targetClient.deleteRepository(repo.id);
          }
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          console.log(error.message, error.response?.data);
          console.log(error.stack);
        }
        // console.log(error);
      }
    }

    Logger.info("Sync cycle complete.");
  }
}
