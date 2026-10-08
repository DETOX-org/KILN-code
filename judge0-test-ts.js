const http = require("http");
const body = JSON.stringify({
  language: "typescript",
  code: 'const msg: string = "Hello, World!"; console.log(msg);',
  tests: [{ input: "", expectedOutput: "Hello, World!\n" }]
});
const req = http.request(
  { host: "localhost", port: 3001, path: "/execute", method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
  (res) => { let data = ""; res.on("data", c => data += c); res.on("end", () => console.log(data)); }
);
req.write(body);
req.end();
