"use client";

import { useCheckBlogUpdates } from "@/app/hooks/useCheckBlogUpdates";

export function BlogUpdater() {
  useCheckBlogUpdates();
  return null;
}

// "use client";

// import { checkForUpdates } from "@/lib/github";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";
// /**
//  *
//  * @returns {JSX.Element} Le composant BlogUpdater
//  *
//  * Ce composant permet de vérifier régulièrement si des mises à jour sont disponibles
//  * et de les rafraîchir automatiquement si nécessaire.
//  *
//  */

// export function BlogUpdater() {
//   const router = useRouter();

//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     const checkUpdates = async () => {
//       const hasUpdates = await checkForUpdates();
//       if (hasUpdates) {
//         router.refresh();
//       }
//     };

//     const interval = setInterval(checkUpdates, 900000); // 15 minutes

//     return () => clearInterval(interval);
//   }, [router]);

//   return null;
// }
