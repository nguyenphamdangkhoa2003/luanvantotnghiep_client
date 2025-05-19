'use client';
import Logo from '../Logo';
import useWebsiteContent from '@/hooks/use-website-context';
import Link from 'next/link';
import React from 'react';
import {
    FaFacebook,
    FaTwitter,
    FaInstagram,
    FaLinkedin,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
} from 'react-icons/fa';

const socialIcons: { [key: string]: any } = {
    facebook: FaFacebook,
    linkedin: FaLinkedin,
    twitter: FaTwitter,
    instagram: FaInstagram,
};

export default function Footer() {
    const { data } = useWebsiteContent();

    return (
        <footer className="bg-background border-t border-border/50">
            <div className="max-w-7xl mx-auto px-8 sm:px-6 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-6 lg:gap-10">
                {/* Brand Section */}
                <div className="space-y-4 sm:col-span-2 lg:col-span-1">
                    <Link href="/" className="inline-block">
                        <Logo width="160" height="36" fill="var(--primary)" />
                    </Link>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                        Nền tảng kết nối tài xế và hành khách trên cùng tuyến
                        đường, mang đến giải pháp di chuyển thông minh và tiết
                        kiệm.
                    </p>

                    {/* Social Links - Mobile */}
                    <div className="flex items-center gap-4 pt-2 lg:hidden">
                        {data?.footer.socialLinks &&
                            Object.entries(data.footer.socialLinks)
                                .filter(([_, url]) => url)
                                .map(([platform, url]) => (
                                    <a
                                        key={platform}
                                        href={url as string}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                        aria-label={platform}>
                                        {React.createElement(
                                            socialIcons[platform],
                                            { size: 16 }
                                        )}
                                    </a>
                                ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">
                        Liên kết nhanh
                    </h3>
                    <ul className="space-y-2 sm:space-y-3">
                        {data?.footer.links.map((value, index) => (
                            <li key={index}>
                                <Link
                                    href={value.url}
                                    className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors flex items-start gap-2">
                                    <span className="mt-0.5">•</span>
                                    <span>{value.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">
                        Liên hệ
                    </h3>
                    <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                        <li className="flex items-start gap-3">
                            <FaPhone
                                className="mt-0.5 flex-shrink-0"
                                size={12}
                            />
                            <span>{data?.footer.phone || 'Đang cập nhật'}</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <FaEnvelope
                                className="mt-0.5 flex-shrink-0"
                                size={12}
                            />
                            <span>{data?.footer.email || 'Đang cập nhật'}</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <FaMapMarkerAlt
                                className="mt-0.5 flex-shrink-0"
                                size={12}
                            />
                            <span>
                                {data?.footer.address || 'Đang cập nhật'}
                            </span>
                        </li>
                    </ul>

                    {/* Social Links - Desktop */}
                    <div className="hidden lg:flex items-center gap-4 pt-2">
                        {data?.footer.socialLinks &&
                            Object.entries(data.footer.socialLinks)
                                .filter(([_, url]) => url)
                                .map(([platform, url]) => (
                                    <a
                                        key={platform}
                                        href={url as string}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                        aria-label={platform}>
                                        {React.createElement(
                                            socialIcons[platform],
                                            { size: 16 }
                                        )}
                                    </a>
                                ))}
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-border/50 py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground text-center sm:text-left">
                        © {new Date().getFullYear()} XeShare. Bảo lưu mọi quyền.
                    </p>
                    <div className="flex gap-3 sm:gap-4">
                        <Link
                            href="/privacy"
                            className="text-xs text-muted-foreground hover:text-primary transition-colors">
                            Chính sách bảo mật
                        </Link>
                        <Link
                            href="/terms"
                            className="text-xs text-muted-foreground hover:text-primary transition-colors">
                            Điều khoản dịch vụ
                        </Link>
                    </div>
                </div>
                <div id="map"></div>
            </div>
        </footer>
    );
}
