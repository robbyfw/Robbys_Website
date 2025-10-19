// Chess Game with AI
class ChessGame {
    constructor() {
        this.board = null;
        this.game = new Chess();
        this.selectedSquare = null;
        this.legalMoves = [];
        this.playerColor = 'w';
        this.aiThinking = false;
        this.moveHistory = [];
        this.capturedPieces = { w: [], b: [] };
        this.timers = { w: 600, b: 600 }; // 10 minutes each
        this.timerInterval = null;
        
        this.init();
    }

    init() {
        this.createBoard();
        this.setupEventListeners();
        this.startTimers();
        this.updateDisplay();
    }

    createBoard() {
        const board = document.getElementById('chessboard');
        board.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                const squareColor = (row + col) % 2 === 0 ? 'light' : 'dark';
                const squareName = String.fromCharCode(97 + col) + (8 - row);
                
                square.className = `square ${squareColor}`;
                square.dataset.square = squareName;
                
                square.addEventListener('click', () => this.handleSquareClick(squareName));
                
                board.appendChild(square);
            }
        }
        
        this.updateBoard();
    }

    updateBoard() {
        // Clear all pieces
        document.querySelectorAll('.square').forEach(square => {
            square.innerHTML = '';
            square.classList.remove('selected', 'legal-move', 'legal-capture', 'check', 'last-move');
        });

        // Update pieces
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const squareName = String.fromCharCode(97 + col) + (8 - row);
                const piece = this.game.get(squareName);
                
                if (piece) {
                    const square = document.querySelector(`[data-square="${squareName}"]`);
                    const pieceElement = document.createElement('div');
                    
                    pieceElement.className = 'piece';
                    pieceElement.textContent = this.getPieceSymbol(piece.type, piece.color);
                    pieceElement.dataset.piece = piece.type;
                    pieceElement.dataset.color = piece.color;
                    
                    square.appendChild(pieceElement);
                }
            }
        }

        // Highlight king in check
        if (this.game.in_check()) {
            const kingColor = this.game.turn();
            const kingSquare = this.findKingSquare(kingColor);
            if (kingSquare) {
                const squareElement = document.querySelector(`[data-square="${kingSquare}"]`);
                squareElement.classList.add('check');
            }
        }

        // Highlight last move
        const moves = this.game.history({ verbose: true });
        if (moves.length > 0) {
            const lastMove = moves[moves.length - 1];
            document.querySelector(`[data-square="${lastMove.from}"]`).classList.add('last-move');
            document.querySelector(`[data-square="${lastMove.to}"]`).classList.add('last-move');
        }
    }

    getPieceSymbol(type, color) {
        const symbols = {
            p: { w: '♙', b: '♟' },
            n: { w: '♘', b: '♞' },
            b: { w: '♗', b: '♝' },
            r: { w: '♖', b: '♜' },
            q: { w: '♕', b: '♛' },
            k: { w: '♔', b: '♚' }
        };
        return symbols[type][color];
    }

    findKingSquare(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const squareName = String.fromCharCode(97 + col) + (8 - row);
                const piece = this.game.get(squareName);
                if (piece && piece.type === 'k' && piece.color === color) {
                    return squareName;
                }
            }
        }
        return null;
    }

    handleSquareClick(squareName) {
        if (this.aiThinking || this.game.turn() !== this.playerColor) return;
        
        const piece = this.game.get(squareName);
        
        // If a square is already selected
        if (this.selectedSquare) {
            // If clicking on a legal move square
            const move = this.legalMoves.find(m => m.to === squareName);
            if (move) {
                this.makeMove(move);
                return;
            }
            
            // If clicking on another piece of the same color
            if (piece && piece.color === this.playerColor) {
                this.selectSquare(squareName);
                return;
            }
            
            // Deselect if clicking elsewhere
            this.clearSelection();
            return;
        }
        
        // Select a piece if it's the player's color
        if (piece && piece.color === this.playerColor) {
            this.selectSquare(squareName);
        }
    }

    selectSquare(squareName) {
        this.clearSelection();
        
        this.selectedSquare = squareName;
        this.legalMoves = this.game.moves({ square: squareName, verbose: true });
        
        // Highlight selected square
        const selectedElement = document.querySelector(`[data-square="${squareName}"]`);
        selectedElement.classList.add('selected');
        
        // Highlight legal moves
        this.legalMoves.forEach(move => {
            const targetElement = document.querySelector(`[data-square="${move.to}"]`);
            if (move.captured) {
                targetElement.classList.add('legal-capture');
            } else {
                targetElement.classList.add('legal-move');
            }
        });
    }

    clearSelection() {
        this.selectedSquare = null;
        this.legalMoves = [];
        
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('selected', 'legal-move', 'legal-capture');
        });
    }

    async makeMove(move) {
        // Handle pawn promotion
        if (move.promotion) {
            const promotion = await this.getPromotionChoice();
            move.promotion = promotion;
        }
        
        this.game.move(move);
        this.moveHistory.push(move);
        
        // Update captured pieces
        if (move.captured) {
            const capturedColor = move.color === 'w' ? 'b' : 'w';
            this.capturedPieces[capturedColor].push(move.captured);
        }
        
        this.clearSelection();
        this.updateDisplay();
        
        // Check game over
        if (this.game.game_over()) {
            this.handleGameOver();
            return;
        }
        
        // AI's turn
        if (this.game.turn() !== this.playerColor) {
            await this.aiMove();
        }
    }

    async getPromotionChoice() {
        return new Promise((resolve) => {
            const modal = document.getElementById('promotion-modal');
            modal.classList.add('active');
            
            document.querySelectorAll('.promotion-piece').forEach(button => {
                button.onclick = () => {
                    modal.classList.remove('active');
                    resolve(button.dataset.piece);
                };
            });
        });
    }

    async aiMove() {
        this.aiThinking = true;
        document.getElementById('status').textContent = 'AI is thinking...';
        document.getElementById('status').classList.add('thinking');
        
        // Simulate thinking time based on difficulty
        const difficulty = parseInt(document.getElementById('difficulty').value);
        const thinkTime = Math.random() * (2000 / difficulty) + 500;
        
        await new Promise(resolve => setTimeout(resolve, thinkTime));
        
        const move = this.getAIMove();
        if (move) {
            this.makeMove(move);
        }
        
        this.aiThinking = false;
        document.getElementById('status').classList.remove('thinking');
    }

    getAIMove() {
        const moves = this.game.moves({ verbose: true });
        
        if (moves.length === 0) return null;
        
        const difficulty = parseInt(document.getElementById('difficulty').value);
        
        // Easy: Random moves
        if (difficulty === 1) {
            return moves[Math.floor(Math.random() * moves.length)];
        }
        
        // Medium: Prefer captures and checks
        if (difficulty === 2) {
            const goodMoves = moves.filter(move => move.captured || this.game.in_check());
            if (goodMoves.length > 0) {
                return goodMoves[Math.floor(Math.random() * goodMoves.length)];
            }
            return moves[Math.floor(Math.random() * moves.length)];
        }
        
        // Hard: Simple evaluation
        if (difficulty === 3) {
            let bestMove = null;
            let bestScore = -Infinity;
            
            for (const move of moves) {
                this.game.move(move);
                const score = this.evaluateBoard();
                this.game.undo();
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
            
            return bestMove || moves[Math.floor(Math.random() * moves.length)];
        }
        
        // Expert: Look 2 moves ahead
        if (difficulty === 4) {
            let bestMove = null;
            let bestScore = -Infinity;
            
            for (const move of moves) {
                this.game.move(move);
                let minScore = Infinity;
                
                // Opponent's best response
                const opponentMoves = this.game.moves({ verbose: true });
                for (const opponentMove of opponentMoves) {
                    this.game.move(opponentMove);
                    const score = this.evaluateBoard();
                    this.game.undo();
                    
                    if (score < minScore) {
                        minScore = score;
                    }
                }
                
                this.game.undo();
                
                if (minScore > bestScore) {
                    bestScore = minScore;
                    bestMove = move;
                }
            }
            
            return bestMove || moves[Math.floor(Math.random() * moves.length)];
        }
    }

    evaluateBoard() {
        let score = 0;
        const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const squareName = String.fromCharCode(97 + col) + (8 - row);
                const piece = this.game.get(squareName);
                
                if (piece) {
                    const value = pieceValues[piece.type];
                    score += piece.color === 'w' ? value : -value;
                }
            }
        }
        
        return score;
    }

    updateDisplay() {
        this.updateBoard();
        this.updateStatus();
        this.updateMoveHistory();
        this.updateCapturedPieces();
        this.updateGameStats();
    }

    updateStatus() {
        const status = document.getElementById('status');
        
        if (this.game.game_over()) {
            if (this.game.in_checkmate()) {
                status.textContent = `Checkmate! ${this.game.turn() === 'w' ? 'Black' : 'White'} wins!`;
            } else if (this.game.in_draw()) {
                status.textContent = 'Draw!';
            } else if (this.game.in_stalemate()) {
                status.textContent = 'Stalemate!';
            }
        } else if (this.game.in_check()) {
            status.textContent = `${this.game.turn() === 'w' ? 'White' : 'Black'} is in check!`;
        } else {
            status.textContent = `${this.game.turn() === 'w' ? 'White' : 'Black'}'s Turn`;
        }
    }

    updateMoveHistory() {
        const moveHistory = document.getElementById('move-history');
        moveHistory.innerHTML = '';
        
        const moves = this.game.history({ verbose: true });
        
        for (let i = 0; i < moves.length; i += 2) {
            const moveEntry = document.createElement('div');
            moveEntry.className = 'move-entry';
            
            const moveNumber = document.createElement('span');
            moveNumber.className = 'move-number';
            moveNumber.textContent = `${Math.floor(i / 2) + 1}.`;
            
            const moveWhite = document.createElement('span');
            moveWhite.className = 'move-white';
            moveWhite.textContent = this.getMoveNotation(moves[i]);
            
            const moveBlack = document.createElement('span');
            moveBlack.className = 'move-black';
            moveBlack.textContent = moves[i + 1] ? this.getMoveNotation(moves[i + 1]) : '';
            
            moveEntry.appendChild(moveNumber);
            moveEntry.appendChild(moveWhite);
            moveEntry.appendChild(moveBlack);
            moveHistory.appendChild(moveEntry);
        }
        
        moveHistory.scrollTop = moveHistory.scrollHeight;
    }

    getMoveNotation(move) {
        if (move.san.includes('O-O-O')) return 'O-O-O';
        if (move.san.includes('O-O')) return 'O-O';
        return move.san.replace(/[+#]/, '');
    }

    updateCapturedPieces() {
        const capturedWhite = document.getElementById('captured-white');
        const capturedBlack = document.getElementById('captured-black');
        
        capturedWhite.innerHTML = '';
        capturedBlack.innerHTML = '';
        
        this.capturedPieces.w.forEach(piece => {
            const pieceElement = document.createElement('span');
            pieceElement.className = 'captured-piece';
            pieceElement.textContent = this.getPieceSymbol(piece, 'b');
            capturedWhite.appendChild(pieceElement);
        });
        
        this.capturedPieces.b.forEach(piece => {
            const pieceElement = document.createElement('span');
            pieceElement.className = 'captured-piece';
            pieceElement.textContent = this.getPieceSymbol(piece, 'w');
            capturedBlack.appendChild(pieceElement);
        });
    }

    updateGameStats() {
        document.getElementById('move-count').textContent = this.game.history().length;
        document.getElementById('white-time').textContent = this.formatTime(this.timers.w);
        document.getElementById('black-time').textContent = this.formatTime(this.timers.b);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    startTimers() {
        this.timerInterval = setInterval(() => {
            if (this.game.game_over() || this.aiThinking) return;
            
            const currentPlayer = this.game.turn();
            this.timers[currentPlayer]--;
            
            if (this.timers[currentPlayer] <= 0) {
                this.handleTimeout();
                return;
            }
            
            this.updateGameStats();
        }, 1000);
    }

    handleTimeout() {
        clearInterval(this.timerInterval);
        const loser = this.game.turn();
        this.game._gameOver = true;
        this.game._header[`${loser === 'w' ? 'Black' : 'White'}`] = 'Time';
        this.handleGameOver();
    }

    handleGameOver() {
        clearInterval(this.timerInterval);
        
        const modal = document.getElementById('game-over-modal');
        const result = document.getElementById('game-result');
        const details = document.getElementById('game-details');
        
        if (this.game.in_checkmate()) {
            result.textContent = 'Checkmate!';
            details.textContent = `${this.game.turn() === 'w' ? 'Black' : 'White'} wins the game!`;
        } else if (this.game.in_draw()) {
            result.textContent = 'Draw!';
            if (this.game.in_stalemate()) {
                details.textContent = 'Stalemate - no legal moves!';
            } else if (this.game.insufficient_material()) {
                details.textContent = 'Draw by insufficient material!';
            } else if (this.game.in_threefold_repetition()) {
                details.textContent = 'Draw by threefold repetition!';
            } else {
                details.textContent = 'The game is a draw!';
            }
        }
        
        modal.classList.add('active');
    }

    newGame() {
        clearInterval(this.timerInterval);
        
        this.game = new Chess();
        this.selectedSquare = null;
        this.legalMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { w: [], b: [] };
        this.timers = { w: 600, b: 600 };
        this.aiThinking = false;
        
        this.updateDisplay();
        this.startTimers();
        
        // If player is black, let AI make first move
        if (this.playerColor === 'b') {
            this.aiMove();
        }
    }

    undoMove() {
        if (this.game.history().length === 0 || this.aiThinking) return;
        
        this.game.undo();
        if (this.game.turn() !== this.playerColor) {
            this.game.undo(); // Undo AI's move too
        }
        
        this.moveHistory.pop();
        this.updateDisplay();
    }

    getHint() {
        if (this.aiThinking || this.game.turn() !== this.playerColor) return;
        
        const moves = this.game.moves({ verbose: true });
        if (moves.length === 0) return;
        
        const bestMove = this.getAIMove();
        if (bestMove) {
            this.clearSelection();
            this.selectSquare(bestMove.from);
            
            // Highlight the suggested move
            const targetElement = document.querySelector(`[data-square="${bestMove.to}"]`);
            targetElement.style.boxShadow = '0 0 10px 3px gold';
            
            setTimeout(() => {
                targetElement.style.boxShadow = '';
            }, 3000);
        }
    }

    setupEventListeners() {
        // New Game
        document.getElementById('new-game').addEventListener('click', () => this.newGame());
        
        // Undo Move
        document.getElementById('undo-move').addEventListener('click', () => this.undoMove());
        
        // Hint
        document.getElementById('hint').addEventListener('click', () => this.getHint());
        
        // Color selection
        document.getElementById('play-white').addEventListener('click', () => {
            this.playerColor = 'w';
            this.updateColorButtons();
            this.newGame();
        });
        
        document.getElementById('play-black').addEventListener('click', () => {
            this.playerColor = 'b';
            this.updateColorButtons();
            this.newGame();
        });
        
        document.getElementById('play-random').addEventListener('click', () => {
            this.playerColor = Math.random() < 0.5 ? 'w' : 'b';
            this.updateColorButtons();
            this.newGame();
        });
        
        // Play Again
        document.getElementById('play-again').addEventListener('click', () => {
            document.getElementById('game-over-modal').classList.remove('active');
            this.newGame();
        });
        
        // Difficulty change
        document.getElementById('difficulty').addEventListener('change', () => {
            if (this.game.history().length === 0) return;
            // Optionally restart game or continue with new difficulty
        });
    }

    updateColorButtons() {
        document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
        
        if (this.playerColor === 'w') {
            document.getElementById('play-white').classList.add('active');
        } else {
            document.getElementById('play-black').classList.add('active');
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.chessGame = new ChessGame();
});