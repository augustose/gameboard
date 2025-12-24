# El Turix Scoreboard

![El Turix Logo](public/turix_logo.jpg)


**El Turix** is a modern, responsive web application designed to keep track of scores for card games like **Rummy** and **Continental**. Built with a mobile-first approach, it allows you to easily manage players, track rounds, and view game history.

### 🔗 [Live Demo](https://el-turix-score-2025.web.app)


## 🚀 Features

*   **Game Management**: Create and track multiple game types (Rummy, Continental).
*   **Player Tracking**: Add unlimited players to a game session.
*   **Real-time Scoring**: Input scores round-by-round with automatic total calculation.
*   **History**: View past game results and winners.
*   **Data Portability**: Export and Import your game history as JSON files.
*   **Offline-First**: Uses local storage to persist data directly in your browser.

## 🛠 Tech Stack

*   **Frontend**: React (v18)
*   **Language**: TypeScript
*   **Build Tool**: Vite
*   **Styling**: TailwindCSS
*   **Icons**: Lucide React

## 📖 Runbook

### Prerequisites

*   [Node.js](https://nodejs.org/) (v16 or higher)
*   npm (included with Node.js)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/gameboard.git
    cd gameboard
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Development

To start the local development server:

```bash
npm run dev
```
*   OR use the included helper script:
    ```bash
    ./start.sh
    ```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

The output will be in the `dist/` directory. You can preview it locally with:

```bash
npm run preview
```

## ⚖️ License & Disclaimer

This project is licensed under the [MIT License](LICENSE).

**Disclaimer**: This software is provided "AS IS" without any warranties. See [DISCLAIMER.md](DISCLAIMER.md) for full details.
