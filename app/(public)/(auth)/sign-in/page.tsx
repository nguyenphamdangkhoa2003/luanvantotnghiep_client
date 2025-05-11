'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowRight, Loader, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import Link from 'next/link'
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
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { motion } from 'framer-motion'
import { signinMutationFn, googleSignInMutationFn } from '@/api/auths/auth'
import { useAuthContext } from '@/context/auth-provider'

export default function Login() {
  const router = useRouter()
  const { refetch } = useAuthContext()
  const [showPassword, setShowPassword] = useState(false)

  const { mutate: signin, isPending: isSigninPending } = useMutation({
    mutationFn: signinMutationFn,
    onSuccess: (response) => {
      refetch()
      form.reset()
      setShowPassword(false)
      router.replace(`/`)
    },
    onError: (error: any) => {
      console.error('Login error:', error)
      let errorMessage = error.message || 'Đăng nhập thất bại'
      if (error.response?.status === 403) {
        errorMessage =
          'Yêu cầu bị từ chối. Vui lòng kiểm tra thông tin đăng nhập hoặc CSRF token.'
      }
      toast('Error', {
        description: errorMessage,
        className: 'bg-destructive text-destructive-foreground',
      })
    },
  })

  const { mutate: googleSignIn, isPending: isGoogleSignInPending } =
    useMutation({
      mutationFn: googleSignInMutationFn,
      onError: (error: any) => {
        console.error('Google sign-in error:', error)
        toast('Error', {
          description: 'Đăng nhập Google thất bại',
          className: 'bg-destructive text-destructive-foreground',
        })
        router.push('/sign-in')
      },
    })

  const formSchema = z.object({
    emailOrUsername: z.string().trim().email().min(1, {
      message: 'Email hợp lệ là bắt buộc',
    }),
    password: z.string().trim().min(1, {
      message: 'Mật khẩu là bắt buộc',
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrUsername: '',
      password: '',
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    signin(values)
  }

  const handleGoogleSignIn = () => {
    googleSignIn()
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md rounded-2xl bg-card shadow-lg border border-border p-4 sm:p-6"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex justify-center mb-3"
          ></motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Chào Mừng Trở Lại
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Đăng nhập để tiếp tục
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full h-11 gap-2 border-border hover:bg-accent hover:text-accent-foreground mb-4 font-semibold rounded-lg"
          onClick={handleGoogleSignIn}
          disabled={isGoogleSignInPending}
        >
          {isGoogleSignInPending ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <FcGoogle className="h-5 w-5" />
              Tiếp tục với Google
            </>
          )}
        </Button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground font-medium">
              HOẶC ĐĂNG NHẬP BẰNG EMAIL
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="emailOrUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Địa chỉ Email
                  </FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="your@email.com"
                      className="pl-10 h-11 rounded-lg text-sm"
                      autoComplete="username"
                      {...field}
                    />
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium">
                      Mật khẩu
                    </FormLabel>
                    <Link
                      href={`/forgot-password?email=${
                        form.getValues().emailOrUsername
                      }`}
                      className="text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 h-11 pr-10 rounded-lg text-sm"
                      autoComplete="current-password"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg flex items-center justify-center gap-2"
              disabled={isSigninPending}
            >
              {isSigninPending ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Đăng Nhập
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm text-muted-foreground mt-4">
          Chưa có tài khoản?{' '}
          <Link
            href="/sign-up"
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Đăng ký
          </Link>
        </div>

        <div className="border-t border-border pt-4 mt-4 text-center text-xs text-muted-foreground">
          Bằng cách tiếp tục, bạn đồng ý với{' '}
          <Link
            href="#"
            className="underline hover:text-primary transition-colors"
          >
            Điều khoản Dịch vụ
          </Link>{' '}
          và{' '}
          <Link
            href="#"
            className="underline hover:text-primary transition-colors"
          >
            Chính sách Bảo mật
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
