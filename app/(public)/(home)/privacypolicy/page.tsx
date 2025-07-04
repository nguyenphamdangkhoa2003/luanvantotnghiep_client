;
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, Facebook } from 'lucide-react';


export default function TermsOfService() {
  return (
    <div className="flex flex-col items-center px-4 py-12 max-w-4xl mx-auto min-h-screen">
      <Card className="w-full shadow-md border-[var(--border)] bg-[var(--card)]">
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl font-semibold text-[var(--foreground)]">
            Chính Sách & Điều Khoản Sử Dụng – XeShare
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 text-[var(--foreground)]">
          {/* Section 1: Giới Thiệu Chung */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">1. Giới Thiệu Chung</h2>
            <p className="text-base leading-relaxed">
              Website XeShare là nền tảng kết nối giữa các cá nhân có phương tiện cá nhân (tài xế) và những người có nhu cầu đi chung xe (hành khách) trên các tuyến đường trùng nhau. Mục tiêu của XeShare là chia sẻ chỗ trống, tiết kiệm chi phí, giảm ùn tắc giao thông và bảo vệ môi trường. XeShare không phải là nền tảng vận tải thương mại, và không cho phép xe biển vàng (xe kinh doanh) hoạt động.
            </p>
          </div>

          {/* Section 2: Phạm Vi Áp Dụng */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">2. Phạm Vi Áp Dụng</h2>
            <p className="text-base leading-relaxed">
              Chính sách này áp dụng cho tất cả người dùng truy cập, đăng ký, sử dụng các dịch vụ trên website XeShare, bao gồm tài xế, hành khách và quản trị viên.
            </p>
          </div>

          {/* Section 3: Điều Khoản Về Người Dùng */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">3. Điều Khoản Về Người Dùng</h2>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">3.1. Đăng ký và Xác thực Tài khoản</h3>
              <ul className="list-disc pl-6 space-y-2 text-base">
                <li>Người dùng phải cung cấp thông tin chính xác, bao gồm email, mật khẩu và xác minh tài khoản qua email.</li>
                <li>Tài xế bắt buộc xác minh danh tính (CCCD, bằng lái xe) và đăng ký thông tin phương tiện trước khi hoạt động.</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">3.2. Bảo mật thông tin cá nhân</h3>
              <ul className="list-disc pl-6 space-y-2 text-base">
                <li>XeShare cam kết bảo mật dữ liệu người dùng, không chia sẻ cho bên thứ ba nếu không có sự đồng ý.</li>
                <li>Người dùng có quyền chỉnh sửa hoặc xóa thông tin cá nhân trong tài khoản.</li>
              </ul>
            </div>
          </div>

          {/* Section 4: Chính Sách Về Tuyến Đường và Đặt Chuyến */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">4. Chính Sách Về Tuyến Đường và Đặt Chuyến</h2>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">4.1. Đối với tài xế</h3>
              <ul className="list-disc pl-6 space-y-2 text-base">
                <li>Chỉ được phép đăng ký tuyến đường cố định, trùng lịch di chuyển cá nhân hằng ngày hoặc định kỳ.</li>
                <li>Không được sử dụng XeShare để phục vụ mục đích kinh doanh vận tải.</li>
                <li>Phải đảm bảo phương tiện đăng ký là xe biển trắng (phi thương mại).</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">4.2. Đối với hành khách</h3>
              <ul className="list-disc pl-6 space-y-2 text-base">
                <li>Có thể tìm kiếm, đặt chỗ và đặt trước chuyến đi.</li>
                <li>Có quyền thương lượng và huỷ yêu cầu nếu không đạt thỏa thuận với tài xế.</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">4.3. Thương lượng giá cả</h3>
              <ul className="list-disc pl-6 space-y-2 text-base">
                <li>Giá cả là thỏa thuận riêng giữa tài xế và hành khách qua kênh chat tích hợp.</li>
                <li>XeShare không can thiệp và không chịu trách nhiệm pháp lý liên quan đến mức giá được thương lượng.</li>
              </ul>
            </div>
          </div>

          {/* Section 5: Giao Dịch và Thanh Toán */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">5. Giao Dịch và Thanh Toán</h2>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>XeShare tích hợp cổng thanh toán cho các gói dịch vụ tùy chọn của tài xế (nhằm duy trì hệ thống, không mang tính phí hoa hồng).</li>
              <li>Tài xế có thể gia hạn gói dịch vụ, nhưng việc sử dụng gói không làm thay đổi bản chất phi thương mại của nền tảng.</li>
            </ul>
          </div>

          {/* Section 6: Hành Vi Bị Cấm */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">6. Hành Vi Bị Cấm</h2>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>Sử dụng nền tảng cho mục đích thương mại, vận tải chuyên nghiệp hoặc các mục đích trái pháp luật.</li>
              <li>Đăng ký thông tin giả mạo, spam, quấy rối, hoặc hành vi gây mất an toàn cho người dùng khác.</li>
              <li>Vi phạm có thể dẫn đến khóa tài khoản vĩnh viễn mà không hoàn tiền.</li>
            </ul>
          </div>

          {/* Section 7: Giới Hạn Trách Nhiệm */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">7. Giới Hạn Trách Nhiệm</h2>
            <p className="text-base leading-relaxed">
              XeShare không phải bên cung cấp dịch vụ vận chuyển, và không chịu trách nhiệm pháp lý liên quan đến:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>Tai nạn, trễ giờ, tranh chấp cá nhân giữa tài xế và hành khách.</li>
              <li>Mức giá thỏa thuận, hành vi lái xe hay điều kiện phương tiện.</li>
            </ul>
            <p className="text-base leading-relaxed">
              Người dùng tự chịu trách nhiệm về quyết định và hành vi trong quá trình sử dụng.
            </p>
          </div>

          {/* Section 8: Thay Đổi Chính Sách */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">8. Thay Đổi Chính Sách</h2>
            <ul className="list-disc pl-6 space-y-2 text-base">
              <li>XeShare có quyền cập nhật chính sách mà không cần báo trước.</li>
              <li>Những thay đổi sẽ được thông báo trên trang chính sách, người dùng tiếp tục sử dụng sau cập nhật đồng nghĩa với việc chấp thuận.</li>
            </ul>
          </div>

          {/* Section 9: Liên Hệ và Hỗ Trợ */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">9. Liên Hệ và Hỗ Trợ</h2>
            <p className="text-base leading-relaxed">
              Mọi thắc mắc, khiếu nại hoặc đề xuất liên hệ:
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
                <Facebook className="w-5 h-5 text-[var(--primary)]" />
                <a
                  href="https://facebook.com/xeshare"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] hover:underline"
                >
                  facebook.com/xeshare
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
  );
}

