"use client"

import { toast } from "@/hooks/use-toast"

export function showSuccessNotification(title: string, description?: string) {
  toast({
    title,
    description,
    variant: "default",
  })
}

export function showErrorNotification(title: string, description?: string) {
  toast({
    title,
    description,
    variant: "destructive",
  })
}
