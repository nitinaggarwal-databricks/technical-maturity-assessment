import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Car {
    constructor(scene, world, position, config, isPlayer = false) {
        this.scene = scene;
        this.world = world;
        this.config = config;
        this.isPlayer = isPlayer;
        
        this.mesh = null;
        this.body = null;
        this.wheels = [];
        
        this.maxSpeed = 100 * config.speed;
        this.acceleration = 80 * config.speed;  // DOUBLED for better response
        this.handling = config.handling;
        this.currentSpeed = 0;
        
        this.currentLap = 1;
        this.trackProgress = 0;
        this.checkpointsPassed = 0;
        this.lastCheckpoint = -1;
        
        this.createSimpleCar(position, config.color);
    }
    
    createSimpleCar(position, color) {
        const carGroup = new THREE.Group();
        
        // MAIN CAR BODY - Simple but VISIBLE
        const bodyGeometry = new THREE.BoxGeometry(2, 0.8, 4);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.8,
            roughness: 0.2,
            emissive: color,
            emissiveIntensity: 0.5
        });
        const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        carGroup.add(bodyMesh);
        
        // COCKPIT/CABIN
        const cockpitGeometry = new THREE.BoxGeometry(1.6, 0.6, 2);
        const cockpitMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.5,
            roughness: 0.3
        });
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.set(0, 0.7, -0.2);
        cockpit.castShadow = true;
        carGroup.add(cockpit);
        
        // SPOILER
        const spoilerGeometry = new THREE.BoxGeometry(2, 0.1, 0.8);
        const spoiler = new THREE.Mesh(spoilerGeometry, bodyMaterial);
        spoiler.position.set(0, 1, -2);
        spoiler.castShadow = true;
        carGroup.add(spoiler);
        
        // WHEELS - LARGE AND VISIBLE
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.3,
            roughness: 0.7
        });
        
        const wheelPositions = [
            { x: -1.2, y: -0.4, z: 1.5 },   // Front left
            { x: 1.2, y: -0.4, z: 1.5 },    // Front right
            { x: -1.2, y: -0.4, z: -1.5 },  // Rear left
            { x: 1.2, y: -0.4, z: -1.5 }    // Rear right
        ];
        
        wheelPositions.forEach((pos) => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, pos.y, pos.z);
            wheel.castShadow = true;
            carGroup.add(wheel);
            this.wheels.push(wheel);
        });
        
        // GLOWING UNDERGLOW
        const underglowGeometry = new THREE.PlaneGeometry(2.5, 4.5);
        const underglowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const underglow = new THREE.Mesh(underglowGeometry, underglowMaterial);
        underglow.rotation.x = -Math.PI / 2;
        underglow.position.y = -0.7;
        carGroup.add(underglow);
        
        // Removed underglow light for performance
        
        // HEADLIGHTS
        const headlightGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const headlightMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffee,
            emissive: 0xffffee,
            emissiveIntensity: 2
        });
        
        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-0.7, 0.2, 2.1);
        carGroup.add(leftHeadlight);
        
        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(0.7, 0.2, 2.1);
        carGroup.add(rightHeadlight);
        
        // TAIL LIGHTS
        const tailLightMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 2
        });
        
        const leftTailLight = new THREE.Mesh(headlightGeometry, tailLightMaterial);
        leftTailLight.position.set(-0.8, 0.3, -2.1);
        leftTailLight.scale.set(0.7, 0.7, 0.7);
        carGroup.add(leftTailLight);
        
        const rightTailLight = new THREE.Mesh(headlightGeometry, tailLightMaterial);
        rightTailLight.position.set(0.8, 0.3, -2.1);
        rightTailLight.scale.set(0.7, 0.7, 0.7);
        carGroup.add(rightTailLight);
        
        carGroup.position.copy(position);
        this.scene.add(carGroup);
        this.mesh = carGroup;
        
        // Physics body - STABLE
        const bodyShape = new CANNON.Box(new CANNON.Vec3(1, 0.4, 2));
        this.body = new CANNON.Body({
            mass: 500,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            shape: bodyShape,
            material: new CANNON.Material({ friction: 0.3, restitution: 0.2 }),
            linearDamping: 0.15,
            angularDamping: 0.7  // HIGH DAMPING = prevents spinning
        });
        
        this.body.angularFactor = new CANNON.Vec3(0, 1, 0);
        this.world.addBody(this.body);
    }
    
    update(controls, deltaTime) {
        if (!this.body || !this.mesh) return;
        
        const forward = new CANNON.Vec3();
        this.body.quaternion.vmult(new CANNON.Vec3(0, 0, 1), forward);
        
        if (controls.forward) {
            let accelerationMultiplier = 1.0;
            
            // Boost multiplier
            if (controls.boost) {
                accelerationMultiplier = 2.5;
            }
            
            // MUCH STRONGER FORCE
            const force = forward.scale(this.acceleration * 2000 * accelerationMultiplier);
            this.body.applyForce(force, this.body.position);
        }
        
        if (controls.backward) {
            const force = forward.scale(-this.acceleration * 1000);  // STRONGER braking
            this.body.applyForce(force, this.body.position);
        }
        
        const currentSpeed = this.body.velocity.length();
        
        // STABLE STEERING - prevent spinning
        if (controls.left && currentSpeed > 2) {
            this.body.angularVelocity.y = 2;  // Fixed rotation speed
        } else if (controls.right && currentSpeed > 2) {
            this.body.angularVelocity.y = -2;  // Fixed rotation speed
        } else if (!controls.left && !controls.right) {
            // Stabilize - reduce spinning when not steering
            this.body.angularVelocity.y *= 0.8;
        }
        
        if (controls.brake) {
            this.body.velocity.scale(0.9, this.body.velocity);
            this.body.angularVelocity.y *= 0.5;  // Reduce spinning when braking
        }
        
        // ANTI-SPIN: Always reduce unwanted rotation
        if (!controls.left && !controls.right) {
            this.body.angularVelocity.y *= 0.85;
        }
        
        // CAP MAX ROTATION SPEED
        if (Math.abs(this.body.angularVelocity.y) > 3) {
            this.body.angularVelocity.y = Math.sign(this.body.angularVelocity.y) * 3;
        }
        
        const velocity = this.body.velocity;
        const speed = velocity.length();
        if (speed > this.maxSpeed) {
            velocity.scale(this.maxSpeed / speed, velocity);
        }
        
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
        
        const wheelRotation = speed * deltaTime * 3;
        this.wheels.forEach((wheel, index) => {
            if (index < 2) {
                let steerAngle = 0;
                if (controls.left) steerAngle = 0.4;
                if (controls.right) steerAngle = -0.4;
                wheel.rotation.z = Math.PI / 2;
                wheel.rotation.y = steerAngle;
            }
            wheel.rotation.x += wheelRotation;
        });
        
        this.currentSpeed = speed;
    }
    
    getCurrentSpeed() {
        return this.currentSpeed * 3.6;
    }
    
    getPosition() {
        return this.mesh.position.clone();
    }
    
    getRotation() {
        return this.mesh.rotation.clone();
    }
    
    destroy() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }
        if (this.body) {
            this.world.removeBody(this.body);
        }
    }
}
