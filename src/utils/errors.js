const ERROR_MESSAGES = {
  'Failed to fetch': 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
  'NetworkError': 'Erro de rede. Verifique sua conexão com a internet.',
  'Network request failed': 'Sem conexão com o servidor. Tente novamente em instantes.',
  'JWT expired': 'Sua sessão expirou. Faça login novamente.',
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'User already registered': 'Este e-mail já está cadastrado.',
  'Email not confirmed': 'E-mail não confirmado. Verifique sua caixa de entrada.',
  'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
  'New password should be different from the old password': 'A nova senha deve ser diferente da atual.',
}

export function getFriendlyErrorMessage(error) {
  if (!error) return 'Ocorreu um erro inesperado.'

  const errorString = typeof error === 'string' ? error : error.message || String(error)

  for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
    if (errorString.includes(key)) {
      return message
    }
  }

  return 'Ocorreu um erro inesperado. Tente novamente.'
}
