import { z } from 'zod'

export const schema = z.object({
  title: z.string().min(1, 'Book title is required'),
  author: z.string().min(1, 'Author is required'),
  publisher: z.string().min(1, 'Publisher is required'),
  genre: z.string().min(1, 'Genre is required'),
  available: z.boolean(),
})

export type BookFormData = z.infer<typeof schema>