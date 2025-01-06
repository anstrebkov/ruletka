import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";
import React, { useEffect, useRef, useState } from "https://esm.sh/react@18.2.0";

// Компонент для отображения барабана
const Reel: React.FC<{ symbols: string[]; isSpinning: boolean }> = ({ symbols, isSpinning }) => {
  const reelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reelRef.current && isSpinning) {
      reelRef.current.style.animation = "spin 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
      const timeout = setTimeout(() => {
        if (reelRef.current) {
          reelRef.current.style.animation = "none";
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isSpinning]);

  return (
    <div className="reel-container overflow-hidden h-48 w-16 flex justify-center items-center">
      <div ref={reelRef} className="reel flex flex-col">
        {symbols.map((symbol, index) => (
          <div
            key={index}
            className="flex items-center justify-center h-16 w-16 bg-white/30 rounded-md text-2xl font-bold"
          >
            {symbol}
          </div>
        ))}
      </div>
    </div>
  );
};

// Основной компонент приложения
const App: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [lines, setLines] = useState<number>(1);
  const [bet, setBet] = useState<number>(0);
  const [reels, setReels] = useState<string[][]>([]);
  const [winnings, setWinnings] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  const SYMBOLS_COUNT = { "🍒": 2, "🍋": 4, "🍇": 6, "🍉": 8 };
  const SYMBOL_VALUES = { "🍒": 5, "🍋": 4, "🍇": 3, "🍉": 2 };
  const ROWS = 3;
  const COLS = 3;

  const deposit = (amount: number) => {
    if (amount > 0) {
      setBalance(amount);
    } else {
      alert("Депозит должен быть больше 0.");
    }
  };

  const spin = () => {
    setIsSpinning(true);
    const symbols = [];
    for (const [symbol, count] of Object.entries(SYMBOLS_COUNT)) {
      for (let i = 0; i < count; i++) {
        symbols.push(symbol);
      }
    }

    const newReels = [];
    for (let i = 0; i < COLS; i++) {
      newReels.push([]);
      const reelSymbols = [...symbols];
      for (let j = 0; j < ROWS; j++) {
        const randomIndex = Math.floor(Math.random() * reelSymbols.length);
        const selectedSymbol = reelSymbols[randomIndex];
        newReels[i].push(selectedSymbol);
        reelSymbols.splice(randomIndex, 1);
      }
    }
    setReels(newReels);
    calculateWinnings(newReels);
  };

  const calculateWinnings = (reels: string[][]) => {
    const rows = transpose(reels);
    let totalWinnings = 0;

    for (let row = 0; row < lines; row++) {
      const symbols = rows[row];
      let allSame = true;

      for (const symbol of symbols) {
        if (symbol !== symbols[0]) {
          allSame = false;
          break;
        }
      }

      if (allSame) {
        totalWinnings += bet * SYMBOL_VALUES[symbols[0]];
      }
    }

    setTimeout(() => {
      setWinnings(totalWinnings);
      setBalance((prev) => prev + totalWinnings);
      setIsSpinning(false);
    }, 2000);
  };

  const transpose = (reels: string[][]) => {
    const rows = [];
    for (let i = 0; i < ROWS; i++) {
      rows.push([]);
      for (let j = 0; j < COLS; j++) {
        rows[i].push(reels[j][i]);
      }
    }
    return rows;
  };

  const startGame = () => {
    if (isNaN(balance) || isNaN(bet) || isNaN(lines) || balance <= 0 || bet <= 0 || lines <= 0 || lines > 3) {
      alert("Пожалуйста, введите корректные значения для депозита, линий и ставки.");
      return;
    }

    if (balance < bet * lines) {
      alert("Недостаточно средств для ставки.");
      return;
    }

    setBalance((prev) => prev - bet * lines);
    setGameStarted(true);
    spin();
  };

  const resetGame = () => {
    setBalance(0);
    setLines(1);
    setBet(0);
    setReels([]);
    setWinnings(0);
    setGameStarted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Рулетка</h1>

      {!gameStarted
        ? (
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 shadow-lg w-full max-w-md">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Введите сумму депозита</label>
                <input
                  type="number"
                  className="w-full p-2 rounded-md bg-white/30 text-blue placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Сумма"
                  onChange={(e) => deposit(parseFloat(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Количество линий (1-3)</label>
                <input
                  type="number"
                  min="1"
                  max="3"
                  className="w-full p-2 rounded-md bg-white/30 text-blue placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Линии"
                  onChange={(e) => setLines(parseInt(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ставка на линию</label>
                <input
                  type="number"
                  className="w-full p-2 rounded-md bg-white/30 text-blur placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ставка"
                  onChange={(e) => setBet(parseFloat(e.target.value))}
                />
              </div>

              <button
                onClick={startGame}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-md transition duration-200"
              >
                Начать игру
              </button>
            </div>
          </div>
        )
        : (
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 shadow-lg w-full max-w-md">
            <div className="space-y-4">
              <div className="flex justify-center items-center space-x-4">
                {reels.map((reel, i) => <Reel key={i} symbols={reel} isSpinning={isSpinning} />)}
              </div>

              <div className="text-center">
                <p className="text-lg">Ваш выигрыш: {winnings}</p>
                <p className="text-lg">Баланс: {balance}</p>
              </div>

              <button
                onClick={resetGame}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-md transition duration-200"
              >
                Играть снова
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

// Добавляем стили только в браузерной среде
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    @keyframes spin {
      0% { transform: translateY(0); }
      100% { transform: translateY(-100%); }
    }
    .reel {
      display: flex;
      flex-direction: column;
    }
    .reel-container {
      position: relative;
    }
  `;
  document.head.appendChild(styleSheet);
}

// Рендерим приложение только в браузерной среде
if (typeof document !== "undefined") {
  createRoot(document.getElementById("root")).render(<App />);
}

// Серверная часть: возвращаем HTML-страницу
export default function handler(request: Request): Response {
  return new Response(
    `
    <html>
      <head>
        <title>Рулетка</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://esm.town/v/std/catch"></script>
      </head>
      <body class="bg-gray-200">
        <div id="root"></div>
        <script type="module" src="${import.meta.url}"></script>
      </body>
    </html>
  `,
    {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}
