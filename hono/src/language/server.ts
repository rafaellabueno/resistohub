export const serverContent = {
  "pt-br": {
    middleware: {
      requireAuth: {
        unauthorized: "Você não está logado",
      },
      isProfile: {
        unauthorized: "Você não tem permissão para acessar essa rota",
      },
    },
    auth: {
      signin: {
        userExists: "Usuário já existe",
      },
      login: {
        userOrPasswordIncorrect: "Usuário ou senha incorretos",
        schemaEmail: "Email não informado",
        schemaEmailInvalid: "Email inválido",
        schemaPassword: "Senha não informada",
      },
      updateUserProfile: {
        schemaName: "Nome não informado",
        schemaNameMin: "O nome deve ter pelo menos 3 caracteres",
        schemaLastName: "Sobrenome não informado",
        schemaLastNameMin: "O sobrenome deve ter pelo menos 3 caracteres",
      },
      resetPassword: {
        invalidCode: "Código inválido",
        success: "Senha redefinida com sucesso",
      },
    },
    sendEmailError: "Erro ao enviar email",
  },
  "es-es": {
    middleware: {
      requireAuth: {
        unauthorized: "No has iniciado sesión",
      },
      isProfile: {
        unauthorized: "No tienes permiso para acceder a esta ruta",
      },
    },
    auth: {
      signin: {
        userExists: "El usuario ya existe",
      },
      login: {
        userOrPasswordIncorrect: "Usuario o contraseña incorrectos",
        schemaEmail: "Email no informado",
        schemaEmailInvalid: "Email inválido",
        schemaPassword: "Contraseña no informada",
      },
      updateUserProfile: {
        schemaName: "Nombre no informado",
        schemaNameMin: "El nombre debe tener al menos 3 caracteres",
        schemaLastName: "Apellido no informado",
        schemaLastNameMin: "El apellido debe tener al menos 3 caracteres",
      },
      resetPassword: {
        invalidCode: "Código inválido",
        success: "Contraseña reseteada con éxito",
      },
    },
    sendEmailError: "Error enviando email",
  },
  "en-us": {
    middleware: {
      requireAuth: {
        unauthorized: "You are not logged in",
      },
      isProfile: {
        unauthorized: "You do not have permission to access this route",
      },
    },
    auth: {
      signin: {
        userExists: "User already exists",
      },
      login: {
        userOrPasswordIncorrect: "Incorrect username or password",
        schemaEmail: "Email not informed",
        schemaEmailInvalid: "Invalid email",
        schemaPassword: "Password not informed",
      },
      updateUserProfile: {
        schemaName: "Name not informed",
        schemaNameMin: "Name must be at least 3 characters",
        schemaLastName: "Last name not informed",
        schemaLastNameMin: "Last name must be at least 3 characters",
      },
      resetPassword: {
        invalidCode: "Invalid code",
        success: "Password reset successfully",
      },
    },
    sendEmailError: "Error sending email",
  },
}
