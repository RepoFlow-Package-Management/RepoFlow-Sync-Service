type SourceRepository = { name: string };
type TargetRepository = { id: string; name: string };

export interface DiffResult {
  toCreate: string[];
  toDelete: Pick<TargetRepository, "id" | "name">[];
}

export class RepositoryService {
  static diffRepositories(
    sourceRepositories: SourceRepository[],
    targetRepositories: TargetRepository[],
    prefix: string
  ): DiffResult {
    const sourcePrefixedNames = new Set(
      sourceRepositories.map((r) => `${prefix}${r.name}`)
    );

    const targetNames = new Set(targetRepositories.map((r) => r.name));

    const toCreate: string[] = Array.from(sourcePrefixedNames).filter(
      (name) => !targetNames.has(name)
    );

    const toDelete: DiffResult["toDelete"] = targetRepositories
      .filter((r) => !sourcePrefixedNames.has(r.name))
      .map(({ id, name }) => ({ id, name }));

    return { toCreate, toDelete };
  }
}
