// Import removed to avoid TS rootDir compilation error. Will use dynamic require.
export type SupportedLanguage = "python" | "javascript" | "typescript" | "cpp" | "c";

export interface TestCaseInput {
  id?: string;
  input: string;
  expectedOutput: string;
  isSample?: boolean;
  points?: number;
}

export interface TestCaseResult {
  id: string;
  orderIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  status: "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Runtime Error" | "Compilation Error" | "Judge Error";
  runtimeMs: number;
  memoryKb: number;
  isSample: boolean;
  error?: string;
}

export interface EvaluationResult {
  status: "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Runtime Error" | "Compilation Error" | "Judge Error";
  score: number;
  maxScore: number;
  passedTests: number;
  totalTests: number;
  runtimeMs: number;
  memoryKb: number;
  language: string;
  compilationError?: string;
  results: TestCaseResult[];
  logs: string[];
}

export function normalizeOutput(val: string): string {
  if (val === undefined || val === null) return "";
  let str = String(val).replace(/\r\n/g, "\n").trim();
  
  // Normalize JSON array representation: [0, 1] -> 0 1
  if (str.startsWith("[") && str.endsWith("]")) {
    try {
      const arr = JSON.parse(str);
      if (Array.isArray(arr)) {
        return arr.map(x => String(x).trim()).join(" ");
      }
    } catch {}
  }

  if (str.toLowerCase() === "true") return "true";
  if (str.toLowerCase() === "false") return "false";

  return str.split("\n").map(l => l.trim().split(/\s+/).join(" ")).join("\n");
}

export class CompilerService {
  public async evaluate(params: {
    language: string;
    sourceCode: string;
    testCases: TestCaseInput[];
    problemSlug?: string;
    timeLimitMs?: number;
    memoryLimitKb?: number;
  }): Promise<EvaluationResult> {
    const rawLang = (params.language || "python").toLowerCase();
    let lang: SupportedLanguage = "python";
    if (rawLang.includes("py")) lang = "python";
    else if (rawLang.includes("ts") || rawLang.includes("typescript")) lang = "typescript";
    else if (rawLang.includes("js") || rawLang.includes("node") || rawLang.includes("javascript")) lang = "javascript";
    else if (rawLang.includes("c++") || rawLang.includes("cpp")) lang = "cpp";
    else if (rawLang === "c") lang = "c";

    const logs: string[] = [];
    logs.push(`[JUDGE] Routing execution to engine for language: ${lang}`);

    const { createJudgeEngine } = require("../../../services/judge/engines/index.js");
    const engine = createJudgeEngine(lang);

    const testResults: TestCaseResult[] = [];
    let passedCount = 0;
    let totalScore = 0;
    let maxTotalScore = 0;
    let maxRuntime = 0;
    let maxMemory = 0;
    let overallStatus: EvaluationResult["status"] = "Accepted";

    for (let i = 0; i < params.testCases.length; i++) {
      const tc = params.testCases[i];
      const points = tc.points || Math.floor(100 / params.testCases.length);
      maxTotalScore += points;

      const engineJobId = await engine.submit({
        language: lang,
        code: params.sourceCode,
        input: tc.input
      });

      const caseExec = await engine.pollStatus(engineJobId);

      // Map EngineResult to our expected output format
      const isAccepted = caseExec.status === "Accepted";
      const runtimeMs = caseExec.timeMS ?? 0; // The EngineResult doesn't include runtime currently, but we can fake it or extract it if needed
      const memoryKb = caseExec.memoryKb ?? 0;

      maxRuntime = Math.max(maxRuntime, runtimeMs);
      maxMemory = Math.max(maxMemory, memoryKb);

      if (caseExec.status === "Time Limit Exceeded") {
        overallStatus = "Time Limit Exceeded";
        testResults.push({
          id: tc.id || `tc-${i + 1}`,
          orderIndex: i,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: caseExec.stdout,
          passed: false,
          status: "Time Limit Exceeded",
          runtimeMs: runtimeMs,
          memoryKb: memoryKb,
          isSample: !!tc.isSample,
          error: caseExec.stderr
        });
        logs.push(`Case ${i + 1}: TIME LIMIT EXCEEDED`);
        continue;
      }

      if (caseExec.status === "Runtime Error" || caseExec.status === "Compilation Error" || caseExec.status === "Judge Error") {
        overallStatus = caseExec.status;
        testResults.push({
          id: tc.id || `tc-${i + 1}`,
          orderIndex: i,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: caseExec.stdout,
          passed: false,
          status: caseExec.status,
          runtimeMs,
          memoryKb,
          isSample: !!tc.isSample,
          error: caseExec.stderr
        });
        logs.push(`Case ${i + 1}: ${caseExec.status} — ${caseExec.stderr}`);
        continue;
      }

      const normActual = normalizeOutput(caseExec.stdout);
      const normExpected = normalizeOutput(tc.expectedOutput);
      const passed = normActual === normExpected;

      if (passed) {
        passedCount++;
        totalScore += points;
        testResults.push({
          id: tc.id || `tc-${i + 1}`,
          orderIndex: i,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: caseExec.stdout,
          passed: true,
          status: "Accepted",
          runtimeMs,
          memoryKb,
          isSample: !!tc.isSample
        });
        logs.push(`Case ${i + 1}: PASSED — Output: "${normActual}"`);
      } else {
        if (overallStatus === "Accepted") overallStatus = "Wrong Answer";
        testResults.push({
          id: tc.id || `tc-${i + 1}`,
          orderIndex: i,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: caseExec.stdout,
          passed: false,
          status: "Wrong Answer",
          runtimeMs,
          memoryKb,
          isSample: !!tc.isSample,
          error: `Expected "${normExpected}", got "${normActual}"`
        });
        logs.push(`Case ${i + 1}: WRONG ANSWER — Expected: "${normExpected}", Got: "${normActual}"`);
      }
    }

    logs.push(`[VERDICT] ${overallStatus.toUpperCase()} — ${passedCount}/${params.testCases.length} tests passed (${totalScore}/${maxTotalScore} pts)`);

    return {
      status: overallStatus,
      score: totalScore,
      maxScore: maxTotalScore,
      passedTests: passedCount,
      totalTests: params.testCases.length,
      runtimeMs: maxRuntime,
      memoryKb: maxMemory,
      language: lang,
      results: testResults,
      logs
    };
  }
}

export const compilerService = new CompilerService();
