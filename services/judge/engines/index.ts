import { PistonEngine } from "./piston-engine.js";
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

type EngineName = "piston";

const LANGUAGE_ROUTING: Record<string, EngineName> = {
  python: "piston",
  c: "piston",
  cpp: "piston",
  java: "piston",
  javascript: "piston",
  typescript: "piston",
  go: "piston",
  rust: "piston",
  csharp: "piston",
  kotlin: "piston",
  sql: "piston"
};

const engines: Record<EngineName, JudgeEngine> = {
  piston: new PistonEngine()
};

const engineHealth: Record<EngineName, boolean> = {
  piston: false
};

export function createJudgeEngine(
  language?: string
): JudgeEngine {
  const engineName =
    language !== undefined
      ? LANGUAGE_ROUTING[language]
      : "piston";

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

export async function checkJudgeEngineHealth(): Promise<boolean> {
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
  engineName: EngineName = "piston"
): boolean {
  return engineHealth[engineName];
}