"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import HomePage from "../../views/HomePage";

export default function HomePageClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSearch = (modelId) => {
    if (!modelId.includes("/")) {
      const searchEl = document.getElementById("search");
      if (searchEl) searchEl.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setLoading(true);
    router.push(`/model/${modelId}`);
  };

  return <HomePage onSearch={handleSearch} loading={loading} />;
}
