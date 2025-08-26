import { Workspace } from "../clients/RepoFlowClient";

export class WorkspaceService {
  static diffWorkspaces(
    sourceWorkspaces: Workspace[],
    targetWorkspaces: Workspace[]
  ): {
    toCreate: Workspace[];
    toDelete: Workspace[];
  } {
    // Maps for quick lookup by name
    const sourceMap = new Map(sourceWorkspaces.map((w) => [w.name, w]));
    const targetMap = new Map(targetWorkspaces.map((w) => [w.name, w]));

    // Workspaces to create: in source, not in target
    const toCreate = Array.from(sourceMap.entries())
      .filter(([name]) => !targetMap.has(name))
      .map(([, workspace]) => workspace);

    // Workspaces to delete: in target, not in source
    const toDelete = Array.from(targetMap.entries())
      .filter(([name]) => !sourceMap.has(name))
      .map(([, workspace]) => workspace);

    return { toCreate, toDelete };
  }
}

export default WorkspaceService;
