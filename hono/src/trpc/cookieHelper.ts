export function getCookieHelper(req: Request, cookieName: string) {
  const cookies = req.headers.get("cookie")
  return cookies
    ?.split(";")
    .find((c) => c.includes(cookieName))
    ?.split("=")[1]
}
