import * as THREE from 'three';

export class AIController {
    constructor(car, track) {
        this.car = car;
        this.track = track;
        
        this.currentWaypoint = 0;
        this.aggressiveness = 0.7 + Math.random() * 0.3;
        this.skill = 0.6 + Math.random() * 0.4;
        this.lookAheadDistance = 15 + Math.random() * 10;
        
        this.stuckTimer = 0;
        this.lastPosition = new THREE.Vector3();
        this.stuckThreshold = 2.0;
        
        // Find nearest waypoint to start from
        this.currentWaypoint = this.track.getNearestWaypoint(this.car.getPosition());
    }
    
    update(deltaTime) {
        if (!this.car || !this.track) return;
        
        const carPosition = this.car.getPosition();
        
        // Check if stuck
        if (carPosition.distanceTo(this.lastPosition) < 0.1) {
            this.stuckTimer += deltaTime;
        } else {
            this.stuckTimer = 0;
        }
        this.lastPosition.copy(carPosition);
        
        // Get target waypoint
        const targetWaypoint = this.getTargetWaypoint(carPosition);
        
        // Calculate steering and throttle
        const controls = this.calculateControls(carPosition, targetWaypoint, deltaTime);
        
        // Handle stuck situation
        if (this.stuckTimer > 2) {
            controls.backward = true;
            controls.forward = false;
            if (Math.random() > 0.5) {
                controls.left = true;
            } else {
                controls.right = true;
            }
        }
        
        // Update car with AI controls
        this.car.update(controls, deltaTime);
        
        // Update track progress
        this.updateTrackProgress();
    }
    
    getTargetWaypoint(carPosition) {
        // Find the waypoint ahead
        let targetIndex = this.currentWaypoint;
        let searchDistance = 0;
        
        while (searchDistance < this.lookAheadDistance) {
            targetIndex = (targetIndex + 1) % this.track.waypoints.length;
            const waypoint = this.track.waypoints[targetIndex];
            searchDistance += waypoint.distanceTo(
                this.track.waypoints[(targetIndex - 1 + this.track.waypoints.length) % this.track.waypoints.length]
            );
        }
        
        return this.track.waypoints[targetIndex];
    }
    
    calculateControls(carPosition, targetWaypoint, deltaTime) {
        const controls = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            brake: false
        };
        
        // Calculate direction to target
        const directionToTarget = new THREE.Vector3()
            .subVectors(targetWaypoint, carPosition)
            .normalize();
        
        // Get car's forward direction
        const carRotation = this.car.getRotation();
        const carForward = new THREE.Vector3(
            Math.sin(carRotation.y),
            0,
            Math.cos(carRotation.y)
        );
        
        // Calculate angle to target
        const angleToTarget = Math.atan2(
            directionToTarget.x,
            directionToTarget.z
        ) - carRotation.y;
        
        // Normalize angle to [-PI, PI]
        let normalizedAngle = angleToTarget;
        while (normalizedAngle > Math.PI) normalizedAngle -= Math.PI * 2;
        while (normalizedAngle < -Math.PI) normalizedAngle += Math.PI * 2;
        
        // Steering
        const steeringThreshold = 0.1 * this.skill;
        if (Math.abs(normalizedAngle) > steeringThreshold) {
            if (normalizedAngle > 0) {
                controls.right = true;
            } else {
                controls.left = true;
            }
        }
        
        // Throttle control
        const currentSpeed = this.car.getCurrentSpeed();
        const distanceToTarget = carPosition.distanceTo(targetWaypoint);
        const maxSpeedForCorner = this.calculateCornerSpeed(normalizedAngle);
        
        if (currentSpeed < maxSpeedForCorner * this.aggressiveness) {
            controls.forward = true;
        }
        
        // Braking for sharp corners
        if (Math.abs(normalizedAngle) > Math.PI / 3 && currentSpeed > 30) {
            controls.brake = true;
            controls.forward = false;
        }
        
        // Occasional use of handbrake for tight corners (skilled AI only)
        if (this.skill > 0.8 && Math.abs(normalizedAngle) > Math.PI / 2.5) {
            if (Math.random() < 0.3) {
                controls.brake = true;
            }
        }
        
        return controls;
    }
    
    calculateCornerSpeed(angle) {
        // Calculate appropriate speed based on corner angle
        const baseSpeed = 100;
        const angleEffect = Math.cos(angle);
        return baseSpeed * Math.max(0.3, angleEffect);
    }
    
    updateTrackProgress() {
        const carPosition = this.car.getPosition();
        const nearestWaypoint = this.track.getNearestWaypoint(carPosition);
        
        // Update current waypoint if we passed it
        const nextWaypoint = (this.currentWaypoint + 1) % this.track.waypoints.length;
        const distanceToNext = carPosition.distanceTo(this.track.waypoints[nextWaypoint]);
        const distanceToCurrent = carPosition.distanceTo(this.track.waypoints[this.currentWaypoint]);
        
        if (distanceToNext < distanceToCurrent) {
            this.currentWaypoint = nextWaypoint;
            this.car.checkpointsPassed++;
        }
        
        // Calculate progress percentage
        const totalWaypoints = this.track.waypoints.length;
        this.car.trackProgress = (this.currentWaypoint / totalWaypoints) + 
            (distanceToCurrent / (distanceToCurrent + distanceToNext)) * (1 / totalWaypoints);
        
        // Update lap
        if (this.car.checkpointsPassed >= totalWaypoints && this.car.trackProgress > 0.95) {
            this.car.currentLap++;
            this.car.checkpointsPassed = 0;
        }
    }
    
    getAIInfo() {
        return {
            skill: this.skill,
            aggressiveness: this.aggressiveness,
            currentWaypoint: this.currentWaypoint,
            isStuck: this.stuckTimer > 2
        };
    }
}


