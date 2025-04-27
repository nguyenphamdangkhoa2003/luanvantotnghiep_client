'use client';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { ArrowRight, Loader, MailCheck, Eye, EyeOff, User, Lock } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
// import { registerMutationFn } from '@/api/auths/auth';
import { toast } from 'sonner';
import { FcGoogle } from 'react-icons/fc';
import { motion } from 'framer-motion';

export default function SignUp() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { mutate, isPending } = useMutation({
        // mutationFn: registerMutationFn,
    });

    const formSchema = z
        .object({
            name: z.string().trim().min(1, {
                message: 'Name is required',
            }),
            email: z.string().trim().email().min(1, {
                message: 'Email is required',
            }),
            password: z.string().trim().min(8, {
                message: 'Password must be at least 8 characters',
            }),
            confirmPassword: z.string().min(1, {
                message: 'Confirm Password is required',
            }),
        })
        .refine((val) => val.password === val.confirmPassword, {
            message: 'Passwords do not match',
            path: ['confirmPassword'],
        });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        // mutate(values, {
        //     onSuccess: () => {
        //         setIsSubmitted(true);
        //     },
        //     onError: (error) => {
        //         toast.error('Registration Error', {
        //             description: error.message,
        //             style: {
        //                 background: '#ef4444',
        //                 color: '#fff',
        //             },
        //         });
        //     },
        // });
        setIsSubmitted(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-4">
            {!isSubmitted ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-5 border border-gray-100 dark:border-gray-700 backdrop-blur-sm"
                >
                    <div className="text-center mb-6">
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="flex justify-center mb-3"
                        >
                        </motion.div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            Tạo Tài Khoản
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            Tham gia cộng đồng của chúng tôi
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full mb-4 h-11 gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-semibold rounded-lg"
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
                                        <FormLabel className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                                            Họ và Tên
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    placeholder="Nguyễn Văn A"
                                                    className="pl-10 h-11 dark:bg-gray-700/50 dark:border-gray-600 rounded-lg text-sm"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                                            Địa chỉ Email
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
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
                                                    className="pl-10 h-11 dark:bg-gray-700/50 dark:border-gray-600 rounded-lg text-sm"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                                            Mật khẩu
                                        </FormLabel>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <FormControl>
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="Ít nhất 8 ký tự"
                                                    className="pl-10 h-11 pr-10 dark:bg-gray-700/50 dark:border-gray-600 rounded-lg text-sm"
                                                    {...field}
                                                />
                                            </FormControl>
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

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                                            Xác nhận Mật khẩu
                                        </FormLabel>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <FormControl>
                                                <Input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    placeholder="Xác nhận mật khẩu"
                                                    className="pl-10 h-11 pr-10 dark:bg-gray-700/50 dark:border-gray-600 rounded-lg text-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
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
                                className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-700 dark:to-blue-600 dark:hover:from-blue-800 dark:hover:to-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                                disabled={isPending}
                            >
                                {isPending ? (
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

                    <p className=" text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
                        Đã có tài khoản?{' '}
                        <Link
                            href="/sign-in"
                            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                            Đăng nhập
                        </Link>
                    </p>

                    <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
                        Bằng cách đăng ký, bạn đồng ý với{' '}
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
                    </p>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700 text-center"
                >
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="flex justify-center mb-4"
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                            <MailCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </motion.div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Xác minh Email
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Chúng tôi đã gửi liên kết xác minh đến{' '}
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                            {form.getValues().email}
                        </span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        Vui lòng kiểm tra hộp thư đến để hoàn tất đăng ký.
                    </p>
                    <Link href="/sign-in">
                        <Button className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-700 dark:to-blue-600 dark:hover:from-blue-800 dark:hover:to-blue-700 text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-2">
                            Đi đến Đăng nhập
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </motion.div>
            )}
        </div>
    );
}