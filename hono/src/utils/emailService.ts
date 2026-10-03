import type { emails } from "../emails"

export const sendEmail = async (
  to: string,
  subject: string,
  templateName: keyof typeof emails,
  replacements: { [key: string]: string },
) => {
  const res = await fetch("http://email-api:6000/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient: to,
      subject,
      html_file: `${templateName}.html`,
      replacements,
    }),
  }).catch((e) => {
    return new Error("Email not sent")
  })
  if (res instanceof Error) return false
  if (res.status !== 200) {
    return false
  }
  return true
}
