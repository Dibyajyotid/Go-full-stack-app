package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq" // PostgreSQL driver

	"github.com/gorilla/mux"
)

type User struct {
	Id    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func main() {
	//connect to the Postgres database
	db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))
	checkNilError(err)

	defer db.Close()

	//createing table if it not exists
	_, err = db.Exec("CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY, name TEXT, email TEXT)")
	checkNilError(err)

	//creating router
	router := mux.NewRouter()
	router.HandleFunc("/api/go/users", getUsers(db)).Methods("GET")
	router.HandleFunc("/api/go/users", createUser(db)).Methods("POST")
	router.HandleFunc("/api/go/users/{id}", getUser(db)).Methods("GET")
	router.HandleFunc("/api/go/users/{id}", updateUser(db)).Methods("PUT")
	router.HandleFunc("/api/go/users/{id}", deleteUser(db)).Methods("DELETE")

	//wrap router with cors and json content type middlewares
	enhancedRouter := enableCORS(jsonContentTypeMiddleware(router))

	//starting the server
	log.Fatal(http.ListenAndServe(":8000", enhancedRouter))
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		//setting CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*") //Allow any origin
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		//Check if the request is for CORS preflight
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		//pass down the request to the next middleware
		next.ServeHTTP(w, r)
	})
}

func jsonContentTypeMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		//set JSON Content-Type
		w.Header().Set("Content-Type", "application/json")
		next.ServeHTTP(w, r)
	})
}

// getting all users
func getUsers(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query("SELECT * FROM users")
		checkNilError(err)

		defer rows.Close()

		users := []User{} //creating an empty array of users
		for rows.Next() {
			var u User //creating a variable for Each USER
			if err := rows.Scan(&u.Id, &u.Name, &u.Email); err != nil {
				log.Fatal(err)
			}

			users = append(users, u) //appending each of the user to the users array
		}

		if err := rows.Err(); err != nil {
			log.Fatal(err)
		}

		json.NewEncoder(w).Encode(users)
	}
}

// getting user by Id, we will only get a single Id
func getUser(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id := vars["id"]

		var u User
		err := db.QueryRow("SELECT * FROM users WHERE id = $1", id).Scan(&u.Id, &u.Name, &u.Email)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		json.NewEncoder(w).Encode(u)
	}
}

// creating a new User
func createUser(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var u User
		json.NewDecoder(r.Body).Decode(&u)

		err := db.QueryRow("INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id", u.Name, u.Email).Scan(&u.Id)
		checkNilError(err)

		json.NewEncoder(w).Encode(u)
	}
}

// updating a user
func updateUser(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var u User
		json.NewDecoder(r.Body).Decode(&u)

		vars := mux.Vars(r)
		id := vars["id"]

		//executing the SQL update Query
		_, err := db.Exec("UPDATE users SET name = $1, email = $2 WHERE id = $3", u.Name, u.Email, id)
		checkNilError(err)

		//retrieving the updated user from the database
		var updatedUser User
		err = db.QueryRow("SELECT id, name, email FROM users WHERE id = $1", id).Scan(&updatedUser.Id, &updatedUser.Name, &updatedUser.Email)
		checkNilError(err)

		//send the updated user data in the response
		json.NewEncoder(w).Encode(updatedUser)
	}
}

func deleteUser(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id := vars["id"]

		var u User
		err := db.QueryRow("SELECT * FROM users WHERE id = $1", id).Scan(&u.Id, &u.Name, &u.Email)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			return
		} else {
			_, err := db.Exec("DELETE FROM users WHERE id = $1", id)
			if err != nil {
				w.WriteHeader(http.StatusNotFound)
				return
			}

			json.NewEncoder(w).Encode("User Deleted")

		}
	}
}

// checking error function
func checkNilError(err error) {
	if err != nil {
		log.Fatal(err)
	}
}
