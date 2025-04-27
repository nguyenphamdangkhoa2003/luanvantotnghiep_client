"use client";
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader, Shield } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
// import { verifyMFALoginMutationFn } from "@/api/auths/auth";
import { toast } from "sonner";
import { motion } from "framer-motion";

const VerifyMfa = () => {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email");

  const { mutate, isPending } = useMutation({
    // mutationFn: verifyMFALoginMutationFn,
  });

  const FormSchema = z.object({
    pin: z.string().min(6, {
      message: "Mã xác thực phải có 6 chữ số",
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    // if (!email) {
    //   router.replace("/");
    //   return;
    // }
    // const data = {
    //   code: values.pin,
    //   email: email,
    // };
    // mutate(data, {
    //   onSuccess: (response) => {
    //     router.replace("/");
    //     toast.success("Thành công", {
    //       description: response?.data?.message || "Xác thực thành công",
    //     });
    //   },
    //   onError: (error) => {
    //     toast.error("Lỗi", {
    //       description: error.message || "Xác thực không thành công",
    //     });
    //   },
    // });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
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
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Xác thực Đa yếu tố
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Nhập mã 6 số từ ứng dụng xác thực của bạn
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">
                    Mã xác thực
                  </FormLabel>
                  <FormControl>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        {...field}
                        className="gap-2"
                      >
                        <InputOTPGroup className="gap-2">
                          {[...Array(6)].map((_, index) => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className="w-12 h-12 text-lg border-gray-300 dark:border-gray-600 rounded-lg"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormMessage className="text-center text-xs" />
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
              <span className="font-medium">Tiếp tục</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>

        <Button
          variant="ghost"
          className="w-full h-11 mt-4 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          onClick={() => router.push("/sign-in")}
        >
          Quay lại đăng nhập
        </Button>
      </motion.div>
    </main>
  );
};

export default VerifyMfa;