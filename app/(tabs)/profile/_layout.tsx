"use client"

import { Stack } from "expo-router"
import { useAuth } from "../../../contexts/AuthContext"
import { useEffect } from "react"
import { router } from "expo-router"

export default function ProfileLayout() {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/(auth)/login")
    }
  }, [user, isLoading])

  if (!user) return null

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" />
    </Stack>
  )
}
