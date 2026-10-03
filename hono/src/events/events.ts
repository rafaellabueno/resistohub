import { EventEmitter } from "node:events"
import type { emails } from "../emails"
import { sendEmail } from "../utils/emailService"

const EventsType = {
  sendEmail: "sendEmail",
} as const

type EventsPayload = {
  sendEmail: {
    email: string
    subject: string
    fileName: keyof typeof emails
    replacements: { [key: string]: string }
  }
}

class TypedEventEmitter extends EventEmitter {
  emit<T extends keyof EventsPayload>(eventName: T, payload: EventsPayload[T]): boolean {
    return super.emit(eventName, payload)
  }
  on<T extends keyof EventsPayload>(
    eventName: T,
    listener: (payload: EventsPayload[T]) => void,
  ): this {
    return super.on(eventName, listener)
  }
  once<T extends keyof EventsPayload>(
    eventName: T,
    listener: (payload: EventsPayload[T]) => void,
  ): this {
    return super.once(eventName, listener)
  }
}

export const ee = new TypedEventEmitter()

ee.on(EventsType.sendEmail, async ({ email, subject, fileName, replacements }) => {
  await sendEmail(email, subject, fileName, replacements)
})
