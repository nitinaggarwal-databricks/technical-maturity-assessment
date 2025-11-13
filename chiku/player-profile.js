// Player Progression System
export class PlayerProfile {
    constructor() {
        this.loadProfile();
    }
    
    loadProfile() {
        const saved = localStorage.getItem('projectVelocityProfile');
        if (saved) {
            const data = JSON.parse(saved);
            this.level = data.level || 1;
            this.xp = data.xp || 0;
            this.credits = data.credits || 5000;
            this.tokens = data.tokens || 100;
            this.racesWon = data.racesWon || 0;
            this.totalRaces = data.totalRaces || 0;
            this.bestLaps = data.bestLaps || {};
            this.ownedCars = data.ownedCars || [0, 1, 2, 3]; // All cars free for MVP
            this.unlockedTracks = data.unlockedTracks || [0, 1, 2, 3];
        } else {
            // Default values
            this.level = 1;
            this.xp = 0;
            this.credits = 5000;
            this.tokens = 100;
            this.racesWon = 0;
            this.totalRaces = 0;
            this.bestLaps = {};
            this.ownedCars = [0, 1, 2, 3];
            this.unlockedTracks = [0, 1, 2, 3];
        }
    }
    
    saveProfile() {
        const data = {
            level: this.level,
            xp: this.xp,
            credits: this.credits,
            tokens: this.tokens,
            racesWon: this.racesWon,
            totalRaces: this.totalRaces,
            bestLaps: this.bestLaps,
            ownedCars: this.ownedCars,
            unlockedTracks: this.unlockedTracks
        };
        localStorage.setItem('projectVelocityProfile', JSON.stringify(data));
    }
    
    addXP(amount) {
        this.xp += amount;
        
        // Level up calculation (exponential)
        const xpNeeded = this.getXPForNextLevel();
        if (this.xp >= xpNeeded) {
            this.levelUp();
        }
        
        this.updateUI();
        this.saveProfile();
    }
    
    getXPForNextLevel() {
        return Math.floor(1000 * Math.pow(1.5, this.level - 1));
    }
    
    getCurrentXPProgress() {
        const current = this.xp;
        const needed = this.getXPForNextLevel();
        return (current / needed) * 100;
    }
    
    levelUp() {
        this.level++;
        this.xp = 0;
        
        // Rewards for leveling up
        const creditReward = 1000 * this.level;
        const tokenReward = 10 * this.level;
        
        this.addCredits(creditReward);
        this.addTokens(tokenReward);
        
        // Show level up notification
        this.showLevelUpNotification(creditReward, tokenReward);
    }
    
    showLevelUpNotification(credits, tokens) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(64, 224, 208, 0.95), rgba(255, 0, 128, 0.95));
            color: white;
            padding: 3rem 4rem;
            border-radius: 20px;
            font-size: 2rem;
            font-family: 'Orbitron', sans-serif;
            z-index: 1000;
            text-align: center;
            animation: bounceIn 0.5s ease;
            box-shadow: 0 20px 60px rgba(64, 224, 208, 0.6);
        `;
        
        notification.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🎉 LEVEL UP! 🎉</div>
            <div style="font-size: 2.5rem; margin-bottom: 1rem;">Level ${this.level}</div>
            <div style="font-size: 1.2rem; margin-top: 1rem;">
                +${credits.toLocaleString()} Credits<br>
                +${tokens} VT Tokens
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
    
    addCredits(amount) {
        this.credits += amount;
        this.updateUI();
        this.saveProfile();
    }
    
    addTokens(amount) {
        this.tokens += amount;
        this.updateUI();
        this.saveProfile();
    }
    
    spendCredits(amount) {
        if (this.credits >= amount) {
            this.credits -= amount;
            this.updateUI();
            this.saveProfile();
            return true;
        }
        return false;
    }
    
    spendTokens(amount) {
        if (this.tokens >= amount) {
            this.tokens -= amount;
            this.updateUI();
            this.saveProfile();
            return true;
        }
        return false;
    }
    
    recordRaceResult(position, trackId, lapTime) {
        this.totalRaces++;
        
        if (position === 1) {
            this.racesWon++;
        }
        
        // XP rewards based on position
        const xpRewards = [500, 350, 250, 180, 120, 80, 50, 30];
        this.addXP(xpRewards[position - 1] || 10);
        
        // Credit rewards based on position
        const creditRewards = [2000, 1500, 1000, 750, 500, 300, 150, 50];
        this.addCredits(creditRewards[position - 1] || 20);
        
        // Update best lap for track
        if (!this.bestLaps[trackId] || lapTime < this.bestLaps[trackId]) {
            this.bestLaps[trackId] = lapTime;
        }
        
        this.saveProfile();
    }
    
    updateUI() {
        // Update menu stats
        document.getElementById('playerLevel').textContent = this.level;
        document.getElementById('playerCredits').textContent = this.credits.toLocaleString();
        document.getElementById('playerTokens').textContent = this.tokens;
        document.getElementById('racesWon').textContent = this.racesWon;
        
        // Update XP bar
        const xpBar = document.getElementById('xpBar');
        if (xpBar) {
            xpBar.style.width = this.getCurrentXPProgress() + '%';
        }
    }
}


