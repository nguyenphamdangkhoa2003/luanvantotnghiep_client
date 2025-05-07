'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { toast } from 'sonner';

// Component imports
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { UserDetailDataTable } from '@/app/admin/users/[id]/UserDetailTableData';
import { PersonInformationForm } from '@/components/form/PersonInformationForm';
import { UploadButton } from '@/components/button/ButtonUpload';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import PasswordDialog, {
    setPasswordFormSchema,
} from '@/components/dialog/PasswordDialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icon imports
import { FaArrowLeftLong } from 'react-icons/fa6';
import { FaBan, FaRegEdit } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { TbLock } from 'react-icons/tb';
import { AlertCircle, MoreHorizontal, Trash } from 'lucide-react';
import { CiMail, CiWarning } from 'react-icons/ci';
import { MdOutlineVerified } from 'react-icons/md';
import { FaGithub } from 'react-icons/fa';

// Utility imports
import { getInitials } from '@/utils';
import { ColumnDef } from '@tanstack/react-table';
import { EmailFormDialog } from '@/components/dialog/EmailFormDialog';
import { ConfirmDialog } from '@/components/dialog/ConfirmDialog';
// import { useMutation, useQuery } from '@tanstack/react-query';
// import {
//     getUserByIdQueryFn,
//     removeAvatarUserByIdMuatationFn,
//     setAvatarUserByIdMuatationFn,
//     setPasswordUserByIdMuatationFn,
//     updateUserMutationFn,
// } from '@/api/users/user';
import { UserType } from '@/context/auth-provider';
import { RoleEnum } from '@/types/enum';
import { useErrorAlert } from '@/components/dialog/ErrorAlertDiglog';

interface UserEmail {
    id: string;
    emailAddress: string;
    verification: boolean;
}

interface ExternalAccount {
    id: string;
    provider: string;
    username: string;
    emailAddress: string;
}

// Mock data
const mockUserData: UserType = {
    _id: '1',
    email: 'john.doe@example.com',
    familyName: 'Doe',
    givenName: 'John',
    role: RoleEnum.DRIVER,
    banned: false,
    isEmailVerified: true,
    passwordEnable: true,
    deleteSelfEnabled: true,
    hasImage: true,
    avatar: {
        url: 'https://via.placeholder.com/150'
    },
    identityVerified: 'pending',
    driverInfo: {
        idPortraitImage: 'https://via.placeholder.com/200',
        extractedIdNumber: '123456789012',
        extractedFullName: 'John Doe',
        extractedDob: '1990-01-01',
        extractedGender: 'Male',
        extractedAddress: '123 Main St, Hanoi, Vietnam',
        extractedLicenseNumber: '987654321',
        extractedLicenseClass: 'B2',
        extractedLicenseIssueDate: '2020-01-01',
        extractedLicenseExpiryDate: '2030-01-01',
        extractedLicensePlace: 'Hanoi',
        extractedPlateNumber: '29A-12345',
        extractedVehicleOwner: 'John Doe',
        extractedVehicleType: 'Car',
        extractedVehicleBrand: 'Toyota',
        extractedVehicleChassisNumber: 'CH123456',
        extractedVehicleEngineNumber: 'EN123456',
        extractedVehicleRegistrationDate: '2022-01-01',
    },
};

export default function UserPage({ params }: any) {
    const router = useRouter();
    const { showError, ErrorAlertComponent } = useErrorAlert();
    const [userData, setUserData] = useState<UserType | null>(null);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const unwrapParams: { id: string } = use(params);
    const id = unwrapParams.id;

    // Mock API logic
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setUserData(mockUserData);
            setIsLoading(false);
        }, 1000);
    }, []);

    // const getUserByIdQuery = useQuery({
    //     queryKey: [id],
    //     queryFn: () => getUserByIdQueryFn(id),
    // });

    // const setPasswordUserByIdMutation = useMutation({
    //     mutationFn: setPasswordUserByIdMuatationFn,
    //     onSuccess: (data) => {
    //         toast.success('Cập nhật mật khẩu thành công');
    //         getUserByIdQuery.refetch();
    //     },
    //     onError: () => toast.error('Xảy ra lỗi không xác định'),
    // });
    // const setAvatarUserByIdMutation = useMutation({
    //     mutationFn: setAvatarUserByIdMuatationFn,
    // });
    // const removeAvatarUserByIdMutation = useMutation({
    //     mutationFn: removeAvatarUserByIdMuatationFn,
    //     onSuccess: () => {
    //         toast.success('Xoá ảnh thành công');
    //         getUserByIdQuery.refetch();
    //     },
    //     onError: () => {
    //         showError({
    //             title: 'Lỗi ',
    //             message: 'Lỗi trong quá trình xoá ảnh hình ảnh',
    //         });
    //     },
    // });
    // useEffect(() => {
    //     setUserData(getUserByIdQuery.data);
    // }, [getUserByIdQuery.data]);

    const handleBack = () => router.back();

    if (isLoading)
        return (
            <div className="container mx-auto p-4 space-y-6 bg-background">
                <Skeleton className="h-10 w-32" />
                <div className="flex items-center gap-4 bg-card p-6 rounded-lg shadow border-border">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <div className="bg-card border-border p-6 rounded-lg">
                        <Skeleton className="h-6 w-48 mb-4" />
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-20 w-20 rounded-full" />
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                        <div className="mt-4 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    if (isError)
        return (
            <div className="container mx-auto p-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription className="text-destructive-foreground">
                        Failed to load user data
                    </AlertDescription>
                    <div className="mt-4 flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            className="border-border text-foreground hover:bg-muted">
                            Go Back
                        </Button>
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-primary text-primary-foreground hover:bg-primary/90">
                            Retry
                        </Button>
                    </div>
                </Alert>
            </div>
        );
    if (!userData) {
        return (
            <div className="container mx-auto p-4 bg-background">
                <div className="flex flex-col items-center justify-center space-y-4 text-center p-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground" />
                    <h2 className="text-2xl font-bold text-foreground">
                        Không tìm thấy người dùng
                    </h2>
                    <p className="text-muted-foreground">
                        Người dùng không được tìm thấy hoặc đã bị xoá
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            className="border-border text-foreground hover:bg-muted">
                            Quay lại
                        </Button>
                        <Button
                            onClick={() => router.push('/admin/users')}
                            className="bg-primary text-primary-foreground hover:bg-primary/90">
                            Xem tất cả người dùng
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const angelina = [
        {
            id: '1',
            emailAddress: 'angelina@gmail.com',
            verification: true,
        },
        {
            id: '2',
            emailAddress: 'angelina@outlook.com',
            verification: false,
        },
    ];

    const fullName =
        `${userData.familyName || ''} ${userData.givenName || ''}`.trim() ||
        'Username';

    const isDriver = userData.role === RoleEnum.DRIVER;
    const handleToggleDeleteSelf = () => {
        setUserData((prev) =>
            prev ? { ...prev, deleteSelfEnabled: !prev.deleteSelfEnabled } : null
        );
    };
    const handleSetPassword = (data: {
        password: string;
        confirm_password: string;
        sign_out_of_other_sessions: boolean;
    }) => {
        // const { confirm_password, ...dataForm } = data;
        // setPasswordUserByIdMutation.mutate({
        //     userId: id,
        //     data: dataForm,
        // });
        toast.success('Cập nhật mật khẩu thành công (mock)');
        setUserData((prev) =>
            prev ? { ...prev, passwordEnable: true } : null
        );
    };

    return (
        <div className="container mx-auto p-4 space-y-6 bg-background text-foreground">
            <Button
                variant="ghost"
                onClick={handleBack}
                className="flex items-center gap-2 text-foreground hover:bg-muted">
                <FaArrowLeftLong /> Users
            </Button>

            <div className="flex items-center gap-4 bg-card p-6 rounded-lg shadow border-border">
                <Avatar className="h-20 w-20">
                    {userData.hasImage && (
                        <AvatarImage src={userData.avatar.url} alt={fullName} />
                    )}
                    <AvatarFallback className="bg-muted text-muted-foreground">
                        {getInitials(fullName)}
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-card-foreground">
                            {fullName}
                        </h2>
                        {userData.banned && (
                            <div className="text-sm text-destructive flex items-center gap-1 font-bold">
                                <FaBan /> Banned
                            </div>
                        )}
                    </div>
                    <p className="text-muted-foreground">{userData.email}</p>
                    <p className="text-sm text-primary">
                        Role: {userData.role}
                    </p>
                </div>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="bg-muted text-muted-foreground">
                    <TabsTrigger
                        value="profile"
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Profile
                    </TabsTrigger>
                    <TabsTrigger
                        value="settings"
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Settings
                    </TabsTrigger>
                    {isDriver && (
                        <TabsTrigger
                            value="driver"
                            className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                            Driver
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-card-foreground">
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    {userData.hasImage && (
                                        <AvatarImage
                                            src={userData.avatar.url}
                                            alt={fullName}
                                        />
                                    )}
                                    <AvatarFallback className="bg-muted text-muted-foreground">
                                        {getInitials(fullName)}
                                    </AvatarFallback>
                                </Avatar>
                                {/* <UploadButton
                                    onUpload={() => setava}
                                    isUploading={isLoading}
                                /> */}
                                <ConfirmDialog
                                    title="Delete profile image"
                                    description="Are you sure you want to delete this user's profile image?"
                                    confirmText="Delete profile image"
                                    onConfirm={() => {
                                        // removeAvatarUserByIdMutation.mutate(userData._id);
                                        // toast.success('Xoá ảnh thành công (mock)');
                                        // setUserData((prev) =>
                                        //     prev
                                        //         ? { ...prev, hasImage: false, avatar: { url: '' } }
                                        //         : null
                                        // );
                                    }}>
                                    <Button
                                        variant="outline"
                                        className="border-border text-foreground hover:bg-muted cursor-pointer">
                                        Clear
                                    </Button>
                                </ConfirmDialog>
                            </div>
                            <PersonInformationForm
                                // refech={getUserByIdQuery.refetch}
                                refech={() => setUserData(mockUserData)}
                                id={id}
                                initialValues={{
                                    familyName: userData.familyName || '',
                                    givenName: userData.givenName || '',
                                }}
                            />
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-card-foreground">
                                Email Addresses
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <div className="flex items-center gap-2 p-2">
                                    <CiMail className="text-muted-foreground" />
                                    <span className="font-medium text-muted-foreground">
                                        {userData.email}
                                    </span>
                                    {userData.isEmailVerified ? (
                                        <MdOutlineVerified className="text-green-500" />
                                    ) : (
                                        <CiWarning className="text-chart-2" />
                                    )}
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4 text-foreground" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="bg-card text-card-foreground">
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setUserData((prev) =>
                                                    prev
                                                        ? {
                                                              ...prev,
                                                              isEmailVerified: !prev.isEmailVerified,
                                                          }
                                                        : null
                                                );
                                            }}
                                            className="text-foreground hover:bg-muted">
                                            Mark as
                                            {userData.isEmailVerified
                                                ? 'unverified'
                                                : 'verified'}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            {angelina.map((email) => (
                                <div key={email.id} className="flex justify-between">
                                    <div className="flex items-center gap-2 p-2">
                                        <CiMail className="text-muted-foreground" />
                                        <span className="font-medium text-muted-foreground">
                                            {email.emailAddress}
                                        </span>
                                        {email.verification ? (
                                            <MdOutlineVerified className="text-green-500" />
                                        ) : (
                                            <CiWarning className="text-chart-2" />
                                        )}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4 text-foreground" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="bg-card text-card-foreground">
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    // handleToggleEmailVerification(email.id)
                                                    const updatedAngelina = angelina.map((e) =>
                                                        e.id === email.id
                                                            ? { ...e, verification: !e.verification }
                                                            : e
                                                    );
                                                    // Update state if needed
                                                    toast.success(
                                                        `Email marked as ${
                                                            !email.verification ? 'verified' : 'unverified'
                                                        } (mock)`
                                                    );
                                                }}
                                                className="text-foreground hover:bg-muted">
                                                Mark as
                                                {email.verification ? 'unverified' : 'verified'}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-card-foreground">
                                Password
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {userData.passwordEnable ? (
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-2 items-center">
                                        <TbLock className="text-foreground" />
                                        <span className="text-muted-foreground">
                                            ••••••••••
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsPasswordDialogOpen(true)}
                                        className="text-foreground hover:bg-muted">
                                        <FaRegEdit />
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="bg-muted text-center p-3 text-muted-foreground">
                                        No password set
                                    </div>
                                    <Button
                                        variant="link"
                                        onClick={() => setIsPasswordDialogOpen(true)}
                                        className="text-primary hover:text-primary/80">
                                        + Set password
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-card-foreground">
                                User permissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    onChange={handleToggleDeleteSelf}
                                    checked={userData.deleteSelfEnabled}
                                    className="sr-only peer"
                                />
                                <div className="relative w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-background after:border-border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                <span className="ms-3 text-sm font-medium text-foreground">
                                    Allow user delete to their account
                                </span>
                            </label>
                        </CardContent>
                    </Card>
                </TabsContent>

                {isDriver && (
                    <TabsContent value="driver" className="mt-4">
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-xl text-card-foreground">
                                        Thông tin tài xế
                                    </CardTitle>
                                    {userData.identityVerified !== 'verified' && (
                                        <ConfirmDialog
                                            title="Xác minh danh tính"
                                            description="Bạn có chắc chắn muốn xác minh danh tính cho tài xế này không?"
                                            confirmText="Xác minh"
                                            cancelText="Hủy"
                                            onConfirm={() => {
                                                setTimeout(() => {
                                                    setUserData((prev) =>
                                                        prev
                                                            ? { ...prev, identityVerified: 'verified' }
                                                            : null
                                                    );
                                                    toast.success('Đã xác minh danh tính tài xế (mock)');
                                                }, 1000);
                                            }}>
                                            <Button
                                                variant="outline"
                                                className="flex items-center gap-2 border-border text-foreground hover:bg-muted">
                                                <MdOutlineVerified className="h-4 w-4" />
                                                Xác minh danh tính
                                            </Button>
                                        </ConfirmDialog>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Card CCCD */}
                                    <Card className="bg-card border-border">
                                        <CardHeader>
                                            <CardTitle className="text-lg text-card-foreground">
                                                Căn cước công dân
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <Card className="h-fit bg-card border-border">
                                                    <CardHeader>
                                                        <CardTitle className="text-sm font-medium text-card-foreground">
                                                            Ảnh chân dung
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {userData.driverInfo?.idPortraitImage ? (
                                                            <img
                                                                src={userData.driverInfo.idPortraitImage}
                                                                alt="Ảnh CCCD"
                                                                className="w-full h-auto rounded-md border border-border"
                                                            />
                                                        ) : (
                                                            <div className="text-muted-foreground">
                                                                Không có ảnh
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                                <div className="md:col-span-2 space-y-4">
                                                    <Card className="bg-card border-border">
                                                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Số CCCD
                                                                </p>
                                                                <p className="font-medium text-card-foreground">
                                                                    {userData.driverInfo?.extractedIdNumber ||
                                                                        'Chưa có dữ liệu'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Họ và tên
                                                                </p>
                                                                <p className="font-medium text-card-foreground">
                                                                    {userData.driverInfo?.extractedFullName ||
                                                                        'Chưa có dữ liệu'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Ngày sinh
                                                                </p>
                                                                <p className="font-medium text-card-foreground">
                                                                    {userData.driverInfo?.extractedDob ||
                                                                        'Chưa có dữ liệu'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Giới tính
                                                                </p>
                                                                <p className="font-medium text-card-foreground">
                                                                    {userData.driverInfo?.extractedGender ||
                                                                        'Chưa có dữ liệu'}
                                                                </p>
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <p className="text-sm text-muted-foreground">
                                                                    Địa chỉ
                                                                </p>
                                                                <p className="font-medium text-card-foreground">
                                                                    {userData.driverInfo?.extractedAddress ||
                                                                        'Chưa có dữ liệu'}
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    {/* Card GPLX */}
                                    <Card className="bg-card border-border">
                                        <CardHeader>
                                            <CardTitle className="text-lg text-card-foreground">
                                                Giấy phép lái xe
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Card className="bg-card border-border">
                                                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Số GPLX
                                                        </p>
                                                        <p className="font-medium text-card-foreground">
                                                            {userData.driverInfo?.extractedLicenseNumber ||
                                                                'Chưa có dữ liệu'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Hạng
                                                        </p>
                                                        <p className="font-medium text-card-foreground">
                                                            {userData.driverInfo?.extractedLicenseClass ||
                                                                'Chưa có dữ liệu'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Ngày cấp
                                                        </p>
                                                        <p className="font-medium text-card-foreground">
                                                            {userData.driverInfo?.extractedLicenseIssueDate ||
                                                                'Chưa có dữ liệu'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Ngày hết hạn
                                                        </p>
                                                        <p className="font-medium text-card-foreground">
                                                            {userData.driverInfo?.extractedLicenseExpiryDate ||
                                                                'Chưa có dữ liệu'}
                                                        </p>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <p className="text-sm text-muted-foreground">
                                                            Nơi cấp
                                                        </p>
                                                        <p className="font-medium text-card-foreground">
                                                            {userData.driverInfo?.extractedLicensePlace ||
                                                                'Chưa có dữ liệu'}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </CardContent>
                                    </Card>
                                    {/* Card Đăng ký xe */}
                                    <Card className="bg-card border-border">
                                        <CardHeader>
                                            <CardTitle className="text-lg text-card-foreground">
                                                Đăng ký xe
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Card className="bg-card border-border">
                                                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Biển số xe
                                                        </p>
                                                        <p className="font-medium text-card-foreground">
                                                            {userData.driverInfo?.extractedPlateNumber ||
                                                                'Chưa có dữ liệu'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Chủ xe
                                                        </p>
                                                        <p className="font-medium text-card-foreground">
                                                            {userData.driverInfo?.extractedVehicleOwner ||
                                                                'Chưa có dữ liệu'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Loại xe
                                                        </p>
                                                        <p className="font-medium text-card-foreground">
                                                            {userData.driverInfo?.extractedVehicleType ||
                                                                'Chưa có dữ liệu'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Nhãn hiệu
                                                        </p>
                                                        <p className="font-medium text-card-foreground">
                                                            {userData.driverInfo?.extractedVehicleBrand ||
                                                                'Chưa có dữ liệu'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Số khung
                                                        </p>
                                                        <p className="font-medium text-card-foreground">
                                                            {userData.driverInfo?.extractedVehicleChassisNumber ||
                                                                'Chưa có dữ liệu'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Số máy
                                                        </p>
                                                        <p className="font-medium text-card-foreground">
                                                            {userData.driverInfo?.extractedVehicleEngineNumber ||
                                                                'Chưa có dữ liệu'}
                                                        </p>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <p className="text-sm text-muted-foreground">
                                                            Ngày đăng ký
                                                        </p>
                                                        <p className="font-medium text-card-foreground">
                                                            {userData.driverInfo?.extractedVehicleRegistrationDate ||
                                                                'Chưa có dữ liệu'}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>

            <PasswordDialog
                open={isPasswordDialogOpen}
                onOpenChange={setIsPasswordDialogOpen}
                handleSetPassword={handleSetPassword}
            />
            <ErrorAlertComponent />
        </div>
    );
}