"use client";

import { useAuth } from "@/contexts/AuthContext";
import { router, Stack } from "expo-router";
import { useEffect } from "react";

export default function AdminLayout() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || !user.is_admin)) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading]);

  if (!user?.is_admin) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="elections" />
      <Stack.Screen name="candidates" />
      <Stack.Screen name="announcements" />
      <Stack.Screen name="users" />
    </Stack>
  );
}
