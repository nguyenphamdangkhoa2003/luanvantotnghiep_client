'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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
import {
  ArrowRight,
  Loader,
  MailCheck,
  Eye,
  EyeOff,
  User,
  Lock,
} from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { signupMutationFn, googleSignInMutationFn } from '@/api/auths/auth'
import { toast } from 'sonner'
import { FcGoogle } from 'react-icons/fc'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/context/auth-provider'

export default function SignUp() {
  const router = useRouter()
  const { refetch } = useAuthContext()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { mutate: signup, isPending: isSignupPending } = useMutation({
    mutationFn: signupMutationFn,
    onSuccess: () => {
      setIsSubmitted(true)
    },
    onError: (error: any) => {
      toast.error('Registration Error', {
        description: error.message || 'Đăng ký thất bại',
        className: 'bg-destructive text-destructive-foreground',
      })
      setIsSubmitted(false)
    },
  })

  const { mutate: googleSignIn, isPending: isGoogleSignInPending } =
    useMutation({
      mutationFn: googleSignInMutationFn,
      onSuccess: () => {
        refetch()
        router.replace('/')
      },
      onError: (error: any) => {
        console.error('Google sign-up error:', error)
        toast('Error', {
          description: 'Đăng ký Google thất bại',
          className: 'bg-destructive text-destructive-foreground',
        })
        router.push('/sign-up')
      },
    })

  const formSchema = z
    .object({
      name: z.string().trim().min(1, {
        message: 'Họ tên là bắt buộc',
      }),
      email: z.string().trim().email().min(1, {
        message: 'Email là bắt buộc',
      }),
      password1: z.string().trim().min(8, {
        message: 'Mật khẩu phải có ít nhất 8 ký tự',
      }),
      password2: z.string().min(1, {
        message: 'Vui lòng nhập lại mật khẩu',
      }),
    })
    .refine((val) => val.password1 === val.password2, {
      message: 'Mật khẩu nhập lại không khớp',
      path: ['password2'],
    })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password1: '',
      password2: '',
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    signup(values)
  }

  const handleGoogleSignIn = () => {
    googleSignIn()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-4">
      {!isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-card rounded-2xl shadow-lg p-4 sm:p-5 border border-border"
        >
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex justify-center mb-3"
            ></motion.div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Tạo Tài Khoản
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Tham gia cộng đồng của chúng tôi
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full mb-4 h-11 gap-2 border-border hover:bg-accent hover:text-accent-foreground font-semibold rounded-lg"
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
                HOẶC ĐĂNG KÝ BẰNG EMAIL
              </span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Họ và Tên
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Nguyễn Văn A"
                          className="pl-10 h-11 rounded-lg text-sm"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
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
                          placeholder="your@email.com"
                          type="email"
                          autoComplete="off"
                          className="pl-10 h-11 rounded-lg text-sm"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Mật khẩu
                    </FormLabel>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Ít nhất 8 ký tự"
                          className="pl-10 h-11 pr-10 rounded-lg text-sm"
                          {...field}
                        />
                      </FormControl>
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

              <FormField
                control={form.control}
                name="password2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Xác nhận Mật khẩu
                    </FormLabel>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Xác nhận mật khẩu"
                          className="pl-10 h-11 pr-10 rounded-lg text-sm"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
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
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                disabled={isSignupPending || isGoogleSignInPending}
              >
                {isSignupPending ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Tạo Tài Khoản
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          <p className="text-sm text-center text-muted-foreground mt-4">
            Đã có tài khoản?{' '}
            <Link
              href="/sign-in"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Đăng nhập
            </Link>
          </p>

          <p className="text-xs text-center text-muted-foreground mt-3">
            Bằng cách đăng ký, bạn đồng ý với{' '}
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
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-card rounded-2xl shadow-lg p-4 sm:p-6 border border-border text-center"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex justify-center mb-4"
          >
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <MailCheck className="h-6 w-6 text-primary" />
            </div>
          </motion.div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
            Xác minh Email
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            Chúng tôi đã gửi liên kết xác minh đến{' '}
            <span className="font-medium text-primary">
              {form.getValues().email}
            </span>
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Vui lòng kiểm tra hộp thư đến để hoàn tất đăng ký.
          </p>
          <Link href="/sign-in">
            <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg flex items-center justify-center gap-2">
              Đi đến Đăng nhập
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  )
}
