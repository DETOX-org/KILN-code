import subprocess
import sys

TIME_LIMIT = 2

try:
    result = subprocess.run(
        [sys.executable, sys.argv[1]],
        capture_output=True,
        text=True,
        timeout=TIME_LIMIT
    )

    print("exitCode:", result.returncode)
    print("stdout:", result.stdout)
    print("stderr:", result.stderr)

    sys.exit(result.returncode)

except subprocess.TimeoutExpired as exc:
    print("exitCode: 124")
    print("stdout:", exc.stdout or "")
    print("stderr: Time Limit Exceeded")
    sys.exit(124)
