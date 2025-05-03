import { RevenueCard } from '@/components/card/RevenueCard';
import React from 'react';

function DashboardPage() {
    return (
        <div>
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                Dashboard
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {/* Card 1 - Doanh thu tháng */}
                <RevenueCard
                    title="Monthly Sales"
                    amount="$3,450.25"
                    changePercentage="+8.2%"
                    trendDirection="up"
                    description="Increased from last month"
                    footerText="Compared to $3,190.50 last month"
                />

                {/* Card 2 - Lượt truy cập */}
                <RevenueCard
                    title="Website Visits"
                    amount="12,489"
                    changePercentage="+24.7%"
                    trendDirection="up"
                    description="Traffic growing steadily"
                    footerText="1,023 new users this month"
                />

                {/* Card 3 - Tỷ lệ chuyển đổi */}
                <RevenueCard
                    title="Conversion Rate"
                    amount="3.6%"
                    changePercentage="-0.8%"
                    trendDirection="down"
                    description="Needs optimization"
                    footerText="Below 4% target rate"
                    className="border-red-100" // Thêm màu border cảnh báo
                />

                {/* Card 4 - Chi phí trung bình */}
                <RevenueCard
                    title="Avg. Order Value"
                    amount="$89.42"
                    changePercentage="+5.3%"
                    trendDirection="up"
                    description="Customers spending more"
                    footerText="Upselling strategy working"
                />
            </div>
        </div>
    );
}

export default DashboardPage;
