import { isAxiosError } from 'axios'

import { http } from '../../../lib/http'

export interface SignInPayload {
  email: string
  password: string
}

interface SignInResponse {
  token: string
}

interface ApiResponse<T> {
  data: T
  errors: { field: string | null; message: string }[]
}

export interface SignUpPayload {
  name: string
  email: string
  username: string
  password: string
}

interface SignUpResponse {
  message: string
  token: string
}

export async function signIn(payload: SignInPayload): Promise<SignInResponse> {
  try {
    const { data } = await http.post<ApiResponse<SignInResponse>>('/v1/auth/sign-in', payload)
    return data.data
  } catch (error) {
    if (isAxiosError<ApiResponse<never>>(error)) {
      throw new Error(error.response?.data.errors[0]?.message ?? 'Não foi possível entrar. Verifique seus dados.')
    }

    throw error
  }
}

export async function signUp(payload: SignUpPayload): Promise<SignUpResponse> {
  try {
    const { data } = await http.post<ApiResponse<SignUpResponse>>('/v1/auth/sign-up', payload)
    return data.data
  } catch (error) {
    if (isAxiosError<ApiResponse<never>>(error)) {
      throw new Error(error.response?.data.errors[0]?.message ?? 'Não foi possível criar sua conta.')
    }

    throw error
  }
}
