import CreateNoteForm from "./CreateNoteForm";
import DeleteButton from "./DeleteButton";
import NoteCard from "./NoteCard";

// 1. Define the shape of our data (Your TypeScript equivalent of a Go struct!)
type Note = {
  ID: number;
  Title: string;
  Description: string;
  CreatedAt: string;
};

// 2. The Fetch function to talk to your Go API
async function getNotes(): Promise<Note[]> {
  // We use cache: 'no-store' so Next.js always grabs the freshest data from Go, not a saved copy
  const res = await fetch("http://localhost:8080/api/notes", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch notes from Go server");
  }
  return res.json();
}

// 3. Make the main component 'async' so it can await the data
export default async function Home() {
  // Grab the data from our function
  const notes = await getNotes();

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          My Markdown Notes
        </h1>

        {/* Drop your new Client Component right here! */}
        <CreateNoteForm />

        {/* 4. Loop through the notes array and render a Tailwind card for each one */}
        <div className="grid gap-4">
          {notes.map((note) => (
            <NoteCard key={note.ID} note={note} />
          ))}

          {notes.length === 0 && (
            <p className="text-gray-500 italic">
              No notes found. Let's create one!
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
