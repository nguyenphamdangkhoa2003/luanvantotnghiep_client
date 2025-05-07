'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowRight, Loader, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import Link from 'next/link';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { motion } from 'framer-motion';
import { signinMutationFn } from '@/api/auths/auth';

export default function Login() {
    const router = useRouter();
    const { mutate, isPending } = useMutation({
        mutationFn: signinMutationFn,
    });

    const [showPassword, setShowPassword] = useState(false);

    const formSchema = z.object({
        emailOrUsername: z.string().trim().email().min(1, {
            message: 'Email hợp lệ là bắt buộc',
        }),
        password: z.string().trim().min(1, {
            message: 'Mật khẩu là bắt buộc',
        }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            emailOrUsername: '',
            password: '',
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        mutate(values, {
            onSuccess: (response) => {
                if (response.data.mfaRequired) {
                    router.replace(`/verify-mfa?email=${values.emailOrUsername}`);
                    return;
                }
                router.replace(`/`);
            },
            onError: (error) => {
                toast('Error', {
                    description: error.message,
                    style: {
                        background: '#ef4444',
                        color: '#fff',
                    },
                });
            },
        });
    };

    const handleGoogleSignIn = async () => {
        router.push(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google` || '/'
        );
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 p-4 sm:p-6 backdrop-blur-sm"
            >
                <div className="text-center mb-6">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="flex justify-center mb-3"
                    >
                        
                    </motion.div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        Chào Mừng Trở Lại
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Đăng nhập để tiếp tục
                    </p>
                </div>

                <Button
                    variant="outline"
                    className="w-full h-11 gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 mb-4 text-gray-700 dark:text-gray-300 font-semibold rounded-lg"
                    onClick={handleGoogleSignIn}
                >
                    <FcGoogle className="h-5 w-5" />
                    Tiếp tục với Google
                </Button>

                <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400 font-medium">
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
                                    <FormLabel className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                                        Địa chỉ Email
                                    </FormLabel>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="your@email.com"
                                            className="pl-10 h-11 dark:bg-gray-700/50 dark:border-gray-600 rounded-lg text-sm"
                                            {...field}
                                        />
                                    </div>
                                    <FormMessage className="text-xs text-red-500" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                                            Mật khẩu
                                        </FormLabel>
                                        <Link
                                            href={`/forgot-password?email=${form.getValues().emailOrUsername}`}
                                            className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                        >
                                            Quên mật khẩu?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="pl-10 h-11 pr-10 dark:bg-gray-700/50 dark:border-gray-600 rounded-lg text-sm"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <FormMessage className="text-xs text-red-500" />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-700 dark:to-blue-600 dark:hover:from-blue-800 dark:hover:to-blue-700 text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-2"
                            disabled={isPending}
                        >
                            {isPending ? (
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

                <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Chưa có tài khoản?{' '}
                    <Link
                        href="/sign-up"
                        className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                        Đăng ký
                    </Link>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
                    Bằng cách tiếp tục, bạn đồng ý với{' '}
                    <Link
                        href="#"
                        className="underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        Điều khoản Dịch vụ
                    </Link>{' '}
                    và{' '}
                    <Link
                        href="#"
                        className="underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        Chính sách Bảo mật
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}