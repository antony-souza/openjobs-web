import { isAxiosError } from 'axios'
import { http } from '../../../lib/http'

export interface Author {
  id: string
  name: string
  username: string
  avatarUrl: string | null
}
export interface PublicProfile extends Author {
  coverUrl: string | null
  role: string
  headline: string | null
  bio: string | null
  location: string | null
  portfolioUrl: string | null
  linkedinUrl: string | null
  joinedAt: string
  postsCount: number
}
export interface Profile extends Author {
  coverUrl: string | null
  headline: string | null
  bio: string | null
  location: string | null
  portfolioUrl: string | null
  linkedinUrl: string | null
  email: string
  role: string
}
export interface Page<T> {
  page: number
  size: number
  total: number
  items: T[]
}
export interface Post {
  id: string
  content: string
  fileUrl: string | null
  createdAt: string
  author: Author
  likesCount: number
  commentsCount: number
  liked: boolean
}
export interface Comment {
  parentCommentId: string | null
  repliesCount: number
  likesCount: number
  liked: boolean
  id: string
  content: string
  createdAt: string
  author: Author
}
export interface Job {
  id: string
  title: string
  description: string
  createdAt: string
  publishedBy: Author
}
export interface MenuItem {
  title: string
  iconName: string
  path: string
}
interface Envelope<T> {
  data: T
  errors: { message: string }[]
}
interface ErrorResponse {
  errors?: { message: string }[]
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message)
  }
}

async function request<T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  body?: unknown,
): Promise<T> {
  try {
    const { data } = await http.request<Envelope<T>>({
      method,
      url,
      data: body,
      headers:
        body instanceof FormData ? { 'Content-Type': undefined } : undefined,
    })
    return data.data
  } catch (error) {
    if (isAxiosError<ErrorResponse>(error)) {
      throw new ApiError(
        error.response?.data.errors?.[0]?.message ??
          'Não foi possível conectar à API. Tente novamente.',
        error.response?.status,
      )
    }
    throw error
  }
}

export const getPublicProfile = (username: string) =>
  request<PublicProfile>('get', `/v1/profiles/${encodeURIComponent(username)}`)
export const getPublicPosts = (username: string, page: number) =>
  request<Page<Post>>(
    'get',
    `/v1/profiles/${encodeURIComponent(username)}/posts?page=${page}`,
  )
export const getProfile = () => request<Profile>('get', '/v1/users/me')
export const updateProfile = (form: FormData) =>
  request<Profile>('put', '/v1/users/me', form)
export const getMenu = () => request<MenuItem[]>('get', '/v1/users/me/menu')
export const getFeed = (page: number) =>
  request<Page<Post>>('get', `/v1/community/feed?page=${page}&size=10`)
export const getMyPosts = (page: number) =>
  request<Page<Post>>('get', `/v1/community/posts/me?page=${page}&size=10`)
export const updatePost = (postId: string, form: FormData) =>
  request<{ message: string }>('put', `/v1/community/posts/${postId}`, form)
export const deletePost = (postId: string) =>
  request<{ message: string }>('delete', `/v1/community/posts/${postId}`)
export const createPost = (form: FormData) =>
  request<{ message: string }>('post', '/v1/community/posts', form)
export const getComments = (postId: string, page: number) =>
  request<Page<Comment>>(
    'get',
    `/v1/community/posts/${postId}/comments?page=${page}`,
  )
export const createComment = (
  postId: string,
  content: string,
  parentCommentId?: string,
) =>
  request<Comment>('post', `/v1/community/posts/${postId}/comments`, {
    content,
    parentCommentId,
  })
export const getReplies = (postId: string, commentId: string, page: number) =>
  request<Page<Comment>>(
    'get',
    `/v1/community/posts/${postId}/comments/${commentId}/replies?page=${page}`,
  )
export const updateComment = (
  postId: string,
  commentId: string,
  content: string,
) =>
  request<{ message: string }>(
    'put',
    `/v1/community/posts/${postId}/comments/${commentId}`,
    { content },
  )
export const deleteComment = (postId: string, commentId: string) =>
  request<{ message: string }>(
    'delete',
    `/v1/community/posts/${postId}/comments/${commentId}`,
  )
export const setCommentLike = (
  postId: string,
  commentId: string,
  liked: boolean,
) =>
  request<{ liked: boolean }>(
    'put',
    `/v1/community/posts/${postId}/comments/${commentId}/like`,
    { liked },
  )
export const getPostLikes = (postId: string, page: number) =>
  request<Page<Author>>(
    'get',
    `/v1/community/posts/${postId}/likes?page=${page}`,
  )
export const getCommentLikes = (
  postId: string,
  commentId: string,
  page: number,
) =>
  request<Page<Author>>(
    'get',
    `/v1/community/posts/${postId}/comments/${commentId}/likes?page=${page}`,
  )
export const setLike = (postId: string, liked: boolean) =>
  request<{ liked: boolean }>('put', `/v1/community/posts/${postId}/like`, {
    liked,
  })
export const getJobs = (page = 0, search = '', size = 3) =>
  request<Page<Job>>(
    'get',
    `/v1/opportunities?page=${page}&size=${size}&search=${encodeURIComponent(search)}`,
  )
export const applyForJob = (jobId: string) =>
  request<{ message: string }>('post', '/v1/applications', { jobId })

export function timeAgo(date: string, now = Date.now()) {
  const elapsed = Math.max(0, now - new Date(date).getTime())
  if (!Number.isFinite(elapsed)) return 'Data indisponível'
  const seconds = Math.floor(elapsed / 1000)
  if (seconds < 60) return `há ${seconds} s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `há ${minutes} min`
  if (minutes < 1440) return `há ${Math.floor(minutes / 60)} h`
  const days = Math.floor(minutes / 1440)
  return `há ${days} ${days === 1 ? 'dia' : 'dias'}`
}
