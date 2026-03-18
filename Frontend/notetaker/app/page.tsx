import NoteDashboard from "./NoteDashboard";
import AuthButton from "./AuthButton";

type Note = {
  ID: number;
  Title: string;
  Description: string;
  Tag: string; // <-- Add this!
  CreatedAt: string;
};

async function getNotes(): Promise<Note[]> {
  const res = await fetch(
    "https://scientific-puma-tangenttrack-179f8ff0.koyeb.app/api/notes",
    {
      cache: "no-store",
    },
  );
  if (!res.ok) {
    throw new Error("Failed to fetch notes from Go server");
  }
  return res.json();
}

export default async function Home() {
  // Fetch notes securely on the backend
  const notes = await getNotes();

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          My Markdown Notes
        </h1>
        <AuthButton />
      </div>
    </main>
  );
}
