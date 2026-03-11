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

	err := json.NewDecoder(r.Body).Decode(&newNote)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	query := `INSERT INTO notes (TITLE, DESCRIPTION) VALUES ($1, $2)`

	_, err = db.Exec(context.Background(), query, newNote.Title, newNote.Description)
	if err != nil {
		fmt.Printf("Unable to insert note: %v\n", err)
		return
	}

	// 1. Tell the frontend that the resource was created successfully (Status 201)
	w.WriteHeader(http.StatusCreated)
	// 2. Send a success message back over the network
	w.Write([]byte("Note successfully created!"))
	
	// (Optional: keep the Println so you can see it in your terminal too)
	fmt.Println("Note added successfully to DB!")
}

func getNotes (w http.ResponseWriter, r *http.Request) {
	
}

func main() {
	err := godotenv.Load("../.env") 
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	db, err = pgxpool.New(context.Background(), os.Getenv("DBURL"))
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v", err)
	}

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

	_, err = db.Exec(context.Background(), createTableQuery)
	if err != nil {
		log.Fatalf("Failed to create notes table: %v", err)
	}
	fmt.Println("Notes table verified!")
	// --------------------------------

	http.HandleFunc("/api/notes", createNote)
	log.Fatal(http.ListenAndServe(":8080", nil))
}