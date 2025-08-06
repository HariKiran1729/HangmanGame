// Game State
class HangmanGame {
    constructor() {
        this.currentLevel = 1;
        this.maxLevels = 10;
        this.chances = 5;
        this.maxChances = 5;
        this.currentWord = '';
        this.currentHint = '';
        this.guessedLetters = new Set();
        this.correctLetters = new Set();
        this.gameStarted = false;
        this.gameResults = [];
        this.adminPassword = 'hangman2024'; // Default admin password
        this.currentEmployeeId = '';
        this.gameStartTime = null;
        this.sessionToken = '';
        this.wordsApiUrl = window.obf ? window.obf.getApiUrl() : './words-api.html'; // URL to secure words API
        this.googleSheetsUrl = 'https://script.google.com/macros/s/AKfycby8gXn5Vm-8Yur8QOXLX7NBsT4cU9lCbOuTAG5sWvvyVYz3ziVfbzWiuJxSKsbThBS-/exec'; // Replace with your Google Apps Script web app URL
        
        // No words stored locally - they will be fetched securely
        this.wordsAndHints = [];
        
        this.loadSavedConfig();
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        this.updateDisplay();
        this.createKeyboard();
        this.resetHangman();
    }
    
    setupEventListeners() {
        // Keyboard click events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('key')) {
                const letter = e.target.dataset.letter;
                this.guessLetter(letter);
            }
        });
        
        // Physical keyboard events
        document.addEventListener('keydown', (e) => {
            // Secret key combination for host access (Ctrl+Shift+A)
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                document.getElementById('admin-btn').style.display = 'inline-block';
                this.showStatus('Host access enabled - Admin panel is now visible', 'info');
                return;
            }
            
            if (this.gameStarted) {
                const letter = e.key.toUpperCase();
                if (letter.match(/[A-Z]/) && letter.length === 1) {
                    this.guessLetter(letter);
                }
            }
        });
        
        // Employee ID submission
        document.getElementById('submit-id').addEventListener('click', () => this.submitEmployeeId());
        document.getElementById('employee-id').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitEmployeeId();
            }
        });
        
        // Game control buttons
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        document.getElementById('next-level').addEventListener('click', () => this.nextLevel());
        document.getElementById('exit-game').addEventListener('click', () => this.exitGame());
        
        // Admin panel
        document.getElementById('admin-btn').addEventListener('click', () => this.showAdminPanel());
        document.getElementById('save-config').addEventListener('click', () => this.saveConfiguration());
        document.getElementById('view-results').addEventListener('click', () => this.viewResults());
        document.getElementById('download-all-results').addEventListener('click', () => this.downloadAllResults());
        document.getElementById('clear-results').addEventListener('click', () => this.clearResults());
        
        // Modal close events
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }
    
    submitEmployeeId() {
        const employeeId = document.getElementById('employee-id').value.trim().toUpperCase();
        const errorDiv = document.getElementById('employee-error');
        
        if (!employeeId) {
            errorDiv.textContent = 'Please enter your Employee ID';
            errorDiv.style.display = 'block';
            return;
        }
        
        if (employeeId.length < 3) {
            errorDiv.textContent = 'Employee ID must be at least 3 characters';
            errorDiv.style.display = 'block';
            return;
        }
        
        this.currentEmployeeId = employeeId;
        this.gameStartTime = new Date();
        
        // Generate secure session token
        this.generateSessionToken(employeeId);
        
        // Hide employee entry and show game area
        document.getElementById('employee-entry').style.display = 'none';
        document.querySelector('.game-area').style.display = 'grid';
        
        this.showStatus(`Welcome ${employeeId}! Click "Start Game" to begin!`, 'info');
    }
    
    startGame() {
        this.gameStarted = true;
        this.currentLevel = 1;
        this.resetLevel();
        document.getElementById('start-game').style.display = 'none';
        this.showStatus('Game started! Good luck!', 'info');
    }
    
    async resetLevel() {
        this.chances = this.maxChances;
        this.guessedLetters.clear();
        this.correctLetters.clear();
        
        // Fetch word securely from API
        try {
            const wordData = await this.fetchWordFromAPI(this.currentLevel);
            if (wordData.error) {
                throw new Error(wordData.error);
            }
            
            this.currentWord = wordData.word.toUpperCase();
            this.currentHint = wordData.hint;
        } catch (error) {
            console.error('Failed to fetch word:', error);
            this.showStatus('Error loading game data. Please refresh.', 'error');
            return;
        }
        
        this.updateDisplay();
        this.resetKeyboard();
        this.resetHangman();
        this.updateWordDisplay();
        document.getElementById('hint-text').textContent = this.currentHint;
    }
    
    guessLetter(letter) {
        if (!this.gameStarted || this.guessedLetters.has(letter) || this.chances <= 0) {
            return;
        }
        
        this.guessedLetters.add(letter);
        
        const keyElement = document.querySelector(`[data-letter="${letter}"]`);
        
        if (this.currentWord.includes(letter)) {
            // Correct guess
            this.correctLetters.add(letter);
            keyElement.classList.add('correct');
            keyElement.disabled = true;
            this.updateWordDisplay();
            
            // Check if word is complete
            if (this.isWordComplete()) {
                this.levelComplete();
            }
        } else {
            // Incorrect guess
            this.chances--;
            keyElement.classList.add('incorrect');
            keyElement.disabled = true;
            this.updateDisplay();
            this.drawHangmanPart();
            
            if (this.chances <= 0) {
                this.gameOver();
            }
        }
    }
    
    isWordComplete() {
        return this.currentWord.split('').every(letter => this.correctLetters.has(letter));
    }
    
    levelComplete() {
        const result = {
            employeeId: this.currentEmployeeId,
            level: this.currentLevel,
            word: this.currentWord,
            attemptsUsed: this.maxChances - this.chances,
            completed: true,
            gameCompleted: this.currentLevel >= this.maxLevels,
            exitedEarly: false,
            startTime: this.gameStartTime,
            endTime: new Date(),
            timestamp: new Date().toISOString()
        };
        
        this.gameResults.push(result);
        this.saveResults();
        
        if (this.currentLevel >= this.maxLevels) {
            this.gameComplete();
        } else {
            this.showStatus(`Level ${this.currentLevel} complete! Well done!`, 'success');
            document.getElementById('next-level').style.display = 'inline-block';
        }
    }
    
    gameOver() {
        const result = {
            employeeId: this.currentEmployeeId,
            level: this.currentLevel,
            word: this.currentWord,
            attemptsUsed: this.maxChances,
            completed: false,
            gameCompleted: false,
            exitedEarly: false,
            startTime: this.gameStartTime,
            endTime: new Date(),
            timestamp: new Date().toISOString()
        };
        
        this.gameResults.push(result);
        this.saveResults();
        this.sendResultToServer(result);
        
        this.showStatus(`Game Over! The word was: ${this.currentWord}`, 'error');
        this.gameStarted = false;
        document.getElementById('exit-game').style.display = 'inline-block';
        this.disableKeyboard();
    }
    
    gameComplete() {
        // Send final game completion result to server
        const finalResult = this.gameResults[this.gameResults.length - 1];
        if (finalResult) {
            this.sendResultToServer(finalResult);
        }
        
        this.showStatus('🎉 Congratulations! You completed all 10 levels! 🎉', 'success');
        this.gameStarted = false;
        document.getElementById('exit-game').style.display = 'inline-block';
        this.disableKeyboard();
    }
    
    nextLevel() {
        this.currentLevel++;
        this.resetLevel();
        document.getElementById('next-level').style.display = 'none';
        this.showStatus(`Level ${this.currentLevel} - Good luck!`, 'info');
    }
    
    exitGame() {
        if (confirm('Are you sure you want to exit the game? Your progress will be saved.')) {
            // Save incomplete game result if in progress
            if (this.gameStarted) {
                const result = {
                    employeeId: this.currentEmployeeId,
                    level: this.currentLevel,
                    word: this.currentWord,
                    attemptsUsed: this.maxChances - this.chances,
                    completed: false,
                    gameCompleted: false,
                    exitedEarly: true,
                    startTime: this.gameStartTime,
                    endTime: new Date(),
                    timestamp: new Date().toISOString()
                };
                
                this.gameResults.push(result);
                this.sendResultToServer(result);
            }
            
            // Reset to employee entry screen
            this.currentLevel = 1;
            this.gameStarted = false;
            this.currentEmployeeId = '';
            
            document.querySelector('.game-area').style.display = 'none';
            document.getElementById('employee-entry').style.display = 'flex';
            document.getElementById('employee-id').value = '';
            document.getElementById('employee-error').style.display = 'none';
            
            document.getElementById('start-game').style.display = 'inline-block';
            document.getElementById('next-level').style.display = 'none';
            document.getElementById('exit-game').style.display = 'none';
            
            this.showStatus('Game exited. Enter Employee ID to start a new game.', 'info');
        }
    }
    
    updateDisplay() {
        document.getElementById('current-level').textContent = this.currentLevel;
        document.getElementById('chances-left').textContent = this.chances;
    }
    
    updateWordDisplay() {
        const wordDisplay = document.getElementById('word-display');
        wordDisplay.innerHTML = '';
        
        this.currentWord.split('').forEach(letter => {
            const letterSpan = document.createElement('span');
            letterSpan.className = 'letter';
            letterSpan.textContent = this.correctLetters.has(letter) ? letter : '_';
            wordDisplay.appendChild(letterSpan);
        });
    }
    
    createKeyboard() {
        // Keyboard is already created in HTML, just need to ensure it's enabled
        this.resetKeyboard();
    }
    
    resetKeyboard() {
        document.querySelectorAll('.key').forEach(key => {
            key.classList.remove('correct', 'incorrect');
            key.disabled = false;
        });
    }
    
    disableKeyboard() {
        document.querySelectorAll('.key').forEach(key => {
            key.disabled = true;
        });
    }
    
    resetHangman() {
        const hangmanParts = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];
        hangmanParts.forEach(part => {
            document.getElementById(part).style.display = 'none';
        });
    }
    
    drawHangmanPart() {
        const hangmanParts = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg'];
        const partIndex = this.maxChances - this.chances - 1;
        
        if (partIndex >= 0 && partIndex < hangmanParts.length) {
            const part = document.getElementById(hangmanParts[partIndex]);
            part.style.display = 'block';
            part.classList.add('hangman-part');
        }
        
        // Show right leg on the 5th (final) incorrect guess
        if (this.chances === 0) {
            const rightLeg = document.getElementById('rightLeg');
            rightLeg.style.display = 'block';
            rightLeg.classList.add('hangman-part');
        }
    }
    
    showStatus(message, type) {
        const statusElement = document.getElementById('game-status');
        statusElement.textContent = message;
        statusElement.className = `game-status ${type}`;
        
        // Auto-hide status after 3 seconds for info messages
        if (type === 'info') {
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = 'game-status';
            }, 3000);
        }
    }
    
    // Admin Panel Functions
    showAdminPanel() {
        this.createWordConfigForm();
        document.getElementById('admin-modal').style.display = 'block';
    }
    
    async createWordConfigForm() {
        const container = document.getElementById('word-config');
        container.innerHTML = '<p>Loading current configuration...</p>';
        
        try {
            // Load current words from API for admin panel
            const currentWords = [];
            for (let i = 1; i <= 10; i++) {
                const wordData = await this.fetchWordFromAPI(i);
                if (!wordData.error) {
                    currentWords.push(wordData);
                }
            }
            
            container.innerHTML = '';
            
            for (let i = 0; i < 10; i++) {
                const wordData = currentWords[i] || { word: '', hint: '' };
                const group = document.createElement('div');
                group.className = 'word-input-group';
                group.innerHTML = `
                    <label>Level ${i + 1}:</label>
                    <input type="text" id="word-${i}" placeholder="Enter word" value="${wordData.word || ''}">
                    <input type="text" id="hint-${i}" placeholder="Enter hint" value="${wordData.hint || ''}">
                `;
                container.appendChild(group);
            }
        } catch (error) {
            container.innerHTML = '<p>Error loading configuration. Please try again.</p>';
        }
    }
    
    async saveConfiguration() {
        const newConfig = [];
        
        for (let i = 0; i < 10; i++) {
            const word = document.getElementById(`word-${i}`).value.trim().toUpperCase();
            const hint = document.getElementById(`hint-${i}`).value.trim();
            
            if (word && hint) {
                newConfig.push({ level: i + 1, word, hint });
            } else {
                alert(`Please fill in both word and hint for Level ${i + 1}`);
                return;
            }
        }
        
        try {
            const result = await this.updateWordsViaAPI(this.adminPassword, newConfig);
            if (result.error) {
                alert('Failed to save configuration: ' + result.error);
                return;
            }
            
            this.wordsAndHints = newConfig;
            this.saveConfig();
            alert('Configuration saved successfully!');
            document.getElementById('admin-modal').style.display = 'none';
        } catch (error) {
            alert('Failed to save configuration. Please try again.');
        }
    }
    
    viewResults() {
        const password = document.getElementById('admin-password').value;
        
        if (password !== this.adminPassword) {
            alert('Incorrect admin password!');
            return;
        }
        
        // Show download button for host
        document.getElementById('download-all-results').style.display = 'inline-block';
        
        this.displayResults();
        document.getElementById('admin-modal').style.display = 'none';
        document.getElementById('results-modal').style.display = 'block';
    }
    
    displayResults() {
        const resultsContent = document.getElementById('results-content');
        
        if (this.gameResults.length === 0) {
            resultsContent.innerHTML = '<p>No game results yet.</p>';
            return;
        }
        
        let html = '<h3>Game Results:</h3>';
        this.gameResults.forEach((result, index) => {
            const date = new Date(result.timestamp).toLocaleString();
            const status = result.completed ? '✅ Completed' : '❌ Failed';
            const attempts = result.attemptsUsed;
            
            html += `
                <div class="result-item">
                    <strong>Game ${index + 1} - Level ${result.level}</strong><br>
                    Word: ${result.word}<br>
                    Status: ${status}<br>
                    Attempts Used: ${attempts}/${this.maxChances}<br>
                    Date: ${date}
                </div>
            `;
        });
        
        resultsContent.innerHTML = html;
    }
    
    downloadAllResults() {
        // Use the centralized saveResultsToFile method
        this.saveResultsToFile();
        alert('All centralized results downloaded successfully!');
    }
    
    clearResults() {
        if (confirm('Are you sure you want to clear all results?')) {
            this.gameResults = [];
            this.saveResults();
            this.displayResults();
        }
    }
    
    // Local Storage Functions
    saveConfig() {
        localStorage.setItem('hangman-config', JSON.stringify(this.wordsAndHints));
    }
    
    loadSavedConfig() {
        const saved = localStorage.getItem('hangman-config');
        if (saved) {
            try {
                this.wordsAndHints = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading saved configuration:', e);
            }
        }
    }
    
    saveResults() {
        localStorage.setItem('hangman-results', JSON.stringify(this.gameResults));
    }
    
    loadResults() {
        const saved = localStorage.getItem('hangman-results');
        if (saved) {
            try {
                this.gameResults = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading saved results:', e);
            }
        }
    }
    
    generateSessionToken(employeeId) {
        // Create a session token for secure API access
        const timestamp = Date.now();
        this.sessionToken = btoa(employeeId + '_' + timestamp + '_hangman_secure');
    }
    
    async fetchWordFromAPI(level) {
        try {
            // Load the API iframe to access the secure functions
            const iframe = document.createElement('iframe');
            iframe.src = this.wordsApiUrl;
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            
            return new Promise((resolve, reject) => {
                iframe.onload = () => {
                    try {
                        const apiWindow = iframe.contentWindow;
                        const result = apiWindow.getWord(level, this.sessionToken);
                        document.body.removeChild(iframe);
                        resolve(result);
                    } catch (error) {
                        document.body.removeChild(iframe);
                        reject(error);
                    }
                };
                
                iframe.onerror = () => {
                    document.body.removeChild(iframe);
                    reject(new Error('Failed to load API'));
                };
            });
        } catch (error) {
            console.error('API fetch error:', error);
            return { error: 'Failed to fetch word' };
        }
    }
    
    async updateWordsViaAPI(password, newWords) {
        try {
            const iframe = document.createElement('iframe');
            iframe.src = this.wordsApiUrl;
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            
            return new Promise((resolve, reject) => {
                iframe.onload = () => {
                    try {
                        const apiWindow = iframe.contentWindow;
                        const result = apiWindow.updateWords(password, newWords);
                        document.body.removeChild(iframe);
                        resolve(result);
                    } catch (error) {
                        document.body.removeChild(iframe);
                        reject(error);
                    }
                };
            });
        } catch (error) {
            return { error: 'Failed to update words' };
        }
    }
    
    async sendResultToServer(result) {
        try {
            // Send result to a centralized collection service
            // Using FormSubmit.co as a free form submission service
            const formData = new FormData();
            formData.append('employeeId', result.employeeId);
            formData.append('level', result.level);
            formData.append('word', result.word);
            formData.append('attemptsUsed', result.attemptsUsed);
            formData.append('completed', result.completed);
            formData.append('gameCompleted', result.gameCompleted);
            formData.append('exitedEarly', result.exitedEarly);
            formData.append('startTime', result.startTime);
            formData.append('endTime', result.endTime);
            formData.append('timestamp', result.timestamp);
            formData.append('gameData', JSON.stringify(result));
            
            // You'll need to replace this URL with your own endpoint
            // For now, we'll store in a global results array for demo
            if (!window.globalGameResults) {
                window.globalGameResults = [];
            }
            window.globalGameResults.push(result);
            
            // Store in localStorage with a global key
            const existingGlobalResults = JSON.parse(localStorage.getItem('hangman-global-results') || '[]');
            existingGlobalResults.push(result);
            localStorage.setItem('hangman-global-results', JSON.stringify(existingGlobalResults));
            
            console.log('Result sent to centralized storage');
            
            // Send to Google Sheets for real-time updates
            try {
                await this.sendToGoogleSheets(result);
                console.log('Result sent to Google Sheets');
            } catch (sheetsError) {
                console.log('Google Sheets service failed:', sheetsError);
            }
            
            // Send to FormSubmit.co for email collection (backup)
            try {
                await fetch('https://formsubmit.co/SaiBhyravaHariKiran.Cherukupalli@cognizant.com', {
                    method: 'POST',
                    body: formData
                });
                console.log('Result sent to email service');
            } catch (emailError) {
                console.log('Email service not configured or failed');
            }
            
        } catch (error) {
            console.error('Failed to send result to server:', error);
            // Fallback: store locally
            console.log('Storing result locally as fallback');
        }
    }
    
    // Method for admin to download centralized results
    saveResultsToFile() {
        // Get all results from global storage
        const globalResults = JSON.parse(localStorage.getItem('hangman-global-results') || '[]');
        
        if (globalResults.length === 0) {
            alert('No results found in centralized storage.');
            return;
        }
        
        let allResultsText = `HANGMAN GAME - ALL PLAYER RESULTS (CENTRALIZED)\n`;
        allResultsText += `Generated: ${new Date().toLocaleString()}\n`;
        allResultsText += `Total Games: ${globalResults.length}\n`;
        allResultsText += `${'='.repeat(50)}\n\n`;
        
        // Group results by employee ID
        const resultsByEmployee = {};
        globalResults.forEach(result => {
            if (!resultsByEmployee[result.employeeId]) {
                resultsByEmployee[result.employeeId] = [];
            }
            resultsByEmployee[result.employeeId].push(result);
        });
        
        // Generate detailed report
        Object.keys(resultsByEmployee).forEach(employeeId => {
            const employeeResults = resultsByEmployee[employeeId];
            allResultsText += `EMPLOYEE: ${employeeId}\n`;
            allResultsText += `-`.repeat(30) + `\n`;
            
            employeeResults.forEach((result, index) => {
                const duration = result.endTime ? 
                    Math.round((new Date(result.endTime) - new Date(result.startTime)) / 1000) : 0;
                
                allResultsText += `Game ${index + 1}:\n`;
                allResultsText += `  Date: ${new Date(result.timestamp).toLocaleString()}\n`;
                allResultsText += `  Level Reached: ${result.level} / 10\n`;
                allResultsText += `  Last Word: ${result.word}\n`;
                allResultsText += `  Status: ${result.gameCompleted ? 'COMPLETED ALL LEVELS' : 
                                             result.exitedEarly ? 'EXITED EARLY' : 'FAILED'}\n`;
                allResultsText += `  Attempts (Last Level): ${result.attemptsUsed} / 5\n`;
                allResultsText += `  Duration: ${duration} seconds\n`;
                allResultsText += `  Started: ${new Date(result.startTime).toLocaleString()}\n`;
                allResultsText += `  Ended: ${new Date(result.endTime).toLocaleString()}\n\n`;
            });
            
            allResultsText += `\n`;
        });
        
        // Statistics
        const totalGames = globalResults.length;
        const completedGames = globalResults.filter(r => r.gameCompleted).length;
        const failedGames = globalResults.filter(r => !r.completed && !r.exitedEarly).length;
        const exitedGames = globalResults.filter(r => r.exitedEarly).length;
        
        allResultsText += `\nSTATISTICS:\n`;
        allResultsText += `${'='.repeat(20)}\n`;
        allResultsText += `Total Games: ${totalGames}\n`;
        allResultsText += `Fully Completed: ${completedGames} (${Math.round(completedGames/totalGames*100)}%)\n`;
        allResultsText += `Failed: ${failedGames} (${Math.round(failedGames/totalGames*100)}%)\n`;
        allResultsText += `Exited Early: ${exitedGames} (${Math.round(exitedGames/totalGames*100)}%)\n`;
        allResultsText += `Unique Players: ${Object.keys(resultsByEmployee).length}\n`;
        
        // Create and download the consolidated file
        const blob = new Blob([allResultsText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `hangman_all_results_centralized_${new Date().toISOString().slice(0,10)}.txt`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('Centralized results file downloaded');
    }
    
    async sendToGoogleSheets(result) {
        // Don't send if Google Sheets URL is not configured
        if (!this.googleSheetsUrl || this.googleSheetsUrl.includes('YOUR_GOOGLE_SHEETS')) {
            console.log('Google Sheets URL not configured');
            return;
        }
        
        try {
            // Prepare data for Google Sheets
            const formData = new FormData();
            formData.append('employeeId', result.employeeId);
            formData.append('level', result.level.toString());
            formData.append('word', result.word);
            formData.append('attemptsUsed', result.attemptsUsed.toString());
            formData.append('completed', result.completed.toString());
            formData.append('gameCompleted', result.gameCompleted.toString());
            formData.append('exitedEarly', result.exitedEarly.toString());
            formData.append('startTime', result.startTime);
            formData.append('endTime', result.endTime);
            formData.append('timestamp', result.timestamp);
            
            // Send to Google Sheets via Apps Script Web App
            const response = await fetch(this.googleSheetsUrl, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            
            if (responseData.error) {
                throw new Error(responseData.error);
            }
            
            console.log('Successfully sent to Google Sheets:', responseData);
            return responseData;
            
        } catch (error) {
            console.error('Failed to send to Google Sheets:', error);
            throw error;
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new HangmanGame();
    game.loadResults(); // Load saved results
});

// Prevent right-click context menu on keys for better UX
document.addEventListener('contextmenu', (e) => {
    if (e.target.classList.contains('key')) {
        e.preventDefault();
    }
}); 