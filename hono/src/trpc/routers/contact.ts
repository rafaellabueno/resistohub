
import { publicProcedure, router } from "../trpc"
import { z } from "zod"
import { ee } from "../../events/events"

export const contactRouter = router({
  sendEmail: publicProcedure.input(
    z.object({
      name: z.string(),
      email: z.string(),
      subject: z.string(),
      message: z.string(),
    }),
  ).mutation(async ({ ctx, input }) => {
    const { name, email, subject, message } = input

    const replacements = {
      name: name,
      email: email,
      subject: subject,
      message: message,
    }

    ee.emit("sendEmail", {
      email: "resistohub@ufcspa.edu.br",
      subject: "Novo Contato",
      fileName: "contact",
      replacements: replacements,
    })

    return { ok: true }
  }),
})