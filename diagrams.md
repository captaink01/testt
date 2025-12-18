# System Diagrams

This document contains the sequence, class, and ER diagrams for the e-commerce system.

## ER Diagram

```mermaid
erDiagram
    users {
        INTEGER id PK
        TEXT full_name
        TEXT email
        TEXT password
        TEXT phone
        DATETIME created_at
    }

    sports {
        INTEGER id PK
        TEXT name
        TEXT icon
    }

    user_sports {
        INTEGER id PK
        INTEGER user_id FK
        INTEGER sport_id FK
    }

    games {
        INTEGER id PK
        INTEGER creator_id FK
        INTEGER sport_id FK
        TEXT title
        TEXT description
        TEXT location
        TEXT date
        TEXT time
        INTEGER players_needed
        INTEGER current_players
        TEXT status
        DATETIME created_at
    }

    game_participants {
        INTEGER id PK
        INTEGER game_id FK
        INTEGER user_id FK
        DATETIME joined_at
    }

    locations {
        INTEGER id PK
        TEXT name
        TEXT description
        TEXT address
        TEXT facilities
        TEXT available_sports
    }

    users ||--o{ user_sports : "has"
    sports ||--o{ user_sports : "has"
    users ||--o{ games : "creates"
    sports ||--o{ games : "is of type"
    users ||--o{ game_participants : "participates in"
    games ||--o{ game_participants : "has"
```

## Class Diagram

```mermaid
classDiagram
    class User {
        -id: Integer
        -fullName: String
        -email: String
        -password: String
        -phone: String
        +register()
        +login()
        +createGame()
        +joinGame()
        +leaveGame()
    }

    class Game {
        -id: Integer
        -creatorId: Integer
        -sportId: Integer
        -title: String
        -description: String
        -location: String
        -date: String
        -time: String
        -playersNeeded: Integer
        -currentPlayers: Integer
        -status: String
        +addPlayer()
        +removePlayer()
        +updateStatus()
    }

    class Sport {
        -id: Integer
        -name: String
        -icon: String
    }

    class Location {
        -id: Integer
        -name: String
        -description: String
        -address: String
        -facilities: String
        -availableSports: String
    }

    User "1" -- "0..*" Game : creates
    User "1" -- "0..*" Game : joins
    Sport "1" -- "0..*" Game : is of type
    Location "1" -- "0..*" Game : is at
```

## Sequence Diagrams

### Join a Game
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Click "Join Game"
    Frontend->>Backend: POST /api/games/:id/join
    Backend->>Database: SELECT * FROM games WHERE id = :id
    Database-->>Backend: Game data
    Backend->>Database: INSERT INTO game_participants (game_id, user_id) VALUES (:game_id, :user_id)
    Database-->>Backend: Success
    Backend->>Frontend: 200 OK { message: "Successfully joined game" }
    Frontend->>User: Display "Successfully joined game"
```

### Post a Game
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Fills out "Create Game" form
    User->>Frontend: Clicks "Create Game"
    Frontend->>Backend: POST /api/games (gameData)
    Backend->>Backend: Validate game data
    Backend->>Database: INSERT INTO games (creator_id, sport_id, title, ...) VALUES (...)
    Database-->>Backend: New game ID
    Backend->>Frontend: 201 Created { message: "Game created successfully", gameId: ... }
    Frontend->>User: Display "Game created successfully"
```
