# Judge0 CE Self-Hosting & Sandbox Configuration Guide

## Overview

Judge0 CE uses [isolate](https://github.com/ioi/isolate) as its underlying sandboxing engine to run untrusted code securely. `isolate` relies on Linux kernel control groups (`cgroups`) and namespaces to restrict CPU, memory, process counts, and filesystem access.

---

## 1. Host Kernel & cgroup Requirements (cgroups v1 vs v2)

The most common point of failure when deploying Judge0 is host cgroup incompatibility:

### Linux Distributions with cgroup v2 by default (Ubuntu 22.04+, Debian 11+, Fedora 34+, RHEL 9+)
Judge0's isolate requires legacy cgroup v1 hierarchies or hybrid mode with memory and swap controllers enabled.

#### Required GRUB Configuration:
Edit `/etc/default/grub`:
```bash
GRUB_CMDLINE_LINUX="systemd.unified_cgroup_hierarchy=0 cgroup_enable=memory swapaccount=1"
```
After editing, update GRUB and reboot:
```bash
# On Ubuntu / Debian:
sudo update-grub
sudo reboot

# On CentOS / RHEL / Fedora:
sudo grub2-mkconfig -o /boot/grub2/grub.cfg
sudo reboot
```

#### Verifying cgroup Configuration:
Check that cgroup v1 controllers are active:
```bash
# Check memory controller:
cat /proc/cgroups | grep memory
# Expected: memory hierarchy > 0 and enabled == 1

# Check swap accounting:
cat /sys/fs/cgroup/memory/memory.memsw.limit_in_bytes
# Should return a valid number or max value, not "No such file or directory"
```

---

## 2. Docker Daemon Privileged Mode & Mounts

Because `isolate` creates new mount namespaces and manipulates cgroups, both `judge0-server` and `judge0-workers` containers require:
- `privileged: true`
- Access to host `/sys/fs/cgroup`

In `docker-compose.judge0.yml`:
```yaml
privileged: true
```

---

## 3. Deployment Steps

1. Navigate to `infrastructure/docker/judge0`:
   ```bash
   cd infrastructure/docker/judge0
   ```
2. Start Judge0 stack:
   ```bash
   docker compose -f docker-compose.judge0.yml up -d
   ```
3. Check health:
   ```bash
   curl -s http://localhost:2358/system_info | jq .
   curl -s http://localhost:2358/about | jq .
   ```
4. Verify isolate sandbox:
   ```bash
   docker exec -it infrastructure-judge0-workers-1 isolate --version
   ```

---

## 4. Pinned MVP Language Runtimes

The pinned runtime configurations are documented in:
`services/judge/runtimes/judge0/manifest.json`

| Language | Judge0 ID | Compiler / Interpreter | Pinned Version |
|---|---|---|---|
| C | 51 | GCC | 10.2.0 |
| C++ | 52 | GCC | 10.2.0 |
| Java | 91 | OpenJDK | 15.0.2 |
| Python | 92 | Python | 3.10.0 |
| JavaScript | 93 | Node.js | 18.15.0 |
| TypeScript | 94 | TypeScript | 5.0.3 |
