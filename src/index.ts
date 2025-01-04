import { customFetch } from "@auth/core"
import { OAuthConfig } from "@auth/core/providers"
import { Profile } from "@auth/core/types"

interface TachiProfile {
  id: number
  username: string
  usernameLowercase: string
  about: string
  socialMedia: {
    discord: string
    github: string
    steam: string
    twitch: string
    twitter: string
    youtube: string
  }
  status: string
  customBannerLocation: string
  customPfpLocation: string
  joinDate: number
  lastSeen: number
  authLevel: number
  badges: string[]
}

type TachiResponse<T> = {
  success: boolean
  description: string
  body: T
}

interface Config {
  clientId: string
  clientSecret: string
  /**
   * The base URL of the Tachi instance.
   */
  tachiUrl: string
  /**
   * The provider ID and name. Usually you would name these the name of the tachi instance.
   */
  provider?: {
    id: string
    name: string
  }
}

export function TachiProvider(config: Config): OAuthConfig<Profile> {
  const tachiUrl = config.tachiUrl.endsWith("/") ? config.tachiUrl.slice(0, -1) : config.tachiUrl

  return {
    async [customFetch](...args) {
      const urlObj = new URL(args[0] instanceof Request ? args[0].url : args[0])

      if (urlObj.pathname.endsWith("/token")) {
        const [url, request] = args

        const headers = {
          ...request!.headers,
          "content-type": "application/json",
        }

        const bodySearch = request?.body as URLSearchParams
        const body = JSON.stringify({
          code: bodySearch.get("code"),
          client_id: bodySearch.get("client_id"),
          client_secret: bodySearch.get("client_secret"),
          grant_type: "authorization_code",
          redirect_uri: bodySearch.get("redirect_uri"),
        })

        const customRequest = { ...request, headers, body }
        const response = await fetch(url, customRequest)

        const json = (await response.json()) as TachiResponse<{
          userID: string
          token: string
        }>
        return Response.json({
          access_token: json.body.token,
          user_id: json.body.userID.toString(),
          token_type: "Bearer",
        })
      }

      if (urlObj.pathname.endsWith("/me")) {
        const response = await fetch(...args)
        const json = (await response.json()) as TachiResponse<TachiProfile>
        return Response.json({
          id: json.body.id.toString(),
          name: json.body.username,
          picture: `${tachiUrl}/api/v1/users/${json.body.id}/pfp`,
        })
      }

      return fetch(...args)
    },
    id: config.provider?.id || "tachi",
    name: config.provider?.name || "Tachi",
    type: "oauth",
    checks: ["none"],
    style: {
      logo: "https://raw.githubusercontent.com/zkrising/Tachi/959de4821e62d1a9cfbc77f268c345269861eae1/server/example/default-cdn-contents/logos/logo.svg",
    },
    client: { token_endpoint_auth_method: "client_secret_post" },
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    authorization: {
      url: `${tachiUrl}/oauth/request-auth`,
      params: { clientID: config.clientId },
    },
    token: `${tachiUrl}/api/v1/oauth/token`,
    userinfo: `${tachiUrl}/api/v1/users/me`,
  }
}
