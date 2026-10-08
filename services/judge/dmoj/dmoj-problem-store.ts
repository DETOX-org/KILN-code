import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import type { DmojProblemDefinition } from "./dmoj-types.js";

const DEFAULT_ROOT = "/dmoj-problems";

function getRoot(): string {
  return process.env.DMOJ_PROBLEM_ROOT ?? DEFAULT_ROOT;
}

function validateProblemId(problemId: string): void {
  if (!/^[A-Za-z0-9._-]+$/.test(problemId)) {
    throw new Error(`Invalid DMOJ problem id: ${problemId}`);
  }
}

function resolveSafePath(root: string, relativePath: string): string {
  if (!relativePath || path.isAbsolute(relativePath)) {
    throw new Error("DMOJ problem file path must be relative");
  }

  const problemPath = path.resolve(root, relativePath);
  const relative = path.relative(root, problemPath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("DMOJ problem file path escapes problem directory");
  }

  return problemPath;
}

export async function createDmojProblem(
  definition: DmojProblemDefinition
): Promise<string> {
  validateProblemId(definition.problemId);

  const root = getRoot();
  const problemDir = path.join(root, definition.problemId);

  await mkdir(problemDir, {
    recursive: true
  });

  await writeFile(
    path.join(problemDir, "init.yml"),
    definition.initYml,
    "utf8"
  );

  for (const [relativePath, contents] of Object.entries(
    definition.files
  )) {
    const target = resolveSafePath(
      problemDir,
      relativePath
    );

    await mkdir(path.dirname(target), {
      recursive: true
    });

    await writeFile(target, contents);
  }

  return problemDir;
}

export async function removeDmojProblem(
  problemId: string
): Promise<void> {
  validateProblemId(problemId);

  await rm(
    path.join(getRoot(), problemId),
    {
      recursive: true,
      force: true
    }
  );
}

export function getDmojProblemRoot(): string {
  return getRoot();
}
