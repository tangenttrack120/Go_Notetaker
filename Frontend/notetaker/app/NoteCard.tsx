"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DeleteButton from "./DeleteButton";
import ReactMarkdown from "react-markdown";

// Define the shape of the note prop we will receive
type Note = {
  ID: number;
  Title: string;
  Description: string;
  CreatedAt: string;
};

export default function NoteCard({ note }: { note: Note }) {
  const router = useRouter();

  // State to toggle between reading and editing
  const [isEditing, setIsEditing] = useState(false);

  // State to hold the edits before they are saved
  const [editTitle, setEditTitle] = useState(note.Title);
  const [editDescription, setEditDescription] = useState(note.Description);

  const handleUpdate = async () => {
    // Fire the PUT request to your Go backend, passing the ID in the URL just like your Go code expects!
    const res = await fetch(`http://localhost:8080/api/notes?id=${note.ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Title: editTitle,
        Description: editDescription,
      }),
    });

    if (res.ok) {
      setIsEditing(false); // Turn off edit mode
      router.refresh(); // Tell Next.js to fetch the fresh data
    } else {
      console.error("Failed to update note");
    }
  };

  // --- EDIT MODE UI ---
  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-blue-400">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full font-semibold text-2xl text-gray-800 mb-2 border-b border-gray-300 focus:outline-none focus:border-blue-500"
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full text-gray-600 mb-4 border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
          rows={3}
        />
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm font-bold transition"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 text-sm font-bold transition"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW MODE UI ---
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        {note.Title}
      </h2>
      <div className="prose prose-blue max-w-none mb-4">
        <ReactMarkdown>{note.Description}</ReactMarkdown>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-400">
          {new Date(note.CreatedAt).toLocaleDateString()}
        </span>

        <div className="flex gap-4 items-center">
          {/* The new Edit button */}
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-500 hover:text-blue-700 font-semibold text-sm transition-colors"
          >
            Edit
          </button>

          {/* We moved your DeleteButton inside this component! */}
          <DeleteButton id={note.ID} />
        </div>
      </div>
    </div>
  );
}
