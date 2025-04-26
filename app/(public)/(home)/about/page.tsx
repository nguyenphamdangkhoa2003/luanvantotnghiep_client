"use client";


import useWebsiteContent from "@/hooks/use-website-context";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import Image from "next/image";
import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
const socialIcons: { [key: string]: any } = {
  facebook: FaFacebook,
  linkedin: FaLinkedin,
  twitter: FaTwitter,
  instagram: FaInstagram,
};

const mockData = {
  about: {
    intro: {
      title: "Giới thiệu về XeShare",
      description:
        "XeShare là nền tảng đi chung xe hàng đầu, giúp bạn kết nối với những người cùng hành trình một cách dễ dàng và tiết kiệm. Chúng tôi cam kết mang đến trải nghiệm an toàn, tiện lợi và thân thiện với môi trường.",
      image: "/images/company-intro.jpg",
    },
    sections: [
      {
        id: 1,
        title: "Sứ mệnh của chúng tôi",
        content:
          "Chúng tôi mong muốn giảm thiểu khí thải carbon và thúc đẩy văn hóa đi chung xe, góp phần xây dựng một tương lai bền vững.",
      },
      {
        id: 2,
        title: "Tầm nhìn",
        content:
          "Trở thành nền tảng đi chung xe được yêu thích nhất tại Việt Nam, kết nối hàng triệu người dùng với những chuyến đi an toàn và tiết kiệm.",
      },
      {
        id: 3,
        title: "Giá trị cốt lõi",
        content:
          "An toàn, minh bạch, và thân thiện – đó là những giá trị mà XeShare luôn hướng tới trong mọi hoạt động.",
      },
    ],
    team: [
      {
        name: "Nguyễn Phạm Đăng Khoa",
        position: "Giám đốc điều hành",
        bio: "Với hơn 10 năm kinh nghiệm trong lĩnh vực công nghệ, An dẫn dắt XeShare với tầm nhìn chiến lược và đam mê đổi mới.",
        image: "https://randomuser.me/api/portraits/men/1.jpg",
        socialMedia: {
          facebook: "https://facebook.com/nguyenphamdangkhoa",
          linkedin: "https://linkedin.com/in/nguyenphamdangkhoa",
          twitter: "https://twitter.com/nguyenphamdangkhoa",
          instagram: "https://instagram.com/nguyenphamdangkhoa",
        },
      },
      {
        name: "Phạm Mạnh Tuấn",
        position: "Giám đốc marketing",
        bio: "Bình là một chuyên gia marketing sáng tạo, luôn mang đến những chiến dịch truyền thông ấn tượng cho XeShare.",
        image: "https://randomuser.me/api/portraits/men/1.jpg",
        socialMedia: {
          facebook: "https://facebook.com/phammanhtuan",
          linkedin: "https://linkedin.com/in/phammanhtuan",
          instagram: "https://instagram.com/phammanhtuan",
        },
      }
    ],
  },
};
export default function AboutPage() {
  // const { data } = useWebsiteContent();
  const data = mockData
  return (
    <div className="container mx-auto p-6 mt-20">
      <div className="w-5xl mx-auto mb-10">
        <h1 className="text-4xl font-bold mb-6 text-center">
          {data?.about.intro?.title}
        </h1>
        <p className="text-base text-center">
          {data?.about.intro?.description}
        </p>
      </div>
      <div className="flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 p-4">
          <div className="space-y-6">
            {data?.about.sections?.map((value, index) => (
              <div className="flex items-start" key={value.id}>
                <div
                  className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center
                    justify-center mr-4"
                >
                  {index + 1}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{value.title}</h2>
                  <p className="text-gray-600">{value.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="md:w-1/2 p-4">
          <div className="bg-gray-300 h-96 rounded-lg flex items-center justify-center overflow-hidden">
            <Image
              src={data?.about.intro?.image || "/images/default-image.jpg"}
              height={1024}
              width={768}
              alt="Ảnh công ty"
            />
          </div>
        </div>
      </div>
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          {/* Title */}
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Đội ngũ</h2>
          {/* Description */}
          <p className="text-gray-500 mb-12">
            Chúng tôi mang đến mọi lợi ích để đơn giản hóa việc hỗ trợ đi chung
            xe của bạn với XeShare, không gặp bất kỳ vấn đề nào thêm.
          </p>

          {/* Team Members Carousel */}
          <div className="flex justify-center space-x-8">
            {data?.about.team.map((member, index) => (
              <div
                key={index}
                className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-row"
              >
                {/* Image */}
                <div className="relative w-1/2">
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-l-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-l-lg">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                {/* Member Info */}
                <div className="w-2/3 p-4 text-left flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {member.name}
                    </h3>
                    <p className="text-sm text-primary">{member.position}</p>
                    <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
                    <p className="text-gray-600 mt-2 text-sm">{member.bio}</p>
                  </div>
                  {/* Social Icons */}
                  {member.socialMedia && (
                    <div className="flex space-x-4 mt-4">
                      {Object.entries(member.socialMedia).map(
                        ([platform, url], idx) =>
                          url && socialIcons[platform] ? (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100
                                hover:bg-gray-200"
                            >
                              {React.createElement(socialIcons[platform], {
                                className: "w-5 h-5 text-gray-600",
                              })}
                            </a>
                          ) : null,
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
