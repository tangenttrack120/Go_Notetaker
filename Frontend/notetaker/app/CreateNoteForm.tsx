"use client"; // This MUST be the very first line!

import { useState } from "react";
import { useRouter } from "next/navigation"; // Next.js tool to refresh the page

export default function CreateNoteForm() {
  const router = useRouter();

  // 1. Set up React State to remember what the user types
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("General");
  const [description, setDescription] = useState("");

  // 2. The function that runs when they click "Submit"
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Stops the browser from reloading the page the old-fashioned way

    // Package the state into the exact JSON shape your Go struct expects
    const newNote = {
      Title: title,
      Description: description,
      Tag: tag, // <-- Send the new tag to Go!
    };

    // Fire the POST request to your Go API
    const res = await fetch(
      "https://scientific-puma-tangenttrack-179f8ff0.koyeb.app/api/notes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newNote),
      },
    );

    if (res.ok) {
      // Clear the form boxes
      setTitle("");
      setDescription("");
      setTag("General");
      // Tell Next.js to refresh the Server Component to fetch the new data
      router.refresh();
    } else {
      console.error("Failed to create note");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200"
    >
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)} // Update state as they type
          className="w-full border text-gray-700 border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)} // Update state as they type
          className="w-full border text-gray-700 border-gray-300 p-2 rounded h-32 focus:outline-none focus:border-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Category Tag
        </label>
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 bg-white"
        >
          <option value="General">General</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Ideas">Ideas</option>
        </select>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
      >
        Save Note
      </button>
    </form>
  );
}
