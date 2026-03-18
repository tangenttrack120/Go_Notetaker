"use client"; // Must be a client component to listen for clicks!

import { useRouter } from "next/navigation";

// Define the expected prop (the ID of the note)
export default function DeleteButton({ id }: { id: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    // We add a quick browser confirmation so users don't accidentally delete things!
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    // Fire the DELETE request to your Go backend, passing the ID in the URL
    const res = await fetch(
      `https://scientific-puma-tangenttrack-179f8ff0.koyeb.app/api/notes?id=${id}`,
      {
        method: "DELETE",
      },
    );

    if (res.ok) {
      router.refresh(); // Tell the page to refetch the data from Go
    } else {
      console.error("Failed to delete note");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-red-500 hover:text-red-700 font-semibold text-sm transition-colors duration-200"
    >
      Delete Note
    </button>
  );
}
