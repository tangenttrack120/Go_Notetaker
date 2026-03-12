package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

// declare empty global variable for database connection pool
var db *pgxpool.Pool
type Note struct {
	ID int
	Title string
	Description string
	CreatedAt time.Time
}

func createNote(w http.ResponseWriter, r *http.Request) {
	newNote := Note{}

	// Decode the JSON body of the request into a new Note struct. If there's an error, send a 400 Bad Request response back to the client.
	err := json.NewDecoder(r.Body).Decode(&newNote)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Write the SQL query to insert a new note into the database
	query := `INSERT INTO notes (TITLE, DESCRIPTION) VALUES ($1, $2)`

	// Execute the query, passing in the title and description from the newNote struct. '.Exec()' is used for SQL statements that don't return rows (like INSERT, UPDATE, DELETE)
	_, err = db.Exec(context.Background(), query, newNote.Title, newNote.Description)
	if err != nil {
		fmt.Printf("Unable to insert note: %v\n", err)
		return
	}

	// Tell the frontend that the resource was created successfully (Status 201)
	w.WriteHeader(http.StatusCreated)
	// Send a success message back over the network
	w.Write([]byte("Note successfully created!"))
	
	// keeping the Println so you can see it in your terminal too
	fmt.Println("Note added successfully to DB!")
}

func deleteNote(w http.ResponseWriter, r *http.Request) {
	// Get the note ID from the URL query parameters (e.g., /api/notes?id=123)
	noteID := r.URL.Query().Get("id")
	if noteID == "" {
		http.Error(w, "Missing note ID", http.StatusBadRequest)
		return
	}

	// Write the SQL query to delete a note by its ID
	query := `DELETE FROM notes WHERE id = $1`

	// Execute the query, passing in the note ID. '.Exec()' is used for SQL statements that don't return rows (like INSERT, UPDATE, DELETE)
	_, err := db.Exec(context.Background(), query, noteID)
	if err != nil {
		fmt.Printf("Unable to delete note: %v\n", err)
		http.Error(w, "Failed to delete note", http.StatusInternalServerError)
		return
	}

	// Tell the frontend that the resource was deleted successfully (Status 200)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Note successfully deleted!"))
}

func updateNote(w http.ResponseWriter, r *http.Request) {
	// Get the note ID from the URL query parameters (e.g., /api/notes?id=123)
	noteID := r.URL.Query().Get("id")
	if noteID == "" {
		http.Error(w, "Missing note ID", http.StatusBadRequest)
		return
	}

	updatedNote := Note{}

	// Decode the JSON body of the request into a new Note struct. If there's an error, send a 400 Bad Request response back to the client.
	err := json.NewDecoder(r.Body).Decode(&updatedNote)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Write the SQL query to update a note by its ID
	query := `UPDATE notes SET title = $1, description = $2 WHERE id = $3`

	// Execute the query, passing in the updated title, description, and note ID. '.Exec()' is used for SQL statements that don't return rows (like INSERT, UPDATE, DELETE)
	_, err = db.Exec(context.Background(), query, updatedNote.Title, updatedNote.Description, noteID)
	if err != nil {
		fmt.Printf("Unable to update note: %v\n", err)
		http.Error(w, "Failed to update note", http.StatusInternalServerError)
		return
	}

	// Tell the frontend that the resource was updated successfully (Status 200)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Note successfully updated!"))
}

func getNotes(w http.ResponseWriter, r *http.Request) {
	// Write the SQL query to get all the notes, ordered by latest creation date
	query := `SELECT id, title, description, created_at FROM notes ORDER BY created_at DESC`

	// Execute the query and get the rows back, '.Query()' is used for SQL statements that return a set of rows
	rows, err := db.Query(context.Background(), query)
	if err != nil {
		fmt.Printf("Unable to query notes: %v\n", err)
		return
	}
	defer rows.Close()

	// Create an empty slice to hold the notes that will be returned to the frontend
	var notes []Note
	// Loop through the rows returned by the query. For each row, create a new Note struct and scan the values from the row into the struct fields. If there's an error scanning a row, log it and return.
	for rows.Next() {
		var note Note
		err := rows.Scan(&note.ID, &note.Title, &note.Description, &note.CreatedAt)
		if err != nil {
			fmt.Printf("Unable to scan note: %v\n", err)
			return
		}
		notes = append(notes, note)
	}
	
	// Set the Content-Type header to 'application/json' so the frontend knows we're sending JSON data back, and then encode the slice of notes as JSON and write it to the response body.
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notes)
}

func main() {
	// Load environment variables from the .env file. If there's an error, log it and exit the program.
	err := godotenv.Load("../.env") 
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// Create a new connection pool to the PostgreSQL database using the connection string from the environment variable 'DBURL'. If there's an error, log it and exit the program.
	db, err = pgxpool.New(context.Background(), os.Getenv("DBURL"))
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v", err)
	}

	// Ping the database to ensure the connection is valid. If there's an error, log it and exit the program.
	err = db.Ping(context.Background())
    if err != nil {
        fmt.Fprintf(os.Stderr, "Database ping failed: %v\n", err)
        os.Exit(1)
    }

	fmt.Println("Successfully connected to the database pool!")

	// --- AUTOMATIC TABLE CREATION ---
	createTableQuery := `
	CREATE TABLE IF NOT EXISTS notes (
		ID SERIAL PRIMARY KEY,
		TITLE VARCHAR(255) NOT NULL,
		DESCRIPTION TEXT NOT NULL,
		CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);`

	// Execute the query to create the 'notes' table if it doesn't already exist. If there's an error, log it and exit the program.
	_, err = db.Exec(context.Background(), createTableQuery)
	if err != nil {
		log.Fatalf("Failed to create notes table: %v", err)
	}
	fmt.Println("Notes table verified!")
	// --------------------------------

	// The Traffic Cop Router
	// The Upgraded Traffic Cop Router
	http.HandleFunc("/api/notes", func(w http.ResponseWriter, r *http.Request) {
		// 1. Set the CORS headers for EVERY request
		w.Header().Set("Access-Control-Allow-Origin", "*") // Allow any port to connect
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS") // Allow these methods
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type") // Allow the JSON content type

		// 2. Handle the Preflight Check
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK) // Smile and wave at the browser
			return                       // Stop running the rest of the function
		}

		// 3. Handle the actual data requests
		switch r.Method {
		case http.MethodGet:
			getNotes(w, r)
		case http.MethodPost:
			createNote(w, r)
		case http.MethodDelete:
			deleteNote(w, r)
		case http.MethodPut:
			updateNote(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	fmt.Println("Server starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}