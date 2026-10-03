import { router } from "./trpc"
import { authRouter } from "./routers/auth"
import { notificationsRouter } from "./routers/notifications"
import { userRouter } from "./routers/user"
import { bioinfoRouter } from "./routers/bioinfo"
import { contactRouter } from "./routers/contact"
import { educationalRouter } from "./routers/educational"
import { communityRouter } from "./routers/community"
import { statsRouter } from "./routers/stats"
import { protocolRouter } from "./routers/protocol"
import { surveillanceRouter } from "./routers/surveillance"
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  notifications: notificationsRouter,
  bioinfo: bioinfoRouter,
  contact: contactRouter,
  educational: educationalRouter,
  community: communityRouter,
  stats: statsRouter,
  protocol: protocolRouter,
  surveillance: surveillanceRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
