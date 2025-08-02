'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone } from 'lucide-react'

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
            <p className="text-base leading-relaxed">
              Bằng việc đăng ký và sử dụng nền tảng XeShare, bạn xác nhận đã
              đọc, hiểu và đồng ý bị ràng buộc bởi các điều khoản dưới đây. Nếu
              không đồng ý, vui lòng ngừng sử dụng dịch vụ.
            </p>
          </div>

          {/* Section 2: Tài Khoản & Nghĩa Vụ Người Dùng */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              2. Tài Khoản & Nghĩa Vụ Người Dùng
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>Người dùng phải cung cấp thông tin chính xác khi đăng ký.</li>
              <li>
                Người dùng chịu trách nhiệm bảo mật tài khoản cá nhân, không
                chia sẻ cho bên thứ ba.
              </li>
              <li>
                Tài xế phải xác minh danh tính và phương tiện trước khi đăng
                tuyến.
              </li>
            </ul>
          </div>

          {/* Section 3: Bản Chất Dịch Vụ */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">3. Bản Chất Dịch Vụ</h2>
            <p className="text-base leading-relaxed">
              XeShare là nền tảng trung gian kết nối giữa tài xế và hành khách.
              Không cung cấp dịch vụ vận tải thương mại. Tài xế và hành khách tự
              thỏa thuận giá, thời gian và điểm đón/trả.
            </p>
          </div>

          {/* Section 4: Hành Vi Bị Cấm */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">4. Hành Vi Bị Cấm</h2>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>
                Dùng nền tảng để vận tải thương mại (xe biển vàng, xe hợp đồng).
              </li>
              <li>Tạo tài khoản giả, thông tin sai sự thật.</li>
              <li>Spam, phát tán mã độc, quấy rối người dùng khác.</li>
            </ul>
          </div>

          {/* Section 5: Trách Nhiệm & Miễn Trừ */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">5. Trách Nhiệm & Miễn Trừ</h2>
            <p className="text-base leading-relaxed">
              XeShare không chịu trách nhiệm cho tai nạn, thương tích, mất mát,
              trễ giờ hay mâu thuẫn giữa tài xế và hành khách. Người dùng phải
              tự đảm bảo an toàn cá nhân.
            </p>
          </div>

          {/* Section 6: Gói Dịch Vụ */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">6. Gói Dịch Vụ</h2>
            <p className="text-base leading-relaxed">
              Tài xế có thể mua gói để mở rộng tính năng. Phí không hoàn lại trừ
              khi có lỗi hệ thống. XeShare có quyền điều chỉnh chính sách gói &
              giá, có thông báo trước.
            </p>
          </div>

          {/* Section 7: Bảo Hiểm & Pháp Luật */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              7. Bảo Hiểm & Quy Định Pháp Luật
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>Tài xế cần có bảo hiểm trách nhiệm dân sự còn hiệu lực.</li>
              <li>Khuyến khích tham gia bảo hiểm tai nạn cho hành khách.</li>
              <li>Mọi hoạt động phải tuân thủ luật Giao thông Việt Nam.</li>
            </ul>
          </div>

          {/* Section 8: Xử Lý Vi Phạm */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">8. Xử Lý Vi Phạm</h2>
            <p className="text-base leading-relaxed">
              XeShare có quyền khoá tài khoản vi phạm mà không cần báo trước.
              Không hoàn tiền với trường hợp bị khóa do vi phạm.
            </p>
          </div>

          {/* Section 9: Giải Quyết Tranh Chấp */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">9. Giải Quyết Tranh Chấp</h2>
            <p className="text-base leading-relaxed">
              Tranh chấp sẽ được thương lượng trước. Nếu không thành, sẽ đưa ra
              Tòa án tại TP.HCM theo pháp luật Việt Nam.
            </p>
          </div>

          {/* Section 10: Thay Đổi Điều Khoản */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">10. Thay Đổi Điều Khoản</h2>
            <p className="text-base leading-relaxed">
              XeShare có thể sửa đổi điều khoản bất cứ lúc nào. Tiếp tục sử dụng
              dịch vụ nghĩa là bạn đồng ý với các điều khoản đã cập nhật.
            </p>
          </div>

          {/* Section 11: Liên Hệ */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">11. Liên Hệ</h2>
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
        </CardContent>
      </Card>
    </div>
  )
}
