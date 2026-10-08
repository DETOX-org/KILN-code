const http = require("http");
const jobId = process.argv[2];

function poll() {
  http.get(
    { host: "localhost", port: 3002, path: `/jobs/${encodeURIComponent(jobId)}` },
    (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        console.log(data);
        const parsed = JSON.parse(data);
        if (!parsed.finished) {
          setTimeout(poll, 500);
        }
      });
    }
  );
}

poll();
