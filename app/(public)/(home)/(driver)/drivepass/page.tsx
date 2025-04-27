import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const packages = [
  {
    name: "Gói Ngày",
    price: "15.000",
    period: "ngày",
    features: [
      "Hỗ trợ đặt chuyến cơ bản",
      "Hỗ trợ khách hàng 24/7",
      "Báo cáo thu nhập hàng ngày",
    ],
    popular: false,
  },
  {
    name: "Gói Tháng",
    price: "99.000",
    period: "tháng",
    features: [
      "Hỗ trợ đặt chuyến nâng cao",
      "Báo cáo thu nhập hàng tháng",
      "Hỗ trợ khách hàng 24/7",
      "Ưu tiên phân bổ chuyến",
    ],
    popular: true,
  },
  {
    name: "Gói Năm",
    price: "999.000",
    period: "năm",
    features: [
      "Tất cả tính năng Gói Tháng",
      "Phân tích dữ liệu hiệu suất",
      "Hỗ trợ quản lý đội xe",
      "Bảo hiểm tai nạn cá nhân",
    ],
    popular: false,
  },
];

export default function DrivePass() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Chọn Gói Dịch Vụ <span className="text-indigo-600">DrivePass</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nâng cao trải nghiệm lái xe và tối ưu thu nhập với các gói dịch vụ đa dạng
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <div key={index} className="relative">
              {pkg.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                  PHỔ BIẾN
                </div>
              )}
              
              <Card className={`h-full flex flex-col transition-all duration-300 hover:shadow-xl ${pkg.popular ? "border-2 border-indigo-600" : "border border-gray-200"} rounded-xl`}>
                <CardHeader className="pb-4">
                  <CardTitle className={`text-2xl font-bold text-center ${pkg.popular ? "text-indigo-600" : "text-gray-800"}`}>
                    {pkg.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="px-6 flex-grow">
                  <div className="text-center mb-6">
                    <div className="flex justify-center items-baseline">
                      <span className="text-4xl font-bold text-gray-900">{pkg.price}</span>
                      <span className="ml-1 text-lg text-gray-500">VNĐ/{pkg.period}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-3">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="justify-center pb-6 pt-4">
                  <Button
                    size="lg"
                    className={`w-full h-12 text-base font-semibold ${pkg.popular ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-800 hover:bg-gray-900"} text-white rounded-lg transition-all duration-200`}
                  >
                    Đăng ký ngay
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center text-gray-600">
          <p className="mb-4">Không chắc chắn nên chọn gói nào?</p>
          <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold px-6 py-2 rounded-lg">
            Liên hệ tư vấn
          </Button>
        </div>
      </div>
    </div>
  );
}