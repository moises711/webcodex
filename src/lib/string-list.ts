export function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function projectLists<T extends { tags: unknown; techStack: unknown }>(
  project: T,
) {
  return {
    ...project,
    tags: stringList(project.tags),
    techStack: stringList(project.techStack),
  };
}
