"use client";

import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import API from "@/api/api";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import useAuth from "@/hooks/use-auth";
import { RoleEnum, AvatarProviderEnum } from "@/types/enum";

export type UserType = {
  _id: string;
  name: string;
  givenName: string;
  familyName: string;
  password: string;
  isEmailVerified: boolean;
  email: string;
  passwordEnabled: boolean;
  deleteSelfEnabled: boolean;
  hasImage: boolean;
  avatar: {
    url: string;
    provider: AvatarProviderEnum;
    publicId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  banned: boolean;
  lastSignInAt: Date;
  userPreferences: {
    enable2FA: boolean;
    emailNotification: boolean;
    twoFactorSecret?: string;
  };
  externalAccount?: {
    provider: "google";
    id: string;
    name: string;
    emails: { value: string; type?: string }[];
    picture: string;
  };
  role: RoleEnum;
  passwordEnable: boolean;
  identityVerified: string;
  driverInfo: {
    idPortraitImage?: string;
    extractedIdNumber?: string;
    extractedFullName?: string;
    extractedDob?: string;
    extractedGender?: string;
    extractedAddress?: string;
    extractedLicenseNumber?: string;
    extractedLicenseClass?: string;
    extractedLicenseIssueDate?: string;
    extractedLicenseExpiryDate?: string;
    extractedLicensePlace?: string;
    extractedPlateNumber?: string;
    extractedVehicleOwner?: string;
    extractedVehicleType?: string;
    extractedVehicleBrand?: string;
    extractedVehicleChassisNumber?: string;
    extractedVehicleEngineNumber?: string;
    extractedVehicleRegistrationDate?: string;
  };
};

type AuthContextType = {
  user?: UserType;
  error: any;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  refetch: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data, error, isLoading, isFetching, refetch, isSuccess } = useAuth();

  const [user, setUser] = useState<UserType | undefined>(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined') {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('user');
        return undefined;
      }
    }
    return undefined;
  });

  useEffect(() => {
    if (data) {
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    }
  }, [data]);

  const logout = async () => {
  try {
    const refreshToken = Cookies.get('refreshToken');
    if (!refreshToken) {
      throw new Error('Không tìm thấy refresh token');
    }
    const response = await API.post('/auth/logout', { refreshToken });
  } catch (err) {
    console.error('Lỗi khi đăng xuất:', err);
  } finally {
    Cookies.remove('accessToken', { path: '/' });
    Cookies.remove('refreshToken', { path: '/' });
    localStorage.removeItem('user');
    setUser(undefined);
    queryClient.removeQueries({ queryKey: ['authUser'] });
    router.push('/sign-in');
  }
};

  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        isLoading,
        isFetching,
        refetch,
        isSuccess,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext phải được sử dụng trong AuthProvider");
  }
  return context;
};