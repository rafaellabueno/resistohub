import { z } from "zod"

import i18next from "i18next"
import { makeZodI18nMap } from "zod-i18n-map"
// Import your language translation files
import translationEn from "zod-i18n-map/locales/en/zod.json"
import translationEs from "zod-i18n-map/locales/es/zod.json"
import translationPt from "zod-i18n-map/locales/pt/zod.json"

// lng and resources key depend on your locale.
i18next.init({
  lng: "pt",
  resources: {
    en: {
      zod: translationEn,
    },
    es: {
      zod: translationEs,
    },
    pt: {
      zod: translationPt,
    },
  },
})

export const lang = i18next
z.setErrorMap(makeZodI18nMap({ ns: ["zod", "custom"] }))

const changeUserProfileSchema = z.object({
  name: z.string(),
  lastName: z.string(),
  id: z.number(),
})

const signupSchema = z.object({
  name: z.string().min(3).max(100).trim(),
  email: z.string().email().max(255).trim(),
  code: z.string(),
  password: z.string().min(8).max(50),
  passwordConfirm: z.string().min(8).max(50),
  lastName: z.string().min(3).max(100).trim(),
  country: z.string().min(2).max(2),
  institution: z.string().min(2).max(100),
  typeSpecialist: z.string().min(2).max(100),
  description: z.string().min(2).max(255),
  position: z.string().min(2).max(100),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const userProfileSchema = z.object({
  name: z.string().min(3),
  lastName: z.string().min(3),
  country: z.string().min(1),
  institution: z.string().min(1),
  typeSpecialist: z.string().min(1),
  description: z.string().min(1),
  position: z.string().min(1),
})

const sendCodeSchema = z.object({
  email: z.string().email(),
  name: z.string(),
})

const changePasswordSchema = z.object({
  email: z.string().email().trim(),
  code: z.string(),
  password: z.string().min(8),
  passwordConfirm: z.string().min(8),
})

export const schemas = {
  changeUserProfileSchema,
  registerSchema: signupSchema,
  loginSchema,
  userProfileSchema,
  sendCodeSchema,
  changePasswordSchema,
}
