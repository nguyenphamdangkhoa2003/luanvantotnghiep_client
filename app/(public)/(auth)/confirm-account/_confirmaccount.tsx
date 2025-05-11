'use client'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { Loader, MailCheck, ArrowRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { verifyEmailMutationFn } from '@/api/auths/auth'

export default function ConfirmAccount() {
  const router = useRouter()
  const params = useSearchParams()
  const code = params.get('code')

  const { mutate, isPending } = useMutation({
    mutationFn: verifyEmailMutationFn,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) {
      toast.error('Error', {
        description: 'Confirmation token not found',
        className: 'bg-destructive text-destructive-foreground',
      })
      return
    }
    mutate(
      { code },
      {
        onSuccess: () => {
          toast.success('Success', {
            description: 'Account confirmed successfully! Redirecting...',
          })
          router.replace('/sign-in')
        },
        onError: (error) => {
          toast.error('Error', {
            description:
              error.message || 'Something went wrong during confirmation',
            className: 'bg-destructive text-destructive-foreground',
          })
        },
      }
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-card rounded-2xl shadow-lg p-4 sm:p-6 space-y-6 border border-border backdrop-blur-sm"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent mb-4"
          >
            <MailCheck className="h-6 w-6 text-primary" />
          </motion.div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Xác Minh Email
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Chúng tôi đã gửi liên kết xác minh đến email của bạn. Vui lòng xác
            minh để hoàn tất đăng ký.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Button
            disabled={isPending}
            type="submit"
            size="lg"
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-md flex items-center justify-center gap-2"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                <span>Đang xác minh...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Xác Minh Email</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground space-y-2">
          <p>
            Chưa nhận được email?{' '}
            <button
              type="button"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
              onClick={() => router.push('/resend-confirmation')}
            >
              Gửi lại xác minh
            </button>
          </p>
          <p>
            Cần hỗ trợ?{' '}
            <a
              href="mailto:support@example.com"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Liên hệ đội hỗ trợ
            </a>
          </p>
        </div>
      </motion.div>
    </main>
  )
}
