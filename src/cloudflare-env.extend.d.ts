export type B2Env = {
  B2_ENDPOINT?: string;
  B2_KEY_ID?: string;
  B2_APP_KEY?: string;
  B2_BUCKET_NAME?: string;
};

declare global {
  interface CloudflareEnv extends B2Env {}
}

export {};
