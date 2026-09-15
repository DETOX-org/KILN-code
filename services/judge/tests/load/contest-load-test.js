const Redis = require("ioredis");

const redis = new Redis(
  process.env.REDIS_URL ?? "redis://localhost:6379"
);

const QUEUE_KEY = "judge:queue";

const SUBMISSION_COUNT = 1000;

const submissions = [
  {
    language: "python",
    code: "a, b = map(int, input().split())\nprint(a + b)"
  },
  {
    language: "javascript",
    code: "const [a, b] = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\nconsole.log(a + b);"
  },
  {
    language: "typescript",
    code: "const fs = require('fs');\nconst [a, b] = fs.readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);\nconsole.log(a + b);"
  },
  {
    language: "c",
    code: "#include <stdio.h>\nint main(){int a,b;scanf(\"%d%d\",&a,&b);printf(\"%d\\n\",a+b);return 0;}"
  },
  {
    language: "cpp",
    code: "#include <iostream>\nusing namespace std;\nint main(){int a,b;cin>>a>>b;cout<<a+b<<'\\n';}"
  },
  {
    language: "java",
    code: "import java.util.*;\nclass Main{public static void main(String[] a){Scanner s=new Scanner(System.in);System.out.println(s.nextInt()+s.nextInt());}}"
  },
  {
    language: "go",
    code: "package main\nimport \"fmt\"\nfunc main(){var a,b int;fmt.Scan(&a,&b);fmt.Println(a+b)}"
  },
  {
    language: "rust",
    code: "use std::io::{self, Read};\nfn main(){let mut s=String::new();io::stdin().read_to_string(&mut s).unwrap();let mut i=s.split_whitespace().map(|x|x.parse::<i32>().unwrap());println!(\"{}\",i.next().unwrap()+i.next().unwrap());}"
  },
  {
    language: "csharp",
    code: "using System;\nclass Program{static void Main(){var x=Console.ReadLine().Split();Console.WriteLine(int.Parse(x[0])+int.Parse(x[1]));}}"
  },
  {
    language: "kotlin",
    code: "fun main(){val x=readLine()!!.trim().split(\" \").map{it.toInt()};println(x[0]+x[1])}"
  }
];

async function main() {
  const judgeKeys = await redis.keys("judge:*");

  if (judgeKeys.length > 0) {
    await redis.del(...judgeKeys);
  }

  const jobs = [];

  for (let i = 0; i < SUBMISSION_COUNT; i++) {
    const submission = submissions[i % submissions.length];

    jobs.push({
      jobId: `contest-load-${Date.now()}-${i}`,
      language: submission.language,
      code: submission.code,
      tests: [
        {
          input: "20 22",
          expectedOutput: "42",
          visibility: "public"
        }
      ],
      attempt: 0
    });
  }

  const pipeline = redis.pipeline();

  for (const job of jobs) {
    pipeline.rpush(
      QUEUE_KEY,
      JSON.stringify(job)
    );
  }

  await pipeline.exec();

  console.log(
    `Queued ${SUBMISSION_COUNT} contest submissions`
  );

  await redis.quit();
}

main().catch(async (error) => {
  console.error(error);
  await redis.quit();
  process.exit(1);
});