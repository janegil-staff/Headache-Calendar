"use client";

import { useState } from "react";

export function useSecretCode() {
  const [input, setInput] = useState("");

  function handleChange(value) {
    // Only allow digits, max 6
    setInput(value.replace(/\D/g, "").slice(0, 6));
  }

  return { input, handleChange };
}