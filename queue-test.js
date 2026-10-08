const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL || "redis://redis:6379");
const jobId = "queue-test-" + Date.now();
const job = {
  jobId,
  language: "python",
  code: "print(2+2)",
  tests: [{ input: "", expectedOutput: "4\n" }]
};
(async () => {
  await redis.rpush("judge:queue", JSON.stringify(job));
  console.log("enqueued", jobId);
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const result = await redis.get(`judge:result:${jobId}`);
    if (result) {
      console.log(result);
      process.exit(0);
    }
  }
  console.log("timed out waiting for result");
  process.exit(1);
})();
