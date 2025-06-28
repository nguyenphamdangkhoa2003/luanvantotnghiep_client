'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col items-center px-4 py-12 max-w-4xl mx-auto min-h-screen">
      <Card className="w-full shadow-md border-[var(--border)] bg-[var(--card)]">
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl font-semibold text-[var(--foreground)]">
            Chính Sách Bảo Mật – XeShare
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 text-[var(--foreground)]">
          {/* Section 1: Mục Đích Thu Thập Dữ Liệu */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">1. Mục Đích Thu Thập Dữ Liệu</h2>
            <p className="text-base leading-relaxed">
              XeShare thu thập thông tin cá nhân từ người dùng nhằm:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>
                Xác minh danh tính, đảm bảo an toàn cho các giao dịch đặt xe đi
                chung.
              </li>
              <li>Liên lạc, hỗ trợ trong quá trình đặt chỗ, thương lượng.</li>
              <li>
                Nâng cao chất lượng dịch vụ, tối ưu hóa đề xuất tuyến đường.
              </li>
            </ul>
          </div>

          {/* Section 2: Loại Thông Tin Thu Thập */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">2. Loại Thông Tin Thu Thập</h2>
            <p className="text-base leading-relaxed">
              XeShare có thể thu thập:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>
                Thông tin đăng ký: Họ tên, email, số điện thoại, mật khẩu.
              </li>
              <li>
                Thông tin xác minh: Ảnh CCCD, giấy tờ xe (đối với tài xế).
              </li>
              <li>
                Thông tin giao dịch: Lịch sử đặt chuyến, tin nhắn thương lượng,
                gói dịch vụ đã mua.
              </li>
              <li>
                Dữ liệu kỹ thuật: Địa chỉ IP, loại thiết bị, cookies để hỗ trợ
                đăng nhập, phân tích hành vi người dùng.
              </li>
            </ul>
          </div>

          {/* Section 3: Phạm Vi Sử Dụng Thông Tin */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">3. Phạm Vi Sử Dụng Thông Tin</h2>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>Quản lý tài khoản, xác minh danh tính, phương tiện.</li>
              <li>
                Hiển thị thông tin cần thiết giữa tài xế & hành khách để thực
                hiện giao dịch (VD: số điện thoại, tên, biển số xe khi chuyến đi
                đã xác nhận).
              </li>
              <li>
                Gửi email thông báo về hoạt động tài khoản, xác thực, khôi phục
                mật khẩu.
              </li>
              <li>Liên lạc giải quyết khiếu nại, tranh chấp (nếu có).</li>
            </ul>
          </div>

          {/* Section 4: Bảo Mật & Lưu Trữ Dữ Liệu */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">4. Bảo Mật & Lưu Trữ Dữ Liệu</h2>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>
                XeShare áp dụng biện pháp kỹ thuật (mã hóa SSL, xác thực hai
                lớp) và quản trị (quy trình phân quyền) để bảo vệ dữ liệu.
              </li>
              <li>
                Dữ liệu được lưu trữ trên hệ thống máy chủ đặt tại Việt Nam.
              </li>
              <li>
                XeShare không chia sẻ thông tin cá nhân cho bên thứ ba, trừ khi
                có yêu cầu hợp pháp từ cơ quan chức năng hoặc được sự đồng ý của
                người dùng.
              </li>
            </ul>
          </div>

          {/* Section 5: Quyền Của Người Dùng */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">5. Quyền Của Người Dùng</h2>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>
                Người dùng có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa thông
                tin cá nhân trên hệ thống.
              </li>
              <li>
                Có thể yêu cầu XeShare ngừng xử lý dữ liệu cho mục đích tiếp
                thị.
              </li>
            </ul>
          </div>

          {/* Section 6: Thay Đổi Chính Sách */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">6. Thay Đổi Chính Sách</h2>
            <p className="text-base leading-relaxed">
              XeShare có thể cập nhật chính sách bảo mật để phù hợp quy định
              pháp luật. Bản cập nhật sẽ được đăng trên website. Người dùng tiếp
              tục sử dụng dịch vụ nghĩa là đồng ý với chính sách mới.
            </p>
          </div>

          {/* Section 7: Liên Hệ */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">7. Liên Hệ</h2>
            <p className="text-base leading-relaxed">
              Mọi câu hỏi hoặc yêu cầu về bảo mật, vui lòng liên hệ:
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
