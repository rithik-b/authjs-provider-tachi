# authjs-provider-tachi

An authjs/nextauth provider for [Tachi](https://github.com/zkrising/Tachi)

To use this make sure to set up a [Tachi API Client](https://docs.tachi.ac/codebase/infrastructure/api-clients/)

## Example

```typescript
import NextAuth from "next-auth"
import TachiProvider from "authjs-provider-tachi"

export default NextAuth({
  providers: [
    TachiProvider({
      clientId: process.env.TACHI_CLIENT_ID,
      clientSecret: process.env.TACHI_CLIENT_SECRET,
      tachiUrl: "https://boku.tachi.ac",
      // Optional, provide your tachi instance name
      provider: {
        id: "bokutachi",
        name: "Bokutachi",
      },
    }),
  ],
})
```
