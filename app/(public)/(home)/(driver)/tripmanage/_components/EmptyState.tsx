'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, Plus } from 'lucide-react'

interface EmptyStateProps {
  onOpenDialog: () => void
}

const EmptyState: React.FC<EmptyStateProps> = ({ onOpenDialog }) => (
  <div className="text-center py-12 px-4">
    <div className="mx-auto flex flex-col items-center justify-center max-w-md">
      <MapPin className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Bạn chưa có tuyến đường nào
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Bắt đầu bằng cách đăng ký tuyến đường đầu tiên của bạn
      </p>
      <Button onClick={onOpenDialog} className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Đăng ký tuyến đường
      </Button>
    </div>
  </div>
)

export default EmptyState
