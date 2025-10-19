class SimpleChess {
    constructor() {
        this.game = new Chess();
        this.selectedSquare = null;
        this.legalMoves = [];
        this.playerColor = 'w';
        this.aiThinking = false;
        
        this.init();
    }

    init() {
        this.createBoard();
        this.setupEventListeners();
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
        // Clear board
        document.querySelectorAll('.square').forEach(square => {
            square.innerHTML = '';
            square.classList.remove('selected', 'legal-move', 'legal-capture', 'check');
        });

        // Add pieces
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const squareName = String.fromCharCode(97 + col) + (8 - row);
                const piece = this.game.get(squareName);
                
                if (piece) {
                    const square = document.querySelector(`[data-square="${squareName}"]`);
                    const pieceElement = document.createElement('div');
                    
                    pieceElement.className = `piece ${piece.color}`;
                    pieceElement.textContent = this.getPieceSymbol(piece.type, piece.color);
                    
                    square.appendChild(pieceElement);
                }
            }
        }

        // Highlight check
        if (this.game.in_check()) {
            const kingColor = this.game.turn();
            const kingSquare = this.findKingSquare(kingColor);
            if (kingSquare) {
                const squareElement = document.querySelector(`[data-square="${kingSquare}"]`);
                squareElement.classList.add('check');
            }
        }
    }

    getPieceSymbol(type, color) {
        const symbols = {
            p: 'P', n: 'N', b: 'B', r: 'R', q: 'Q', k: 'K'
        };
        return symbols[type];
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
        
        if (this.selectedSquare) {
            const move = this.legalMoves.find(m => m.to === squareName);
            if (move) {
                this.makeMove(move);
                return;
            }
            
            if (piece && piece.color === this.playerColor) {
                this.selectSquare(squareName);
                return;
            }
            
            this.clearSelection();
            return;
        }
        
        if (piece && piece.color === this.playerColor) {
            this.selectSquare(squareName);
        }
    }

    selectSquare(squareName) {
        this.clearSelection();
        
        this.selectedSquare = squareName;
        this.legalMoves = this.game.moves({ square: squareName, verbose: true });
        
        const selectedElement = document.querySelector(`[data-square="${squareName}"]`);
        selectedElement.classList.add('selected');
        
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
        if (move.promotion) {
            const promotion = await this.getPromotionChoice();
            move.promotion = promotion;
        }
        
        this.game.move(move);
        this.clearSelection();
        this.updateDisplay();
        
        if (this.game.game_over()) {
            this.handleGameOver();
            return;
        }
        
        if (this.game.turn() !== this.playerColor) {
            await this.aiMove();
        }
    }

    async getPromotionChoice() {
        return new Promise((resolve) => {
            const modal = document.getElementById('promotion-modal');
            modal.classList.add('active');
            
            document.querySelectorAll('.promotion-options button').forEach(button => {
                button.onclick = () => {
                    modal.classList.remove('active');
                    resolve(button.dataset.piece);
                };
            });
        });
    }

    async aiMove() {
        this.aiThinking = true;
        document.getElementById('status').textContent = 'AI thinking...';
        
        const difficulty = parseInt(document.getElementById('difficulty').value);
        const thinkTime = Math.random() * (1500 / difficulty) + 500;
        
        await new Promise(resolve => setTimeout(resolve, thinkTime));
        
        const move = this.getAIMove();
        if (move) {
            this.game.move(move);
        }
        
        this.aiThinking = false;
        this.updateDisplay();
        
        if (this.game.game_over()) {
            this.handleGameOver();
        }
    }

    getAIMove() {
        const moves = this.game.moves({ verbose: true });
        if (moves.length === 0) return null;
        
        const difficulty = parseInt(document.getElementById('difficulty').value);
        
        if (difficulty === 1) {
            // Easy: Random moves
            return moves[Math.floor(Math.random() * moves.length)];
        } else {
            // Medium: Prefer captures and checks
            const goodMoves = moves.filter(move => move.captured || this.game.in_check());
            if (goodMoves.length > 0) {
                return goodMoves[Math.floor(Math.random() * goodMoves.length)];
            }
            return moves[Math.floor(Math.random() * moves.length)];
        }
    }

    updateDisplay() {
        this.updateBoard();
        this.updateStatus();
        this.updateMoveHistory();
    }

    updateStatus() {
        const status = document.getElementById('status');
        
        if (this.game.game_over()) {
            if (this.game.in_checkmate()) {
                status.textContent = `Checkmate! ${this.game.turn() === 'w' ? 'Black' : 'White'} wins!`;
            } else if (this.game.in_draw()) {
                status.textContent = 'Draw!';
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
        
        const moves = this.game.history();
        
        for (let i = 0; i < moves.length; i += 2) {
            const moveEntry = document.createElement('div');
            moveEntry.className = 'move-entry';
            
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = moves[i];
            const blackMove = moves[i + 1] || '';
            
            moveEntry.textContent = `${moveNumber}. ${whiteMove} ${blackMove}`;
            moveHistory.appendChild(moveEntry);
        }
        
        moveHistory.scrollTop = moveHistory.scrollHeight;
    }

    handleGameOver() {
        // Game over is already shown in status
    }

    newGame() {
        this.game = new Chess();
        this.selectedSquare = null;
        this.legalMoves = [];
        this.aiThinking = false;
        this.updateDisplay();
        
        if (this.playerColor === 'b') {
            this.aiMove();
        }
    }

    setupEventListeners() {
        document.getElementById('new-game').addEventListener('click', () => this.newGame());
    }
}

// Start the game
document.addEventListener('DOMContentLoaded', () => {
    window.chessGame = new SimpleChess();
});