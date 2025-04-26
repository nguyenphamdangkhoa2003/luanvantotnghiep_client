"use client";

import { useState } from "react";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useWebsiteContent from "@/hooks/use-website-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  subject: z.string().min(3, "Chủ đề phải có ít nhất 3 ký tự"),
  message: z.string().min(10, "Tin nhắn phải có ít nhất 10 ký tự"),
});

const mockData = {
  contact: {
    phone: '+84 123 456 789',
    email: 'support@xeshare.com',
    address: '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh, Việt Nam',
    googleMapUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.447964297664!2d106.69567541480094!3d10.776389792321216!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f16d37c7%3A0x1b1b2b1b1b1b1b1b!2sLe%20Loi%2C%20Ben%20Thanh%2C%20District%201%2C%20Ho%20Chi%20Minh%20City%2C%20Vietnam!5e0!3m2!1sen!2s!4v1634567890123!5m2!1sen!2s',
  },
};

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const data = mockData;
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      console.log(formData);
      form.reset();
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">
          Liên hệ với chúng tôi
        </h1>
        <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
          Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy gửi tin nhắn hoặc liên hệ trực tiếp qua thông tin bên dưới.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form liên hệ */}
        <div className="bg-[var(--card)] p-8 rounded-xl shadow-lg border border-[var(--border)]">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-6 pb-2 border-b border-[var(--border)]">
            Gửi tin nhắn
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[var(--foreground)]">Họ tên *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nhập họ tên" 
                          {...field} 
                          className="py-5 px-4"
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[var(--foreground)]">Email *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Nhập email" 
                          {...field} 
                          className="py-5 px-4"
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--foreground)]">Số điện thoại *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nhập số điện thoại" 
                        {...field} 
                        className="py-5 px-4"
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--foreground)]">Nội dung *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập nội dung tin nhắn"
                        className="w-full py-4 px-4 h-48"
                        {...field}
                        
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)] font-medium transition-colors"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi tin nhắn"}
              </Button>
            </form>
          </Form>
        </div>

        {/* Thông tin liên hệ */}
        <div className="bg-[var(--card)] p-8 rounded-xl shadow-lg border border-[var(--border)]">
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-6 pb-2 border-b border-[var(--border)]">
            Thông tin liên hệ
          </h2>
          
          <div className="space-y-6 mb-3">
            <div className="flex items-start gap-4">
              <div className="mt-1 p-3 bg-[var(--primary)]/10 rounded-full">
                <FaPhoneAlt className="text-[var(--primary)] text-lg" />
              </div>
              <div>
                <h3 className="font-medium text-[var(--foreground)] mb-1">Điện thoại</h3>
                <a 
                  href={`tel:${data?.contact.phone.replace(/\s+/g, '')}`}
                  className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                >
                  {data?.contact.phone}
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="mt-1 p-3 bg-[var(--primary)]/10 rounded-full">
                <FaEnvelope className="text-[var(--primary)] text-lg" />
              </div>
              <div>
                <h3 className="font-medium text-[var(--foreground)] mb-1">Email</h3>
                <a
                  href={`mailto:${data?.contact.email}`}
                  className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                >
                  {data?.contact.email}
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="mt-1 p-3 bg-[var(--primary)]/10 rounded-full">
                <FaMapMarkerAlt className="text-[var(--primary)] text-lg" />
              </div>
              <div>
                <h3 className="font-medium text-[var(--foreground)] mb-1">Địa chỉ</h3>
                <p className="text-[var(--foreground)]">
                  {data?.contact.address}
                </p>
              </div>
            </div>
          </div>
          
          {data?.contact.googleMapUrl && (
            <div className="rounded-xl overflow-hidden border border-[var(--border)]">
              <iframe
                src={data?.contact.googleMapUrl}
                width="100%"
                height="250"
                className="border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                aria-label="Bản đồ vị trí"
              ></iframe>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}