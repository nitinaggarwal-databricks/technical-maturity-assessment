import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Car } from './car.js';
import { Track } from './track.js';
import { AIController } from './ai.js';
import { PlayerProfile } from './player-profile.js';

class F1RacingGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.world = null;
        
        this.playerCar = null;
        this.aiCars = [];
        this.track = null;
        this.aiControllers = [];
        
        this.gameState = 'menu'; // menu, countdown, racing, finished
        this.selectedCar = 0;
        this.selectedTrack = 0;
        this.currentLap = 1;
        this.totalLaps = 3;
        this.raceStartTime = 0;
        this.lapStartTime = 0;
        this.bestLapTime = Infinity;
        this.countdownValue = 3;
        
        this.keys = {};
        this.cameraMode = 0; // 0: follow, 1: first person, 2: far
        
        // Player progression
        this.playerProfile = new PlayerProfile();
        this.boostAmount = 100; // Nitro boost percentage
        
        this.clock = new THREE.Clock();
        
        this.init();
        this.setupEventListeners();
        this.playerProfile.updateUI();
    }
    
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.0008);
        
        // Camera setup - OPTIMIZED FOV
        this.camera = new THREE.PerspectiveCamera(
            75,  // Standard FOV for better performance
            window.innerWidth / window.innerHeight,
            0.1,
            1000  // Reduced draw distance for performance
        );
        this.camera.position.set(0, 5, -10);
        
        // Renderer setup - OPTIMIZED FOR PERFORMANCE
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: false, // Disable for better performance
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(1); // Force 1x for better performance
        this.renderer.shadowMap.enabled = false; // Disable shadows for performance
        this.renderer.toneMapping = THREE.NoToneMapping; // Disable for performance
        this.renderer.toneMappingExposure = 1.0;
        
        // DISABLE POST-PROCESSING FOR PERFORMANCE
        // Just use direct rendering
        this.composer = null;
        
        // Physics world - STABLE
        this.world = new CANNON.World();
        this.world.gravity.set(0, -25, 0);
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        this.world.defaultContactMaterial.friction = 0.5;  // More friction = less sliding
        this.world.allowSleep = false;
        
        // Lighting
        this.setupLighting();
        
        // Start animation loop
        this.animate();
    }
    
    setupLighting() {
        // Enhanced ambient light
        const ambientLight = new THREE.AmbientLight(0x606080, 1.5);
        this.scene.add(ambientLight);
        
        // Directional light (sun) - OPTIMIZED
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(100, 150, 100);
        directionalLight.castShadow = false; // Disable shadows
        this.scene.add(directionalLight);
        
        // Hemisphere light - stronger
        const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x545454, 1.2);
        this.scene.add(hemisphereLight);
        
        // Add volumetric light effect
        const fillLight1 = new THREE.DirectionalLight(0x4444ff, 0.5);
        fillLight1.position.set(-50, 50, -50);
        this.scene.add(fillLight1);
        
        const fillLight2 = new THREE.DirectionalLight(0xff4444, 0.5);
        fillLight2.position.set(50, 50, -50);
        this.scene.add(fillLight2);
    }
    
    createSpeedLines() {
        // Disabled for performance
        this.speedLinesMesh = null;
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === 'c' || e.key === 'C') {
                this.cameraMode = (this.cameraMode + 1) % 3;
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Car selection
        document.querySelectorAll('.car-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.car-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedCar = parseInt(option.dataset.car);
            });
        });
        
        // Track selection
        document.querySelectorAll('.track-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.track-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedTrack = parseInt(option.dataset.track);
            });
        });
    }
    
    startRace() {
        // Hide menu
        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('hud').style.display = 'block';
        
        // Clear existing race objects
        this.clearRace();
        
        // Create track
        this.track = new Track(this.scene, this.world, this.selectedTrack);
        
        // Update scene fog to match track theme
        this.scene.fog = new THREE.FogExp2(this.track.theme.fogColor, 0.0006);
        
        // Create player car
        const startPos = this.track.getStartPosition(0);
        this.playerCar = new Car(
            this.scene,
            this.world,
            startPos,
            this.getCarConfig(this.selectedCar),
            true
        );
        
        // Create AI cars (3 opponents - less crowded)
        this.aiCars = [];
        this.aiControllers = [];
        const carConfigs = [
            this.getCarConfig(1),
            this.getCarConfig(2),
            this.getCarConfig(3)
        ];
        
        for (let i = 0; i < 3; i++) {
            const aiStartPos = this.track.getStartPosition(i + 1);
            const aiCar = new Car(
                this.scene,
                this.world,
                aiStartPos,
                carConfigs[i],
                false
            );
            this.aiCars.push(aiCar);
            
            const aiController = new AIController(aiCar, this.track);
            this.aiControllers.push(aiController);
        }
        
        // Start countdown
        this.gameState = 'countdown';
        this.countdownValue = 3;
        this.startCountdown();
    }
    
    clearRace() {
        if (this.playerCar) {
            this.playerCar.destroy();
            this.playerCar = null;
        }
        
        this.aiCars.forEach(car => car.destroy());
        this.aiCars = [];
        this.aiControllers = [];
        
        if (this.track) {
            this.track.destroy();
            this.track = null;
        }
        
        this.currentLap = 1;
        this.bestLapTime = Infinity;
    }
    
    startCountdown() {
        const countdownElement = document.getElementById('countdown');
        countdownElement.style.display = 'block';
        
        const countdown = () => {
            if (this.countdownValue > 0) {
                countdownElement.textContent = this.countdownValue;
                this.countdownValue--;
                setTimeout(countdown, 1000);
            } else {
                countdownElement.textContent = 'GO!';
                setTimeout(() => {
                    countdownElement.style.display = 'none';
                    this.gameState = 'racing';
                    this.raceStartTime = Date.now();
                    this.lapStartTime = Date.now();
                }, 500);
            }
        };
        countdown();
    }
    
    getCarConfig(index) {
        const configs = [
            { color: 0xff0080, name: 'Thunder Bolt', speed: 1.0, handling: 0.9 },
            { color: 0x00ff80, name: 'Viper Strike', speed: 0.9, handling: 1.0 },
            { color: 0xff8c00, name: 'Phoenix Blaze', speed: 1.0, handling: 0.8 },
            { color: 0x8000ff, name: 'Shadow Racer', speed: 0.8, handling: 1.0 }
        ];
        return configs[index % configs.length];
    }
    
    updatePhysics(deltaTime) {
        const timeStep = 1 / 60;
        const maxSubSteps = 5;  // More substeps for stability
        this.world.step(timeStep, deltaTime, maxSubSteps);
        
        // During countdown, keep cars stationary
        if (this.gameState === 'countdown') {
            // Lock all cars in place
            if (this.playerCar && this.playerCar.body) {
                this.playerCar.body.velocity.set(0, 0, 0);
                this.playerCar.body.angularVelocity.set(0, 0, 0);
            }
            this.aiCars.forEach(car => {
                if (car.body) {
                    car.body.velocity.set(0, 0, 0);
                    car.body.angularVelocity.set(0, 0, 0);
                }
            });
            return;
        }
        
        if (this.gameState !== 'racing') return;
        
        // Update player car
        if (this.playerCar) {
            const controls = {
                forward: this.keys['ArrowUp'] || this.keys['w'] || this.keys['W'],
                backward: this.keys['ArrowDown'] || this.keys['s'] || this.keys['S'],
                left: this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A'],
                right: this.keys['ArrowRight'] || this.keys['d'] || this.keys['D'],
                brake: this.keys[' '],
                boost: this.keys['Shift'] && this.boostAmount > 0
            };
            
            // Handle boost
            if (controls.boost && controls.forward) {
                this.boostAmount = Math.max(0, this.boostAmount - deltaTime * 20);
            } else if (!controls.boost) {
                this.boostAmount = Math.min(100, this.boostAmount + deltaTime * 5);
            }
            
            this.playerCar.update(controls, deltaTime);
            this.updateBoostUI();
        }
        
        // Update AI cars
        this.aiControllers.forEach(controller => {
            controller.update(deltaTime);
        });
    }
    
    updateCamera() {
        if (!this.playerCar) return;
        
        const carPosition = this.playerCar.mesh.position;
        const carRotation = this.playerCar.mesh.rotation;
        
        // Smoother camera during countdown
        const lerpSpeed = (this.gameState === 'countdown') ? 0.05 : 0.1;
        
        switch (this.cameraMode) {
            case 0: // Follow camera
                const followDistance = (this.gameState === 'countdown') ? 20 : 12;
                const followHeight = (this.gameState === 'countdown') ? 8 : 5;
                const targetX = carPosition.x - Math.sin(carRotation.y) * followDistance;
                const targetY = carPosition.y + followHeight;
                const targetZ = carPosition.z - Math.cos(carRotation.y) * followDistance;
                
                this.camera.position.lerp(
                    new THREE.Vector3(targetX, targetY, targetZ),
                    lerpSpeed
                );
                this.camera.lookAt(carPosition);
                break;
                
            case 1: // First person
                const fpHeight = 1.5;
                const fpForward = 1;
                this.camera.position.set(
                    carPosition.x + Math.sin(carRotation.y) * fpForward,
                    carPosition.y + fpHeight,
                    carPosition.z + Math.cos(carRotation.y) * fpForward
                );
                this.camera.rotation.y = carRotation.y;
                break;
                
            case 2: // Far camera
                const farDistance = 20;
                const farHeight = 10;
                const farX = carPosition.x - Math.sin(carRotation.y) * farDistance;
                const farY = carPosition.y + farHeight;
                const farZ = carPosition.z - Math.cos(carRotation.y) * farDistance;
                
                this.camera.position.lerp(
                    new THREE.Vector3(farX, farY, farZ),
                    0.05
                );
                this.camera.lookAt(carPosition);
                break;
        }
    }
    
    updateHUD() {
        if (this.gameState !== 'racing') return;
        
        // Speed
        if (this.playerCar) {
            const speed = Math.abs(this.playerCar.getCurrentSpeed());
            document.getElementById('speedValue').textContent = Math.round(speed);
        }
        
        // Position
        const positions = this.calculatePositions();
        const playerPosition = positions.findIndex(car => car === this.playerCar) + 1;
        const suffix = ['th', 'st', 'nd', 'rd'];
        const suffixIndex = playerPosition <= 3 ? playerPosition : 0;
        document.getElementById('position').textContent = playerPosition + (suffix[suffixIndex] || 'th');
        
        // Lap
        document.getElementById('lap').textContent = `${this.currentLap}/${this.totalLaps}`;
        
        // Time
        const currentTime = Date.now() - this.raceStartTime;
        document.getElementById('time').textContent = this.formatTime(currentTime);
        
        // Best lap
        if (this.bestLapTime !== Infinity) {
            document.getElementById('bestLap').textContent = this.formatTime(this.bestLapTime);
        }
        
        // Leaderboard
        this.updateLeaderboard(positions);
        
        // Minimap
        this.updateMinimap();
        
        // Check lap completion
        this.checkLapCompletion();
    }
    
    calculatePositions() {
        const allCars = [this.playerCar, ...this.aiCars];
        return allCars.sort((a, b) => {
            if (a.currentLap !== b.currentLap) {
                return b.currentLap - a.currentLap;
            }
            return b.trackProgress - a.trackProgress;
        });
    }
    
    updateLeaderboard(positions) {
        const leaderboardContent = document.getElementById('leaderboardContent');
        leaderboardContent.innerHTML = '';
        
        positions.slice(0, 8).forEach((car, index) => {
            const entry = document.createElement('div');
            entry.className = 'leaderboard-entry';
            if (car === this.playerCar) {
                entry.classList.add('player');
            }
            
            const position = document.createElement('span');
            position.textContent = `${index + 1}.`;
            
            const name = document.createElement('span');
            name.textContent = car === this.playerCar ? 'YOU' : `AI ${index}`;
            
            entry.appendChild(position);
            entry.appendChild(name);
            leaderboardContent.appendChild(entry);
        });
    }
    
    updateMinimap() {
        const canvas = document.getElementById('minimap');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, width, height);
        
        if (!this.track || !this.playerCar) return;
        
        const scale = 2;
        const offsetX = width / 2;
        const offsetY = height / 2;
        
        // Draw track outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        this.track.waypoints.forEach((wp, i) => {
            const x = offsetX + (wp.x - this.playerCar.mesh.position.x) * scale;
            const y = offsetY + (wp.z - this.playerCar.mesh.position.z) * scale;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();
        
        // Draw player car
        ctx.fillStyle = '#40e0d0';
        ctx.beginPath();
        ctx.arc(offsetX, offsetY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw AI cars
        ctx.fillStyle = '#ff0080';
        this.aiCars.forEach(car => {
            const x = offsetX + (car.mesh.position.x - this.playerCar.mesh.position.x) * scale;
            const y = offsetY + (car.mesh.position.z - this.playerCar.mesh.position.z) * scale;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    checkLapCompletion() {
        if (!this.playerCar || !this.track) return;
        
        const checkpointsPassed = this.playerCar.checkpointsPassed;
        const totalCheckpoints = this.track.waypoints.length;
        
        if (checkpointsPassed >= totalCheckpoints && this.playerCar.trackProgress > 0.95) {
            this.completeLap();
        }
    }
    
    completeLap() {
        const lapTime = Date.now() - this.lapStartTime;
        
        if (lapTime < this.bestLapTime && this.currentLap > 1) {
            this.bestLapTime = lapTime;
        }
        
        this.currentLap++;
        this.lapStartTime = Date.now();
        this.playerCar.checkpointsPassed = 0;
        
        if (this.currentLap > this.totalLaps) {
            this.endRace();
        }
    }
    
    endRace() {
        this.gameState = 'finished';
        document.getElementById('hud').style.display = 'none';
        
        const positions = this.calculatePositions();
        const playerPosition = positions.findIndex(car => car === this.playerCar) + 1;
        const totalTime = Date.now() - this.raceStartTime;
        
        // Record race result in player profile
        this.playerProfile.recordRaceResult(
            playerPosition,
            this.selectedTrack,
            this.bestLapTime
        );
        
        this.showResults(playerPosition, totalTime);
    }
    
    updateBoostUI() {
        const boostBar = document.getElementById('boostBar');
        if (boostBar) {
            const blocks = Math.floor((this.boostAmount / 100) * 12);
            boostBar.textContent = '█'.repeat(blocks) + '░'.repeat(12 - blocks);
            
            if (this.boostAmount < 30) {
                boostBar.style.color = '#ff0000';
            } else if (this.boostAmount < 60) {
                boostBar.style.color = '#ff8c00';
            } else {
                boostBar.style.color = '#40e0d0';
            }
        }
    }
    
    showResults(position, time) {
        const resultsScreen = document.getElementById('resultsScreen');
        const resultsContent = document.getElementById('resultsContent');
        
        resultsContent.innerHTML = '';
        
        const positionRow = document.createElement('div');
        positionRow.className = 'result-row' + (position === 1 ? ' winner' : '');
        positionRow.innerHTML = `<span>Final Position:</span><span>${position} / 8</span>`;
        resultsContent.appendChild(positionRow);
        
        const timeRow = document.createElement('div');
        timeRow.className = 'result-row';
        timeRow.innerHTML = `<span>Total Time:</span><span>${this.formatTime(time)}</span>`;
        resultsContent.appendChild(timeRow);
        
        const bestLapRow = document.createElement('div');
        bestLapRow.className = 'result-row';
        bestLapRow.innerHTML = `<span>Best Lap:</span><span>${this.bestLapTime !== Infinity ? this.formatTime(this.bestLapTime) : '--:--'}</span>`;
        resultsContent.appendChild(bestLapRow);
        
        resultsScreen.style.display = 'flex';
    }
    
    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = ms % 1000;
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = Math.min(this.clock.getDelta(), 0.1);
        
        this.updatePhysics(deltaTime);
        this.updateCamera();
        this.updateHUD();
        
        // Direct render (no post-processing)
        this.renderer.render(this.scene, this.camera);
    }
    
    updateSpeedEffects() {
        // Disabled for performance
    }
}

// Global functions for HTML
window.startRace = function() {
    if (!window.game) {
        window.game = new F1RacingGame();
    }
    window.game.startRace();
};

window.backToMenu = function() {
    document.getElementById('resultsScreen').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
    if (window.game) {
        window.game.clearRace();
        window.game.gameState = 'menu';
    }
};

// Initialize game on load
window.addEventListener('load', () => {
    window.game = new F1RacingGame();
});

