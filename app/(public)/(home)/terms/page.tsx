'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TermsOfService() {
  return (
    <div className="flex flex-col items-center px-4 py-12 max-w-4xl mx-auto min-h-screen">
      <Card className="w-full shadow-md border-[var(--border)] bg-[var(--card)]">
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl font-semibold text-[var(--foreground)]">
            Điều Khoản Dịch Vụ – XeShare
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 text-[var(--foreground)]">
          {/* Section 1: Chấp Nhận Điều Khoản */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">1. Chấp Nhận Điều Khoản</h2>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>
                Bằng việc đăng ký và sử dụng XeShare, bạn xác nhận đã đọc, hiểu
                và đồng ý bị ràng buộc bởi các điều khoản này.
              </li>
              <li>Nếu không đồng ý, vui lòng ngưng sử dụng dịch vụ.</li>
            </ul>
          </div>

          {/* Section 2: Tài Khoản & Nghĩa Vụ Người Dùng */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              2. Tài Khoản & Nghĩa Vụ Người Dùng
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>
                Người dùng phải cung cấp thông tin chính xác, chịu trách nhiệm
                bảo mật tài khoản.
              </li>
              <li>Không được chia sẻ thông tin đăng nhập cho bên thứ ba.</li>
            </ul>
          </div>

          {/* Section 3: Dịch Vụ XeShare */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">3. Dịch Vụ XeShare</h2>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>
                XeShare cung cấp nền tảng trung gian kết nối, không trực tiếp
                cung cấp dịch vụ vận chuyển.
              </li>
              <li>
                Tài xế và hành khách tự thỏa thuận giá, thời gian, địa điểm
                đón/trả.
              </li>
            </ul>
          </div>

          {/* Section 4: Hành Vi Bị Cấm */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">4. Hành Vi Bị Cấm</h2>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>
                Sử dụng XeShare để cung cấp dịch vụ vận tải thương mại (VD: xe
                biển vàng, xe hợp đồng).
              </li>
              <li>Tạo tài khoản giả, cung cấp thông tin sai sự thật.</li>
              <li>
                Quấy rối, spam, phát tán mã độc, gây thiệt hại cho hệ thống hoặc
                người dùng khác.
              </li>
            </ul>
          </div>

          {/* Section 5: Trách Nhiệm & Miễn Trừ */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">5. Trách Nhiệm & Miễn Trừ</h2>
            <p className="text-base leading-relaxed">
              XeShare không chịu trách nhiệm cho:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>
                Tai nạn, thiệt hại tài sản, thương tích xảy ra trong quá trình
                đi chung.
              </li>
              <li>
                Sự chậm trễ hoặc vi phạm thỏa thuận giữa tài xế & hành khách.
              </li>
            </ul>
            <p className="text-base leading-relaxed">
              Người dùng tự chịu trách nhiệm kiểm tra thông tin, giữ liên lạc và
              đảm bảo an toàn cá nhân.
            </p>
          </div>

          {/* Section 6: Thanh Toán Gói Dịch Vụ */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">6. Thanh Toán Gói Dịch Vụ</h2>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>
                Tài xế có thể mua gói để mở rộng tính năng. Phí đã thanh toán
                không hoàn lại, trừ khi lỗi hệ thống gây thiệt hại rõ rệt.
              </li>
              <li>
                XeShare có quyền điều chỉnh giá, chính sách gói và sẽ thông báo
                trước.
              </li>
            </ul>
          </div>

          {/* Section 7: Xử Lý Vi Phạm */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">7. Xử Lý Vi Phạm</h2>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>
                XeShare có quyền khóa tài khoản vi phạm mà không cần báo trước
                nếu phát hiện vi phạm điều khoản.
              </li>
              <li>Không hoàn tiền với trường hợp khóa do vi phạm.</li>
            </ul>
          </div>

          {/* Section 8: Giải Quyết Tranh Chấp */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">8. Giải Quyết Tranh Chấp</h2>
            <p className="text-base leading-relaxed">
              Mọi tranh chấp trước tiên sẽ được thương lượng. Nếu không thành,
              sẽ được giải quyết tại Tòa án có thẩm quyền tại TP.HCM, tuân theo
              luật Việt Nam.
            </p>
          </div>

          {/* Section 9: Thay Đổi Điều Khoản */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">9. Thay Đổi Điều Khoản</h2>
            <p className="text-base leading-relaxed">
              XeShare có quyền sửa đổi điều khoản bất cứ lúc nào. Các sửa đổi sẽ
              có hiệu lực kể từ khi đăng trên website. Việc tiếp tục sử dụng
              dịch vụ sau khi thay đổi đồng nghĩa chấp nhận điều khoản mới.
            </p>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Liên Hệ</h2>
            <p className="text-base leading-relaxed">
              Mọi câu hỏi hoặc yêu cầu về dịch vụ, vui lòng liên hệ:
            </p>
            <ul className="list-none pl-0 space-y-3 text-base">
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[var(--primary)]" />
                <a
                  href="mailto:support@xeshare.vn"
                  className="text-[var(--primary)] hover:underline"
                >
                  support@xeshare.vn
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[var(--primary)]" />
                <span>1900.xxx.xxx</span>
              </li>
            </ul>
          </div>

          {/* Contact Button */}
          <div className="pt-4">
            <Button
              asChild
              className="w-full sm:w-auto bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
            >
              <a href="mailto:support@xeshare.vn">Liên Hệ Hỗ Trợ</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
