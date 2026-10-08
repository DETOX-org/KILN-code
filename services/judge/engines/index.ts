import { Judge0Adapter } from "./judge0-adapter.js";
import { DmojEngine } from "./dmoj-engine.js";
import type {
  EngineRequest,
  EngineResult,
  JudgeEngine
} from "./engine.js";

export type {
  EngineRequest,
  EngineResult,
  JudgeEngine
} from "./engine.js";

type EngineName = "dmoj" | "judge0";

const LANGUAGE_ROUTING: Record<string, EngineName> = {
  python: "judge0",
  c: "judge0",
  cpp: "judge0",
  java: "judge0",
  javascript: "judge0",
  typescript: "judge0",
  sql: "judge0",
  go: "dmoj",
  rust: "dmoj",
  csharp: "dmoj",
  kotlin: "dmoj",
  embedded_c: "dmoj"
};

export const DMOJ_LANGUAGES = new Set([
  "go",
  "rust",
  "csharp",
  "kotlin",
  "embedded_c"
]);

export const JUDGE0_LANGUAGES = new Set([
  "python",
  "c",
  "cpp",
  "java",
  "javascript",
  "typescript",
  "sql"
]);

export function supportsDmoj(language: string): boolean {
  return DMOJ_LANGUAGES.has(language);
}

export function supportsJudge0(language: string): boolean {
  return JUDGE0_LANGUAGES.has(language);
}

export function createDmojEngine(language: string): JudgeEngine {
  if (!supportsDmoj(language)) {
    throw new Error(
      `DMOJ does not support language: ${language}`
    );
  }

  return engines.dmoj;
}

export function createJudge0Engine(language: string): JudgeEngine {
  if (!supportsJudge0(language)) {
    throw new Error(
      `Judge0 does not support language: ${language}`
    );
  }

  return engines.judge0;
}

const engines: Record<EngineName, JudgeEngine> = {
  dmoj: new DmojEngine(),
  judge0: new Judge0Adapter()
};

const engineHealth: Record<EngineName, boolean> = {
  dmoj: false,
  judge0: false
};

export function createJudgeEngine(language: string): JudgeEngine {
  const engineName = LANGUAGE_ROUTING[language];

  if (!engineName) {
    throw new Error(
      `No execution engine configured for language: ${language}`
    );
  }

  if (!engineHealth[engineName]) {
    throw new Error(
      `Execution engine is unhealthy: ${engineName}`
    );
  }

  return engines[engineName];
}

export async function checkJudgeEngineHealth(engineName?: EngineName): Promise<boolean> {
  if (engineName) {
    const healthy = await engines[engineName].healthcheck();
    engineHealth[engineName] = healthy;
    return healthy;
  }

  let allHealthy = true;

  for (const [name, engine] of Object.entries(engines)) {
    const healthy = await engine.healthcheck();

    engineHealth[name as EngineName] = healthy;

    if (!healthy) {
      allHealthy = false;
    }
  }

  return allHealthy;
}

export function isJudgeEngineHealthy(
  engineName: EngineName
): boolean {
  return engineHealth[engineName];
}
