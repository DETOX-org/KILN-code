const http = require("http");
const body = JSON.stringify({
  problemId: "helloworld",
  language: "rust",
  code: 'fn main() { print!("Hello, World!"); }',
  expectedOutput: "Hello, World!"
});
const req = http.request(
  { host: "localhost", port: 3002, path: "/jobs", method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
  (res) => { let data = ""; res.on("data", c => data += c); res.on("end", () => console.log(data)); }
);
req.write(body);
req.end();
