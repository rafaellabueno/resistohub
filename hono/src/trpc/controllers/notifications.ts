import { db, dbSchema } from "../../db"

type Notification = {
  userId: number
  texts: {
    "pt-br": string
    "en-us": string
    "es-es": string
  }
  links?: {
    link: string
    titles: {
      "pt-br": string
      "en-us": string
      "es-es": string
    }
  }[]
  date?: Date
}
export const insertNotification = async (props: Notification) => {
  const json = JSON.stringify({
    texts: props.texts,
    links: props.links,
  })

  await db.insert(dbSchema.Notification).values({
    status: "unread",
    idUser: props.userId,
    createdAt: props.date,
    json: json,
  })
}
