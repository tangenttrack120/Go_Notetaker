"use client";

import { useState } from "react";
import CreateNoteForm from "./CreateNoteForm";
import NoteCard from "./NoteCard";

type Note = {
  ID: number;
  Title: string;
  Description: string;
  Tag: string; // <-- Add this!
  CreatedAt: string;
};

// This component accepts the notes fetched by the server as a "prop"
export default function NoteDashboard({ notes }: { notes: Note[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  // SAFETY FIX: If Go sends back 'null', force it to be an empty array
  const safeNotes = Array.isArray(notes) ? notes : [];

  // Use 'safeNotes' instead of 'notes' here
  const filteredNotes = safeNotes.filter((note) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      note.Title.toLowerCase().includes(lowerCaseQuery) ||
      note.Description.toLowerCase().includes(lowerCaseQuery)
    );
  });

  return (
    <>
      {/* The Create Form stays at the top */}
      <CreateNoteForm />

      {/* 3. The Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-500 shadow-sm"
        />
      </div>

      {/* 4. Map over the FILTERED array, not the original array */}
      <div className="grid gap-4">
        {filteredNotes.map((note) => (
          <NoteCard key={note.ID} note={note} />
        ))}

        {/* Dynamic empty state messages */}
        {notes.length === 0 && (
          <p className="text-gray-500 italic">
            No notes found. Let's create one!
          </p>
        )}
        {notes.length > 0 && filteredNotes.length === 0 && (
          <p className="text-gray-500 italic">
            No notes found matching "{searchQuery}"
          </p>
        )}
      </div>
    </>
  );
}
