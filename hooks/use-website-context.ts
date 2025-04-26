'use client';

export default function useWebsiteContent() {
  const data = {
    footer: {
      phone: '0123 456 789',
      email: 'contact@xeshare.vn',
      address: '123 Đường Số 1, Quận 1, TP.HCM',
      links: [
        { name: 'Trang chủ', url: '/' },
        { name: 'Giới thiệu', url: '/about' },
        { name: 'Liên hệ', url: '/contact' },
        { name: 'Điều khoản dịch vụ', url: '/terms' },
      ],
      socialLinks: {
        facebook: 'https://facebook.com/xeshare',
        twitter: 'https://twitter.com/xeshare',
        instagram: 'https://instagram.com/xeshare',
        linkedin: 'https://linkedin.com/company/xeshare',
      },
    },
  };

  return { data };
}


// import { getContentQueryFn } from "@/api/websiteContent/websiteContent";
// import { useQuery } from "@tanstack/react-query";
// // Interface cho đội ngũ
// interface ITeamMember {
//   _id: string;
//   name: string;
//   position: string;
//   bio: string;
//   image?: string; // URL của ảnh từ Cloudinary
//   imagePublicId?: string; // public_id của ảnh trên Cloudinary
//   socialMedia?: {
//     facebook?: string;
//     linkedin?: string;
//     twitter?: string;
//     instagram?: string;
//   };
// }

// // Interface cho trang About
// export interface IAbout {
//   _id: string;
//   intro?: {
//     title: string;
//     description: string;
//     image?: string; // URL của ảnh từ Cloudinary
//     imagePublicId?: string; // public_id của ảnh trên Cloudinary
//   };
//   sections?: {
//     id: string;
//     title: string;
//     content: string;
//   }[];
//   team: ITeamMember[];
// }

// // Interface cho trang Contact
// interface IContact {
//   phone: string; // Số điện thoại
//   email: string; // Email
//   address: string; // Địa chỉ
//   googleMapUrl: string; // Đường dẫn Google Map
// }

// // Interface cho Footer
// interface IFooter {
//   phone: string;
//   email: string;
//   address: string;
//   socialLinks: {
//     facebook?: string | null;
//     linkedin?: string | null;
//     twitter?: string | null;
//     instagram?: string | null;
//   };
//   links: {
//     name: string;
//     url: string;
//   }[];
// }

// // Interface chính cho Website
// interface IWebsite {
//   contact: IContact;
//   about: IAbout;
//   footer: IFooter;
//   createdAt: Date;
//   updatedAt: Date;
//   isWebsiteShutdown: boolean;
// }

// const useWebsiteContent = () => {
//   const query = useQuery<IWebsite>({
//     queryKey: ["getWebsiteContent"],
//     queryFn: getContentQueryFn,
//     staleTime: Infinity,
//   });
//   return query;
// };

// export default useWebsiteContent;
