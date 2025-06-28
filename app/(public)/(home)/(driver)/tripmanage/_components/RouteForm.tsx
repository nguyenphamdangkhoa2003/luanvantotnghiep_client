'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MapPin, Plus } from 'lucide-react'
import RegistrationForm from '@/components/form/RegistrationForm'

interface RouteFormProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const RouteForm: React.FC<RouteFormProps> = ({ isOpen, setIsOpen }) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Đăng ký tuyến mới
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[1200px] p-0 max-h-[95vh] overflow-y-auto"
        aria-describedby={undefined}
      >
        <DialogHeader className="px-6 pt-6 pb-4 sticky top-0 bg-[var(--popover)] z-10">
          <DialogTitle className="text-xl flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Đăng ký tuyến đường mới
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          <RegistrationForm />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RouteForm
