import { password } from "bun"

export const schemaContentFront = {
  "pt-br": {
    loginSchema: {
      email: "Email é obrigatório",
      emailInvalid: "Email inválido",
      password: "Senha é obrigatória",
    },
    userProfileSchema: {
      name: "Nome é obrigatório",
      nameMin: "Nome deve ter no mínimo 3 caracteres",
      lastName: "Sobrenome é obrigatório",
      lastNameMin: "Sobrenome deve ter no mínimo 3 caracteres",
    },
    register: {
      password:
        "A senha deve ter no mínimo 8 caracteres e conter pelo menos um número, uma letra maiúscula, uma letra minúscula e um caractere especial",
      passwordsNotMatch: "As senhas não coincidem",
    },
  },
  "en-us": {
    loginSchema: {
      emailInvalid: "Invalid email",
      email: "Email is required",
      password: "Password is required",
    },
    userProfileSchema: {
      name: "Name is required",
      nameMin: "Name must have at least 3 characters",
      lastName: "Last name is required",
      lastNameMin: "Last name must have at least 3 characters",
    },
    register: {
      password:
        "The password must be at least 8 characters long and contain at least one number, one uppercase letter, one lowercase letter, and one special character",
      passwordsNotMatch: "Passwords do not match",
    },
  },
  "es-es": {
    loginSchema: {
      email: "El correo electrónico es obligatorio",
      emailInvalid: "Email inválido",
      password: "La contraseña es obligatoria",
    },
    userProfileSchema: {
      name: "El nombre es obligatorio",
      nameMin: "El nombre debe tener al menos 3 caracteres",
      lastName: "El apellido es obligatorio",
      lastNameMin: "El apellido debe tener al menos 3 caracteres",
    },
    register: {
      password:
        "La contraseña debe tener al menos 8 caracteres y contener al menos un número, una letra mayúscula, una letra minúscula y un carácter especial",
      passwordsNotMatch: "Las contraseñas no coinciden",
    },
  },
}
