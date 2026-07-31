/** Which OAuth providers are configured (server-readable env only). */
export function getEnabledOAuthProviders() {
  return {
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    github: Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET),
  }
}

export type EnabledOAuthProviders = ReturnType<typeof getEnabledOAuthProviders>
