/**
 * This is the client-side entrypoint for your tRPC API. It is used to create the `api` object which
 * contains the Next.js App-wrapper, as well as your type-safe React Query hooks.
 *
 * We also create a few inference helpers for input and output types.
 */
import { MutationCache } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import { createTRPCNext } from "@trpc/next"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

import { toast } from "@/components/ui/use-toast"
import type { AppRouter } from "../../../hono/src/trpc/root"

/** A set of type-safe react-query hooks for your tRPC API. */
export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      /**
       * Transformer used for data de-serialization from the server.
       *
       * @see https://trpc.io/docs/data-transformers
       */

      queryClientConfig: {
        mutationCache: new MutationCache({
          onError: (err: unknown) => {
            const message = err instanceof Error ? err.message : "Ocorreu um erro interno"

            toast({
              description: message,
              variant: "destructive",
            })
          },
          onSuccess: (data) => {
            const message = (data as any)?.message
            if (typeof message === "string") {
              toast({
                description: message,
              })
            }
          },
        }),
        defaultOptions: {
          queries: {
            retry: 1,
          },
        },
      },

      /**
       * Links used to determine request flow from client to server.
       *
       * @see https://trpc.io/docs/links
       */
      links: [
        httpBatchLink({
          url: process.env["NEXT_PUBLIC_API_URL"] ?? `https://api.resistohub.com/trpc`,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            })
          },
        }),
      ],
    }
  },
  overrides: {
    useMutation: {
      onSuccess: (t) => {
        t.queryClient.invalidateQueries()
        t.originalFn()
      },
    },
  },

  /**
   * Whether tRPC should await queries when server rendering pages.
   *
   * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
   */
  ssr: false,
})

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>
