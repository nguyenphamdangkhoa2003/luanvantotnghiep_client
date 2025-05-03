export const getInitials = (name?: string | null) => {
    if (!name) return 'US';
    const names = name.split(' ');
    return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : name.substring(0, 2).toUpperCase();
};

export function formatVietnamDateTime(isoDate: string): string {
    const date = new Date(isoDate);
    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // Sử dụng định dạng 24 giờ
    };
    return date.toLocaleString('vi-VN', options).replace(',', '');
}
