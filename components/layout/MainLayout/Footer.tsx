"use client";
import Logo from "../Logo";
import useWebsiteContent from "@/hooks/use-website-context";
import Image from "next/image";
import Link from "next/link";
import { platform } from "os";
import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
const socialIcons: { [key: string]: any } = {
  facebook: FaFacebook,
  linkedin: FaLinkedin,
  twitter: FaTwitter,
  instagram: FaInstagram,
};
export default function Footer() {
  const { data } = useWebsiteContent();
  return (
    <footer className="bg-[var(--background)] border-t border-[var(--border)] py-8 pb-4">
      <div
        className="max-w-6xl mb-16 mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center
          md:text-left"
      >
        {/* Logo & Mô tả */}
        <div className="flex flex-col items-center md:items-start">
          <Logo width="200" height="auto" fill="var(--primary)" />
          <p className="text-[var(--muted-foreground)] mt-2 max-w-xs">
            Nền tảng kết nối tài xế và hành khách trên cùng tuyến đường.
          </p>
        </div>

        {/* Liên kết */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-lg font-semibold text-[var(--primary)]">
            Liên kết
          </h3>
          {data?.footer.links.map((value, index) => (
            <Link
              key={index}
              href={value.url}
              className="text-[var(--muted-foreground)] hover:text-[var(--primary)] mt-2"
            >
              {value.name}
            </Link>
          ))}
        </div>

        {/* Liên hệ */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-lg font-semibold text-[var(--primary)]">
            Liên hệ
          </h3>
          <p className="text-[var(--muted-foreground)] mt-2">
            SĐT: {data?.footer.phone}
          </p>
          <p className="text-[var(--muted-foreground)]">
            Email: {data?.footer.email}
          </p>
          <p className="text-[var(--muted-foreground)]">
            Địa chỉ: {data?.footer.address}
          </p>

          {/* Social Icons */}
          <div className="flex gap-3 mt-3">
            {data?.footer.socialLinks &&
              Object.entries(data.footer.socialLinks).map(([flatform, url]) => {
                // Bỏ qua nếu value là null hoặc undefined

                return (
                  <a
                    key={url}
                    href={url || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] hover:text-[var(--ring)]"
                  >
                    {React.createElement(socialIcons[flatform])}
                  </a>
                );
              })}
          </div>
        </div>
      </div>

      {/* Bản quyền */}
      <p
        className="text-[var(--muted-foreground)] text-center text-sm border-t
          border-[var(--border)] pt-4"
      >
        © 2025 XeShare. All rights reserved.
      </p>
    </footer>
  );
}
