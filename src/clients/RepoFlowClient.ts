import axios, { AxiosInstance } from "axios";
import Logger from "../utils/Logger";
import { PackageType } from "../models/packages";

export type Workspace = { id: string; name: string };

export type RepositorySummary = {
  id: string;
  name: string;
  packageType: PackageType;
  repositoryType: string;
  status: string;
  workspaceId: string;
};

type CreateRemoteRepositoryRequest = {
  name: string;
  packageType: PackageType | string; // keep wide for compatibility
  remoteRepositoryUrl: string;
  isRemoteCacheEnabled: boolean;
  remoteRepositoryUsername?: string;
  remoteRepositoryPassword?: string;
};

type ManualTaskStartRequest = {
  type: "deleteRepository";
  additionalData: { repositoryId: string };
};

type CreateWorkspaceResponse = {
  workspaceId: string;
};

export class RepoFlowClient {
  private readonly axiosInstance: AxiosInstance;

  constructor(
    public readonly baseUrl: string,
    username: string,
    password: string,
    public readonly instanceName: string
  ) {
    if (!baseUrl) {
      throw new Error(`Missing baseUrl for instance ${instanceName}`);
    }
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      auth: { username, password },
      headers: { "Content-Type": "application/json" },
    });
  }

  async listWorkspaces(): Promise<Workspace[]> {
    const response = await this.axiosInstance.get<Workspace[]>("/workspace");
    return response.data;
  }

  async createWorkspace(workspaceName: string): Promise<string> {
    const { data } = await this.axiosInstance.post<CreateWorkspaceResponse>(
      "/workspace",
      { name: workspaceName }
    );
    Logger.info(`Created workspace '${workspaceName}' on ${this.instanceName}`);
    return data.workspaceId;
  }

  async deleteWorkspace(
    workspaceName: string,
    workspaceId: string
  ): Promise<void> {
    Logger.info(
      `Deleting workspace '${workspaceName}' on ${this.instanceName}...`
    );

    const maxRetries = 10;
    const retryDelayMs = 3000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const repos = await this.listRepositories(workspaceId);

      if (repos.length === 0) {
        Logger.info(
          `All repositories deleted. Deleting workspace '${workspaceName}'...`
        );
        await this.axiosInstance.delete("/workspace", {
          data: { workspaceName },
        });
        Logger.info(
          `Deleted workspace '${workspaceName}' on ${this.instanceName}`
        );
        return;
      }

      Logger.info(
        `Workspace '${workspaceName}' still has ${repos.length} repositories. Deleting them (attempt ${attempt}/${maxRetries})...`
      );

      for (const repo of repos) {
        Logger.info(
          `Deleting repository '${repo.name}' (ID: ${repo.id}) in workspace '${workspaceName}'...`
        );
        await this.deleteRepository(repo.id);
      }

      Logger.info(
        `Waiting ${
          retryDelayMs / 1000
        }s for repository deletions to complete...`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }

    Logger.warn(
      `WARNING: Workspace '${workspaceName}' still has repositories after ${maxRetries} attempts. Skipping delete.`
    );
  }

  // Repository APIs
  async listRepositories(workspaceId: string): Promise<RepositorySummary[]> {
    const response = await this.axiosInstance.get<RepositorySummary[]>(
      `/${workspaceId}/repositories`
    );
    return response.data;
  }

  async createRemoteRepository(
    workspaceId: string,
    workspaceName: string,
    repoName: string,
    packageType: PackageType | string, // keep signature compatible
    remoteUrl: string,
    remoteRepositoryUsername?: string,
    remoteRepositoryPassword?: string
  ): Promise<void> {
    Logger.info(
      `Creating remote repository '${repoName}' (-> ${remoteUrl}) in workspace '${workspaceName}' on ${this.instanceName}`
    );

    const requestBody: CreateRemoteRepositoryRequest = {
      name: repoName,
      packageType,
      remoteRepositoryUrl: remoteUrl,
      isRemoteCacheEnabled: true,
      ...(remoteRepositoryUsername &&
        remoteRepositoryPassword && {
          remoteRepositoryUsername,
          remoteRepositoryPassword,
        }),
    };

    await this.axiosInstance.post(
      `/${workspaceId}/repositories/remote`,
      requestBody
    );
    Logger.info(
      `Created remote repository '${repoName}' (-> ${remoteUrl}) in workspace '${workspaceName}' on ${this.instanceName}`
    );
  }

  async deleteRepository(repositoryId: string): Promise<void> {
    const body: ManualTaskStartRequest = {
      type: "deleteRepository",
      additionalData: { repositoryId },
    };
    await this.axiosInstance.post("/manualTask/start", body);
    Logger.info(
      `Started delete task for repository '${repositoryId}' on ${this.instanceName}`
    );
  }
}

export default RepoFlowClient;
