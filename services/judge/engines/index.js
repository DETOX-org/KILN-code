"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJudgeEngine = createJudgeEngine;
exports.checkJudgeEngineHealth = checkJudgeEngineHealth;
exports.isJudgeEngineHealthy = isJudgeEngineHealthy;
const piston_engine_js_1 = require("./piston-engine.js");
const LANGUAGE_ROUTING = {
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
const engines = {
    piston: new piston_engine_js_1.PistonEngine()
};
const engineHealth = {
    piston: false
};
function createJudgeEngine(language) {
    const engineName = language !== undefined
        ? LANGUAGE_ROUTING[language]
        : "piston";
    if (!engineName) {
        throw new Error(`No execution engine configured for language: ${language}`);
    }
    if (!engineHealth[engineName]) {
        throw new Error(`Execution engine is unhealthy: ${engineName}`);
    }
    return engines[engineName];
}
async function checkJudgeEngineHealth() {
    let allHealthy = true;
    for (const [name, engine] of Object.entries(engines)) {
        const healthy = await engine.healthcheck();
        engineHealth[name] = healthy;
        if (!healthy) {
            allHealthy = false;
        }
    }
    return allHealthy;
}
function isJudgeEngineHealthy(engineName = "piston") {
    return engineHealth[engineName];
}
//# sourceMappingURL=index.js.map