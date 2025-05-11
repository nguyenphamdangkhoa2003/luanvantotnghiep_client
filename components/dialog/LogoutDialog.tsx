"use client";

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useAuthContext } from '@/context/auth-provider';

const LogoutDialog = (props: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { isOpen, setIsOpen } = props;
  const { logout } = useAuthContext();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleLogout = useCallback(async () => {
    setIsPending(true);
    try {
      await logout();
      router.refresh();
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Đăng xuất thất bại', {
        description: error.message || 'Đã xảy ra lỗi khi đăng xuất',
        position: 'top-right',
      });
    } finally {
      setIsPending(false);
      setIsOpen(false);
    }
  }, [logout, router, setIsOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Xác nhận đăng xuất
          </DialogTitle>
          <DialogDescription className="mt-2 text-gray-600">
            Bạn có chắc chắn muốn đăng xuất khỏi tài khoản hiện tại? Sau khi đăng xuất, bạn sẽ cần đăng nhập lại để tiếp tục sử dụng dịch vụ.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="mt-4 flex flex-row justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Hủy bỏ
          </Button>
          <Button
            disabled={isPending}
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Đang xử lý...
              </>
            ) : (
              'Đăng xuất'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutDialog;