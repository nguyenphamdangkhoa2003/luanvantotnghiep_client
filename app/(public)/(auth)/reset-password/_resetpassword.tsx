"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Frown, Loader, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { resetPasswordMutationFn } from "@/api/auths/auth";

export default function ResetPassword() {
  const router = useRouter();

  const params = useSearchParams();
  const code = params.get("code");

  const isValid = code ;

  const { mutate, isPending } = useMutation({
    mutationFn: resetPasswordMutationFn,
  });

  const formSchema = z
    .object({
      password1: z.string().trim().min(8, {
        message: "Mật khẩu phải có ít nhất 8 ký tự",
      }),
      password2: z.string().trim().min(1, {
        message: "Vui lòng xác nhận mật khẩu",
      }),
    })
    .refine((data) => data.password1 === data.password2, {
      message: "Mật khẩu không khớp",
      path: ["password2"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password1: "",
      password2: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!code) {
      router.replace("/forgot-password?email=");
      return;
    }
    const data = {
      password1: values.password1,
      password2:values.password2,
      resetToken: code,
    };
    mutate(data, {
      onSuccess: () => {
        toast("Success",{
          description: "Password reset successfully",
        });
        router.replace("/sign-in");
      },
      onError: (error) => {
        console.log(error);
        toast("Error",{
          description: error.message,
          style: {
            background: "#ef4444",
            color: "#fff"
          },
        });
      },
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      {isValid ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 backdrop-blur-sm"
        >
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4"
            >
              <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Đặt lại mật khẩu mới
            </h1>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                      Mật khẩu mới
                    </FormLabel>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Nhập mật khẩu mới"
                        className="pl-10 dark:bg-gray-700/50 dark:border-gray-600 h-12"
                        {...field}
                      />
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
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                      Xác nhận mật khẩu
                    </FormLabel>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Nhập lại mật khẩu mới"
                        className="pl-10 dark:bg-gray-700/50 dark:border-gray-600 h-12"
                        {...field}
                      />
                    </div>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-700 dark:to-blue-600 dark:hover:from-blue-800 dark:hover:to-blue-700 text-white shadow-md"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                <span className="font-medium">Cập nhật mật khẩu</span>
              </Button>
            </form>
          </Form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 text-center"
        >
          <div className="flex justify-center mb-6">
            <Frown className="h-12 w-12 text-red-500 animate-bounce" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Liên kết không hợp lệ hoặc đã hết hạn
          </h2>
          
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Bạn có thể yêu cầu liên kết đặt lại mật khẩu mới
          </p>
          
          <Link href="/forgot-password?email=">
            <Button className="h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-700 dark:to-blue-600 dark:hover:from-blue-800 dark:hover:to-blue-700 text-white shadow-md">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại trang quên mật khẩu
            </Button>
          </Link>
        </motion.div>
      )}
    </main>
  );
}