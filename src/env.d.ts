declare namespace NodeJS {
  interface Process {
    env: ProcessEnv & {
      GITHUB_WEBHOOK_ALGORITHM: 'sha1' | 'sha256';
    }
  }
}
