'use client'
import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, MailCheck, Loader } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { forgotPasswordMutationFn } from '@/api/auths/auth'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function ForgotPassword() {
  const params = useSearchParams()
  const email = params.get('email')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: forgotPasswordMutationFn,
  })

  const formSchema = z.object({
    email: z.string().trim().email().min(1, {
      message: 'Email is required',
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email || '',
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values, {
      onSuccess: () => {
        setIsSubmitted(true)
      },
      onError: (error) => {
        toast.error('Error', {
          description: error.message,
          className: 'bg-destructive text-destructive-foreground',
        })
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {!isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden border border-border"
        >
          <div className="p-8 space-y-6">
            <div className="text-center space-y-3">
              <h1 className="text-2xl font-bold text-foreground">
                Quên mật khẩu?
              </h1>
              <p className="text-muted-foreground">
                Nhập email của bạn để nhận liên kết đặt lại
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Địa chỉ Email
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <Input
                            placeholder="email@example.com"
                            autoComplete="email"
                            className="pl-10 h-12 rounded-lg"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 rounded-lg font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin mr-2" />
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi liên kết đặt lại'
                  )}
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm text-muted-foreground">
              Nhớ mật khẩu?{' '}
              <Link
                href="/sign-in"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Đăng nhập tại đây
              </Link>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden border border-border"
        >
          <div className="p-8 space-y-6 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent"
            >
              <MailCheck className="h-7 w-7 text-primary" />
            </motion.div>

            <h2 className="text-2xl font-bold text-foreground">
              Kiểm tra Email của bạn
            </h2>

            <p className="text-muted-foreground">
              Chúng tôi đã gửi liên kết đặt lại mật khẩu đến{' '}
              <span className="font-medium text-foreground">
                {form.getValues().email}
              </span>
            </p>

            <div className="pt-2">
              <Link href="/sign-in">
                <Button className="h-12 w-full rounded-lg font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                  Quay lại đăng nhập
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground pt-4">
              Không nhận được email?{' '}
              <button
                onClick={() => setIsSubmitted(false)}
                className="font-medium text-primary hover:text-primary/80 underline transition-colors"
              >
                Gửi lại
              </button>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
