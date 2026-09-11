import { formatResult } from "../result-formatter.js";

const result = formatResult(0, "hello\n", "","hello");

console.log(JSON.stringify(result, null, 2));
