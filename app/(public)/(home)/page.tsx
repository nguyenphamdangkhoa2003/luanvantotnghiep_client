'use client';

import Banner from '@/components/layout/Banner';
import SearchTrip from '@/components/form/SearchTripForm';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { UserLocationContext } from '@/hooks/use-user-location-context';
import { IUserLocation } from '@/types/user-location';

export default function Home() {
    const [userLocation, setUserLocation] = useState<IUserLocation>();
    function getUserLocation() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    });
                },
                (error) => {
                    console.error('Error getting location: ', error.message);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }

    useEffect(() => {
        getUserLocation();
    }, []);
    return (
        <UserLocationContext.Provider value={{ userLocation, setUserLocation }}>
            <div className="md:pt-9 pt-7" suppressHydrationWarning>
                <Banner />

                <div className="mb-4">
                    <SearchTrip />
                </div>

                <div className="bg-[var(--secondary)] rounded-[var(--radius-xl)] p-8">
                    <div className="max-w-10/12 m-auto flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                        <div className="flex-shrink-0">
                            <Image
                                src="/images/carpool.png"
                                alt="Carpool"
                                width={250}
                                height={250}
                            />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--foreground)]">
                                Xe Share – Giải pháp đi chung xe tiện lợi & tiết
                                kiệm!
                            </h2>
                            <p className="text-[var(--muted-foreground)] text-lg mt-4 text-justify">
                                Xe Share là nền tảng kết nối những người có
                                tuyến đường di chuyển giống nhau, giúp họ dễ
                                dàng chia sẻ chuyến đi an toàn, tiện lợi và tiết
                                kiệm chi phí. Không chỉ giúp giảm kẹt xe và ô
                                nhiễm môi trường, Xe Share còn mang đến cơ hội
                                kết nối cộng đồng, tạo nên những hành trình thú
                                vị hơn mỗi ngày. 🚗💜
                            </p>
                        </div>
                    </div>
                </div>

                {/* Lợi ích */}
                <div className="mt-10 max-w-5xl mx-auto flex flex-col sm:flex-row-reverse items-center gap-8 text-center sm:text-left">
                    {/* Hình ảnh */}
                    <div className="flex justify-center sm:justify-end w-full sm:w-[35%]">
                        <Image
                            src="/images/carpool1.jpg"
                            alt="Carpooling"
                            width={350}
                            height={280}
                            className="rounded-[var(--radius-md)] w-full max-w-[350px] object-cover"
                        />
                    </div>

                    {/* Nội dung mở rộng */}
                    <div className="flex-1 md:pb-1 md:px-1 pb-5 px-6">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] text-center sm:text-left">
                            Lợi ích của việc đi chung xe
                        </h2>

                        <div className="mt-4">
                            <h3 className="text-lg font-semibold text-[var(--foreground)]">
                                Tiết kiệm chi phí:
                            </h3>
                            <p className="text-[var(--muted-foreground)]">
                                – Chia sẻ chi phí nhiên liệu, phí cầu đường,
                                giúp giảm đáng kể chi phí di chuyển hàng ngày.
                            </p>
                        </div>

                        <div className="mt-4">
                            <h3 className="text-lg font-semibold text-[var(--foreground)]">
                                Giảm kẹt xe & ô nhiễm:
                            </h3>
                            <p className="text-[var(--muted-foreground)]">
                                – Giảm số lượng xe trên đường, hạn chế ùn tắc và
                                cắt giảm khí thải, góp phần bảo vệ môi trường.
                            </p>
                        </div>

                        <div className="mt-4">
                            <h3 className="text-lg font-semibold text-[var(--foreground)]">
                                Kết nối người cùng tuyến:
                            </h3>
                            <p className="text-[var(--muted-foreground)]">
                                – Tạo cơ hội kết bạn, mở rộng mối quan hệ và
                                giúp hành trình trở nên thú vị hơn.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </UserLocationContext.Provider>
    );
}
