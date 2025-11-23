// Utility functions untuk Supabase Storage operations

import { supabase } from "./supabase"

export const uploadProfilePhoto = async (file: File, nis: string): Promise<string | null> => {
  try {
    // Validasi file
    if (file.size > 512 * 1024) {
      throw new Error("Ukuran file maksimal 512KB")
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      throw new Error("Format file harus JPG, PNG, atau WebP")
    }

    // Upload file ke Supabase Storage
    const fileName = `${nis}-${Date.now()}-${Math.random().toString(36).substring(7)}`
    const { data, error } = await supabase.storage.from("profile-photos").upload(fileName, file, {
      upsert: false,
      contentType: file.type,
    })

    if (error) {
      console.error("Upload error:", error)
      throw new Error(error.message)
    }

    // Dapatkan public URL
    const { data: publicData } = supabase.storage.from("profile-photos").getPublicUrl(fileName)

    return publicData.publicUrl
  } catch (error) {
    console.error("Error uploading profile photo:", error)
    throw error
  }
}

export const deleteProfilePhoto = async (photoUrl: string): Promise<boolean> => {
  try {
    if (!photoUrl) return true

    // Extract file name dari URL
    const fileName = photoUrl.split("/").pop()
    if (!fileName) return true

    const { error } = await supabase.storage.from("profile-photos").remove([fileName])

    if (error) {
      console.error("Delete error:", error)
      throw new Error(error.message)
    }

    return true
  } catch (error) {
    console.error("Error deleting profile photo:", error)
    throw error
  }
}

export const getProfilePhotoUrl = (photoUrl: string | null | undefined): string | null => {
  if (!photoUrl) return null

  // Validasi bahwa URL valid dan dari Supabase Storage
  if (photoUrl.includes("supabaseusercontent.com") || photoUrl.includes("supabase.co")) {
    return photoUrl
  }

  return null
}
