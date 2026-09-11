FROM ubuntu:24.04

WORKDIR /judge

RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    nodejs \
    npm \
    gcc \
    g++ \
    openjdk-21-jdk \
    && rm -rf /var/lib/apt/lists/*