import React, { useState, useEffect } from 'react';
import Card from './Card';
import { motion, AnimatePresence } from 'framer-motion';

const SYMBOLS = ['🎮', '🎨', '🎭', '🎪', '🎯', '🎲', '🎳', '🎼', '🎸', '🎺', '🎻', '🎹', '🥁', '🎷', '🪗', '🎺'];
const DIFFICULTY_LEVELS = {
  easy: { pairs: 6, time: 60, label: 'Easy Mode' },
  medium: { pairs: 8, time: 90, label: 'Medium Mode' },
  hard: { pairs: 12, time: 120, label: 'Hard Mode' },
  expert: { pairs: 16, time: 180, label: 'Expert Mode' }
};

const DEFAULT_SCORES = {
  easy: { attempts: Infinity, time: Infinity },
  medium: { attempts: Infinity, time: Infinity },
  hard: { attempts: Infinity, time: Infinity },
  expert: { attempts: Infinity, time: Infinity }
};

const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_LEVELS.easy.time);
  const [difficulty, setDifficulty] = useState('easy');
  const [bestScores, setBestScores] = useState(() => {
    try {
      const saved = localStorage.getItem('memoryGameBestScores');
      return saved ? { ...DEFAULT_SCORES, ...JSON.parse(saved) } : DEFAULT_SCORES;
    } catch (error) {
      console.error('Error loading best scores:', error);
      return DEFAULT_SCORES;
    }
  });

  // Initialize game
  const initializeGame = () => {
    const numPairs = DIFFICULTY_LEVELS[difficulty].pairs;
    const gameSymbols = SYMBOLS.slice(0, numPairs);
    const cardPairs = [...gameSymbols, ...gameSymbols];
    const shuffledCards = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
        animationDelay: Math.random() * 0.3
      }));

    // First set game started to false and clear cards
    setGameStarted(false);
    setCards([]);
    
    // Then set up the new game after a brief delay
    setTimeout(() => {
      setCards(shuffledCards);
      setFlippedCards([]);
      setMatchedPairs(0);
      setAttempts(0);
      setTimeLeft(DIFFICULTY_LEVELS[difficulty].time);
      setGameStarted(true);
    }, 300);
  };

  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty) => {
    if (gameStarted) {
      setGameStarted(false);
    }
    setDifficulty(newDifficulty);
    setCards([]);
    setFlippedCards([]);
    setMatchedPairs(0);
    setAttempts(0);
    setTimeLeft(DIFFICULTY_LEVELS[newDifficulty].time);
  };

  // Handle card click
  const handleCardClick = (cardId) => {
    if (flippedCards.length === 2 || !gameStarted) return;
    
    const newCards = cards.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);
    
    setFlippedCards([...flippedCards, cardId]);
  };

  // Check for matches
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstId, secondId] = flippedCards;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);

      if (firstCard.symbol === secondCard.symbol) {
        // Match found
        setCards(cards.map(card => 
          card.id === firstId || card.id === secondId
            ? { ...card, isMatched: true, isFlipped: true }
            : card
        ));
        setMatchedPairs(prev => prev + 1);
        setFlippedCards([]);
      } else {
        // No match
        setTimeout(() => {
          setCards(cards.map(card => 
            card.id === firstId || card.id === secondId
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
      setAttempts(prev => prev + 1);
    }
  }, [flippedCards]);

  // Timer
  useEffect(() => {
    let timer;
    if (gameStarted && timeLeft > 0 && matchedPairs < DIFFICULTY_LEVELS[difficulty].pairs) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setGameStarted(false);
    }
    return () => clearInterval(timer);
  }, [gameStarted, timeLeft]);

  // Check win condition
  useEffect(() => {
    if (matchedPairs === DIFFICULTY_LEVELS[difficulty].pairs && gameStarted) {
      const timeSpent = DIFFICULTY_LEVELS[difficulty].time - timeLeft;
      const currentScore = { attempts, time: timeSpent };
      
      const currentBest = bestScores[difficulty] || { attempts: Infinity, time: Infinity };
      if (attempts < currentBest.attempts || 
         (attempts === currentBest.attempts && timeSpent < currentBest.time)) {
        const newBestScores = { 
          ...bestScores, 
          [difficulty]: currentScore 
        };
        setBestScores(newBestScores);
        try {
          localStorage.setItem('memoryGameBestScores', JSON.stringify(newBestScores));
        } catch (error) {
          console.error('Error saving best scores:', error);
        }
      }
      setGameStarted(false);
    }
  }, [matchedPairs, difficulty, attempts, timeLeft, bestScores, gameStarted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full max-w-5xl p-2 flex flex-col"
      >
        <div className="text-center flex-shrink-0">
          <motion.h1 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2"
          >
            Memory Game
          </motion.h1>
          
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-2 mt-4 shadow-2xl border border-gray-700/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              {Object.entries(DIFFICULTY_LEVELS).map(([key, value]) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-2 py-1.5 text-sm rounded-lg font-semibold transition-all duration-300 ${
                    difficulty === key
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  }`}
                  onClick={() => handleDifficultyChange(key)}
                  disabled={gameStarted}
                >
                  {value.label}
                </motion.button>
              ))}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 text-sm rounded-lg font-bold transition-all duration-300 ${
                gameStarted 
                  ? 'bg-gradient-to-r from-red-600 to-orange-600'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600'
              } text-white shadow-lg`}
              onClick={initializeGame}
            >
              {gameStarted ? 'Restart Game' : 'Start Game'}
            </motion.button>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-gray-800/30 rounded-lg p-2 backdrop-blur-sm border border-gray-700/30">
                <div className="text-lg md:text-xl font-bold text-gray-200">{formatTime(timeLeft)}</div>
                <div className="text-xs md:text-sm text-gray-400">Time Left</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-2 backdrop-blur-sm border border-gray-700/30">
                <div className="text-lg md:text-xl font-bold text-gray-200">{attempts}</div>
                <div className="text-xs md:text-sm text-gray-400">Attempts</div>
              </div>
            </div>

            <div className="mt-2 text-xs md:text-sm text-gray-400">
              Best Score ({DIFFICULTY_LEVELS[difficulty].label}): {
                bestScores[difficulty]?.attempts === Infinity || !bestScores[difficulty] || !bestScores[difficulty]?.time
                  ? 'No record yet'
                  : `${bestScores[difficulty].attempts} attempts in ${formatTime(bestScores[difficulty].time)}`
              }
            </div>
          </div>
        </div>

        <motion.div 
          layout
          className={`flex-grow mt-2 grid gap-1.5 place-content-center place-items-center overflow-y-auto ${
            difficulty === 'easy' ? 'grid-cols-3 sm:grid-cols-4' :
            difficulty === 'medium' ? 'grid-cols-4' :
            difficulty === 'hard' ? 'grid-cols-4 sm:grid-cols-6' :
            'grid-cols-4 sm:grid-cols-8'
          } ${
            difficulty === 'hard' || difficulty === 'expert' ? 'max-h-[calc(100vh-16rem)]' : ''
          }`}
        >
          <AnimatePresence mode="wait">
            {gameStarted && cards.map(card => (
              <Card
                key={card.id}
                {...card}
                onClick={handleCardClick}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {!gameStarted && matchedPairs === DIFFICULTY_LEVELS[difficulty].pairs && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.5 }}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-6 rounded-2xl shadow-2xl border border-emerald-500/20 text-center"
              >
                <div className="text-4xl font-bold mb-3">🎉 Congratulations! 🎉</div>
                <div className="text-xl mb-6">
                  You won in {attempts} attempts and {formatTime(DIFFICULTY_LEVELS[difficulty].time - timeLeft)}!
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setMatchedPairs(0);
                    setGameStarted(false);
                    setCards([]);
                    setFlippedCards([]);
                    setAttempts(0);
                    setTimeLeft(DIFFICULTY_LEVELS[difficulty].time);
                  }}
                  className="px-6 py-3 text-lg font-bold rounded-xl bg-white text-emerald-600 hover:bg-emerald-50 transition-colors duration-300 shadow-lg"
                >
                  Play Again
                </motion.button>
              </motion.div>
            </motion.div>
          )}
          
          {!gameStarted && timeLeft === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.5 }}
                className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-6 rounded-2xl shadow-2xl border border-red-500/20"
              >
                <div className="text-4xl font-bold mb-3">⏰ Time's Up! ⏰</div>
                <div className="text-xl">Better luck next time!</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default MemoryGame; 