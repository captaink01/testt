// src/pages/GameDetailsPage.jsx
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gamesAPI } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/NavBar";

const GameDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchGame();
  }, [id]);

  const fetchGame = async () => {
    setLoading(true);
    try {
      const response = await gamesAPI.getGameById(id);
      setGame(response.data.game);
    } catch (error) {
      console.error("Failed to fetch game:", error);
      setMessage("Failed to load game details");
    }
    setLoading(false);
  };

  const handleJoinGame = async () => {
    setActionLoading(true);
    setMessage("");
    try {
      await gamesAPI.joinGame(id);
      setMessage("Successfully joined the game! 🎉");
      fetchGame();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to join game");
    }
    setActionLoading(false);
  };

  const handleLeaveGame = async () => {
    setActionLoading(true);
    setMessage("");
    try {
      await gamesAPI.leaveGame(id);
      setMessage("Successfully left the game");
      fetchGame();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to leave game");
    }
    setActionLoading(false);
  };

  const handleDeleteGame = async () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    setActionLoading(true);
    try {
      await gamesAPI.deleteGame(id);
      navigate("/games");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete game");
      setActionLoading(false);
    }
  };

  const isCreator = user?.id === game?.creator_id;
  const isParticipant = game?.participants?.some((p) => p.id === user?.id);
  const isFull = game?.current_players >= game?.players_needed;
  const displayedStatus = isFull ? "closed" : game?.status;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return (
      date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }) +
      ` · ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900">
        <Navbar />
        <div className="pt-32 text-center">
          <div className="text-white/80 text-2xl font-bold animate-pulse">
            Loading game details...
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900">
        <Navbar />
        <div className="pt-32 text-center">
          <div className="text-red-400 text-3xl font-black">Game not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900">
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/games")}
          className="mb-8 text-blue-300 hover:text-white font-bold text-lg flex items-center gap-2 transition-all duration-300 hover:gap-4"
        >
          ← Back to Games
        </button>

        {/* Message */}
        {message && (
          <div
            className={`mb-8 p-5 rounded-2xl text-center font-bold text-lg backdrop-blur-sm border transition-all duration-500 ${
              message.includes("Success") || message.includes("joined")
                ? "bg-green-500/20 border-green-400/50 text-green-200"
                : "bg-red-500/20 border-red-500/50 text-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Main Game Details Glass Card  */}
        <div className="bg-white/20 backdrop-blur-3xl border border-white/40 rounded-3xl shadow-2xl ring-1 ring-white/20 p-6 md:p-8 transition-all duration-500">
          {/* Header: Icon + Title + Status */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="text-6xl drop-shadow-2xl">{game.sport_icon}</div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-1">
                  {game.title}
                </h1>
                <p className="text-xl font-bold text-blue-300">
                  {game.sport_name}
                </p>
              </div>
            </div>

            <span
              className={`px-6 py-3 rounded-full text-lg font-bold tracking-wide backdrop-blur-sm ${
                displayedStatus === "open"
                  ? "bg-green-500/30 text-green-200 border border-green-400/50 animate-pulse"
                  : "bg-white/20 text-white/70 border border-white/40"
              }`}
            >
              {displayedStatus.toUpperCase()}
            </span>
          </div>

          {/* Description */}
          {game.description && (
            <div className="mb-8 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
              <h3 className="text-xl font-black text-white mb-3">
                Description
              </h3>
              <p className="text-lg text-white/90 leading-relaxed">
                {game.description}
              </p>
            </div>
          )}

          {/* Game Info Grid  */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-5">
              <span className="text-3xl">📍</span>
              <div>
                <p className="text-white/70 text-sm font-medium">Location</p>
                <p className="text-xl font-bold text-white">{game.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-5">
              <span className="text-3xl">📅</span>
              <div>
                <p className="text-white/70 text-sm font-medium">Date & Time</p>
                <p className="text-xl font-bold text-white">
                  {formatDate(game.date)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-5">
              <span className="text-3xl">👥</span>
              <div>
                <p className="text-white/70 text-sm font-medium">Players</p>
                <p
                  className={`text-2xl font-black ${
                    game.current_players >= game.players_needed
                      ? "text-green-300"
                      : "text-blue-300"
                  }`}
                >
                  {game.current_players} / {game.players_needed}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-5">
              <span className="text-3xl">👤</span>
              <div>
                <p className="text-white/70 text-sm font-medium">Organizer</p>
                <p className="text-xl font-bold text-white">
                  {game.creator_name}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons  */}
          <div className="flex flex-col sm:flex-row gap-5 items-center justify-center">
            {isCreator ? (
              <>
                <button
                  onClick={handleDeleteGame}
                  disabled={actionLoading}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 px-10 rounded-2xl shadow-2xl hover:shadow-3xl hover:shadow-red-500/60 transform hover:-translate-y-1 transition-all duration-300 text-lg tracking-wide disabled:opacity-60"
                >
                  {actionLoading ? "Deleting..." : "Delete Game"}
                </button>
                <p className="text-white/80 text-lg font-medium">
                  You are the organizer
                </p>
              </>
            ) : isParticipant ? (
              <button
                onClick={handleLeaveGame}
                disabled={actionLoading}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold py-5 px-12 rounded-2xl shadow-2xl hover:shadow-3xl hover:shadow-yellow-500/60 transform hover:-translate-y-1 transition-all duration-300 text-xl tracking-wide disabled:opacity-60"
              >
                {actionLoading ? "Leaving..." : "Leave Game"}
              </button>
            ) : (
              <button
                onClick={handleJoinGame}
                disabled={actionLoading || isFull || game.status !== "open"}
                className={`font-black py-6 px-14 rounded-2xl shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-2xl tracking-wide ${
                  isFull || game.status !== "open"
                    ? "bg-white/20 text-white/60 border border-white/40 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white hover:shadow-3xl hover:shadow-blue-500/60"
                }`}
              >
                {actionLoading
                  ? "Joining..."
                  : isFull
                  ? "Game Full"
                  : game.status !== "open"
                  ? "Game Closed"
                  : "Join Game"}
              </button>
            )}
          </div>
        </div>

        {/* Participants List  */}
        <div className="mt-10 bg-white/20 backdrop-blur-3xl border border-white/40 rounded-3xl shadow-2xl ring-1 ring-white/20 p-6 md:p-8">
          <h2 className="text-3xl font-black text-white mb-6 text-center">
            Participants ({game.participants?.length || 0})
          </h2>

          {game.participants && game.participants.length > 0 ? (
            <div className="space-y-4">
              {game.participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className="group bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl p-5 flex items-center justify-between transition-all duration-300 hover:bg-white/25"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-black shadow-xl">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">
                        {participant.full_name}
                        {participant.id === game.creator_id && " (Organizer)"}
                      </p>
                      <p className="text-white/70 text-sm font-medium">
                        Joined{" "}
                        {new Date(participant.joined_at).toLocaleDateString(
                          "en-US",
                          { month: "long", day: "numeric", year: "numeric" }
                        )}
                      </p>
                    </div>
                  </div>

                  {participant.id === game.creator_id && (
                    <div className="px-5 py-2 bg-purple-500/30 border border-purple-400/50 text-purple-200 rounded-full font-bold text-base backdrop-blur-sm">
                      ORGANIZER
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-2xl font-black text-white/70 mb-3">
                No participants yet
              </p>
              <p className="text-lg text-white/80">Be the first to join! 🔥</p>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white/25 backdrop-blur-3xl border border-white/40 rounded-3xl shadow-2xl ring-1 ring-white/20 p-8 md:p-10 max-w-md w-full mx-4 scale-100 transition-transform duration-300">
            <h3 className="text-3xl font-black text-white mb-4 text-center">
              Delete Game?
            </h3>
            <p className="text-lg text-white/80 mb-8 text-center">
              Are you sure you want to delete this game? This cannot be undone.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={confirmDelete}
                disabled={actionLoading}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-3xl hover:shadow-red-500/60 transform hover:-translate-y-1 transition-all duration-300 text-lg tracking-wide disabled:opacity-60"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-8 py-4 bg-white/15 backdrop-blur-sm border border-white/40 text-white font-bold rounded-2xl hover:bg-white/25 transform hover:-translate-y-1 transition-all duration-300 text-lg tracking-wide"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameDetailsPage;
