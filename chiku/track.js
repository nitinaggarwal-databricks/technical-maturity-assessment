import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Track {
    constructor(scene, world, trackType = 0) {
        this.scene = scene;
        this.world = world;
        this.trackType = trackType;
        
        this.waypoints = [];
        this.trackMeshes = [];
        this.trackBodies = [];
        this.decorations = [];
        
        this.createTrack();
        this.createEnvironment();
        this.createStartingGrid();
    }
    
    createTrack() {
        // Simple oval track with curves
        this.waypoints = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 40),
            new THREE.Vector3(20, 0, 60),
            new THREE.Vector3(50, 0, 70),
            new THREE.Vector3(80, 0, 60),
            new THREE.Vector3(100, 0, 40),
            new THREE.Vector3(100, 0, 0),
            new THREE.Vector3(100, 0, -40),
            new THREE.Vector3(80, 0, -60),
            new THREE.Vector3(50, 0, -70),
            new THREE.Vector3(20, 0, -60),
            new THREE.Vector3(0, 0, -40)
        ];
        
        this.theme = {
            groundColor: 0x2a5a2a,
            trackColor: 0x444444,
            lineColor: 0xffff00,
            skyColor: 0x87ceeb
        };
        
        this.buildSimpleTrack();
    }
    
    buildSimpleTrack() {
        const trackWidth = 25;  // Wide track
        const curveSegments = 20;
        
        const curve = new THREE.CatmullRomCurve3(this.waypoints, true);
        const points = curve.getPoints(this.waypoints.length * curveSegments);
        
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            
            const direction = new THREE.Vector3().subVectors(p2, p1).normalize();
            const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
            
            // SIMPLE TRACK SURFACE
            const trackGeometry = new THREE.PlaneGeometry(trackWidth, p1.distanceTo(p2));
            const trackMaterial = new THREE.MeshStandardMaterial({
                color: this.theme.trackColor,
                roughness: 0.9,
                metalness: 0.1
            });
            
            const trackMesh = new THREE.Mesh(trackGeometry, trackMaterial);
            trackMesh.receiveShadow = true;
            
            const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
            trackMesh.position.copy(midPoint);
            trackMesh.rotation.x = -Math.PI / 2;
            trackMesh.rotation.z = Math.atan2(direction.x, direction.z);
            
            this.scene.add(trackMesh);
            this.trackMeshes.push(trackMesh);
            
            // Physics
            const trackShape = new CANNON.Box(new CANNON.Vec3(trackWidth / 2, 0.1, p1.distanceTo(p2) / 2));
            const trackBody = new CANNON.Body({
                mass: 0,
                shape: trackShape,
                material: new CANNON.Material({ friction: 0.8, restitution: 0.1 })
            });
            
            trackBody.position.copy(midPoint);
            trackBody.quaternion.setFromEuler(-Math.PI / 2, 0, Math.atan2(direction.x, direction.z));
            this.world.addBody(trackBody);
            this.trackBodies.push(trackBody);
            
            // CENTER LINE (every 3rd segment)
            if (i % 3 === 0) {
                const lineGeometry = new THREE.BoxGeometry(0.4, 0.1, p1.distanceTo(p2) * 0.5);
                const lineMaterial = new THREE.MeshStandardMaterial({
                    color: this.theme.lineColor,
                    emissive: this.theme.lineColor,
                    emissiveIntensity: 0.8
                });
                const line = new THREE.Mesh(lineGeometry, lineMaterial);
                line.position.copy(midPoint);
                line.position.y += 0.1;
                line.rotation.x = -Math.PI / 2;
                line.rotation.z = Math.atan2(direction.x, direction.z);
                this.scene.add(line);
                this.trackMeshes.push(line);
            }
            
            // EDGE LINES (no barriers, just lines)
            [-1, 1].forEach(side => {
                const edgeGeometry = new THREE.BoxGeometry(0.5, 0.1, p1.distanceTo(p2));
                const edgeMaterial = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    emissive: 0xffffff,
                    emissiveIntensity: 0.5
                });
                const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
                const offset = perpendicular.clone().multiplyScalar(side * (trackWidth / 2));
                edge.position.copy(midPoint).add(offset);
                edge.position.y += 0.1;
                edge.rotation.x = -Math.PI / 2;
                edge.rotation.z = Math.atan2(direction.x, direction.z);
                this.scene.add(edge);
                this.trackMeshes.push(edge);
            });
        }
    }
    
    createEnvironment() {
        // GROUND
        const groundGeometry = new THREE.PlaneGeometry(800, 800);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: this.theme.groundColor,
            roughness: 0.95,
            metalness: 0.05
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.5;
        ground.receiveShadow = true;
        this.scene.add(ground);
        this.trackMeshes.push(ground);
        
        // Ground physics
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({
            mass: 0,
            shape: groundShape,
            material: new CANNON.Material({ friction: 0.5, restitution: 0.1 })
        });
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        groundBody.position.y = -0.5;
        this.world.addBody(groundBody);
        this.trackBodies.push(groundBody);
        
        // SKY
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: this.theme.skyColor,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
        this.decorations.push(sky);
        
        // SUN
        const sunGeometry = new THREE.SphereGeometry(30, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 1
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.set(200, 200, 200);
        this.scene.add(sun);
        this.decorations.push(sun);
    }
    
    createStartingGrid() {
        const gridSize = 8;
        for (let i = 0; i < gridSize; i++) {
            const row = Math.floor(i / 2);
            const col = i % 2;
            
            const gridGeometry = new THREE.BoxGeometry(3, 0.1, 5);
            const gridMaterial = new THREE.MeshStandardMaterial({
                color: i % 2 === 0 ? 0xffffff : 0x000000,
                emissive: i % 2 === 0 ? 0xffffff : 0x000000,
                emissiveIntensity: 0.3
            });
            
            const gridMarker = new THREE.Mesh(gridGeometry, gridMaterial);
            const startPos = this.waypoints[0];
            gridMarker.position.set(
                startPos.x + (col - 0.5) * 8,
                0.1,
                startPos.z - row * 12 - 15
            );
            
            this.scene.add(gridMarker);
            this.trackMeshes.push(gridMarker);
        }
    }
    
    getStartPosition(gridPosition) {
        const row = Math.floor(gridPosition / 2);
        const col = gridPosition % 2;
        const startPos = this.waypoints[0];
        
        return new THREE.Vector3(
            startPos.x + (col - 0.5) * 8,
            2,
            startPos.z - row * 12 - 15
        );
    }
    
    getWaypoint(index) {
        return this.waypoints[index % this.waypoints.length];
    }
    
    getNearestWaypoint(position) {
        let nearestIndex = 0;
        let nearestDistance = Infinity;
        
        this.waypoints.forEach((waypoint, index) => {
            const distance = position.distanceTo(waypoint);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = index;
            }
        });
        
        return nearestIndex;
    }
    
    destroy() {
        this.trackMeshes.forEach(mesh => this.scene.remove(mesh));
        this.trackBodies.forEach(body => this.world.removeBody(body));
        this.decorations.forEach(decoration => this.scene.remove(decoration));
    }
}
