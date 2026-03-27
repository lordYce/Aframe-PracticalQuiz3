/**
 * Solar System 3D Visualization with Real Textures
 * A-Frame & Three.js Based Interactive Solar System
 */

document.addEventListener('DOMContentLoaded', function() {
    const scene = document.querySelector('a-scene');
    
    // Scene loaded handler
    scene.addEventListener('loaded', function() {
        console.log('✓ Solar System Loaded Successfully with Real Textures');
        
        // Get camera
        const camera = document.querySelector('a-camera');
        let isZooming = false;
        
        // Mouse wheel zoom with smooth animation
        document.addEventListener('wheel', function(event) {
            event.preventDefault();
            const position = camera.getAttribute('position');
            let distance = Math.sqrt(
                position.x * position.x + 
                position.y * position.y + 
                position.z * position.z
            );
            
            // Adjust zoom speed for better control
            const zoomSpeed = 15;
            if (event.deltaY < 0) {
                distance = Math.max(50, distance - zoomSpeed);
            } else {
                distance = Math.min(600, distance + zoomSpeed);
            }
            
            // Normalize direction and apply new distance
            const length = Math.sqrt(
                position.x * position.x + 
                position.y * position.y + 
                position.z * position.z
            );
            
            if (length > 0) {
                const scale = distance / length;
                camera.setAttribute('position', {
                    x: position.x * scale,
                    y: position.y * scale,
                    z: position.z * scale
                });
            }
        }, { passive: false });
        
        // Keyboard controls
        document.addEventListener('keydown', function(event) {
            const position = camera.getAttribute('position');
            const step = 10;
            
            switch(event.key) {
                case 'ArrowUp':
                    camera.setAttribute('position', {
                        x: position.x,
                        y: position.y + step,
                        z: position.z
                    });
                    break;
                case 'ArrowDown':
                    camera.setAttribute('position', {
                        x: position.x,
                        y: position.y - step,
                        z: position.z
                    });
                    break;
                case 'ArrowLeft':
                    camera.setAttribute('position', {
                        x: position.x - step,
                        y: position.y,
                        z: position.z
                    });
                    break;
                case 'ArrowRight':
                    camera.setAttribute('position', {
                        x: position.x + step,
                        y: position.y,
                        z: position.z
                    });
                    break;
                case ' ':
                    // Reset view
                    camera.setAttribute('position', { x: 0, y: 30, z: 150 });
                    break;
            }
        });

        // Add dense star cloud using Three.js Points for optimal performance
        // Instead of 2500 entities, use 1 geometry with 5000 points
        const scene3js = scene.object3D;
        
        // Create stars using Points (much faster than individual spheres)
        const starsGeometry = new THREE.BufferGeometry();
        const starPositions = [];
        const starColors = [];
        
        const starCount = 850;
        // Realistic stellar colors based on temperature classification
        const colorSet = [
            new THREE.Color('#ffffff'),      // White - A-type stars
            new THREE.Color('#fffacd'),      // Light yellow - F-type stars
            new THREE.Color('#ffff99'),      // Yellow - G-type stars (like Sun)
            new THREE.Color('#ffdd66'),      // Yellow-orange - K-type stars
            new THREE.Color('#ff9955'),      // Orange - M-type stars
            new THREE.Color('#ffccff'),      // Bluish-white - B-type stars
            new THREE.Color('#ddddff'),      // Very pale blue - A-type
            new THREE.Color('#aaddff'),      // Light blue - F-type
            new THREE.Color('#cc88ff'),      // Purplish - rare hot stars
            new THREE.Color('#ff6699')       // Reddish - dwarf stars
        ];
        
        for (let i = 0; i < starCount; i++) {
            // More concentrated distribution near galactic plane
            const distance = Math.random() * 2800 + 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1) * 0.85; // Concentrated near plane
            
            const x = distance * Math.sin(phi) * Math.cos(theta);
            const y = distance * Math.sin(phi) * Math.sin(theta) * 0.6; // Flatten distribution
            const z = distance * Math.cos(phi);
            
            starPositions.push(x, y, z);
            // Weighted color distribution (more yellow/orange realistic stars)
            let color;
            const colorRoll = Math.random();
            if (colorRoll < 0.3) {
                color = colorSet[0]; // 30% white
            } else if (colorRoll < 0.5) {
                color = colorSet[3]; // 20% yellow-orange
            } else if (colorRoll < 0.65) {
                color = colorSet[4]; // 15% orange
            } else if (colorRoll < 0.8) {
                color = colorSet[2]; // 15% yellow
            } else {
                color = colorSet[Math.floor(Math.random() * colorSet.length)]; // 20% varied
            }
            starColors.push(color.r, color.g, color.b);
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starPositions), 3));
        starsGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(starColors), 3));
        
        const starsMaterial = new THREE.PointsMaterial({
            size: 1.5,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            sizeRange: [0.3, 1.8],
            fog: false,  // Stars should stay visible through fog
            sizeVariation: 0.5  // Adds natural size variation to stars
        });
        
        const starField = new THREE.Points(starsGeometry, starsMaterial);
        scene3js.add(starField);
        
        // Create glowing halo stars for luminous night sky effect
        const glowStarGeometry = new THREE.BufferGeometry();
        const glowPositions = [];
        const glowColors = [];
        
        for (let i = 0; i < starCount * 0.4; i++) {  // 40% of stars get halos
            // Use same positions as some of the main stars
            const idx = Math.floor(Math.random() * starCount);
            glowPositions.push(
                starPositions[idx * 3],
                starPositions[idx * 3 + 1],
                starPositions[idx * 3 + 2]
            );
            // Use similar colors
            glowColors.push(
                starColors[idx * 3],
                starColors[idx * 3 + 1],
                starColors[idx * 3 + 2]
            );
        }
        
        glowStarGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(glowPositions), 3));
        glowStarGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(glowColors), 3));
        
        const glowMaterial = new THREE.PointsMaterial({
            size: 3.5,  // Larger for glow effect
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.25,  // Subtle glow
            fog: false
        });
        
        const glowField = new THREE.Points(glowStarGeometry, glowMaterial);
        scene3js.add(glowField);
        
        // Create asteroids in asteroid fields
        const createAsteroidField = function(position, count) {
            const group = new THREE.Group();
            for (let i = 0; i < count; i++) {
                const asteroidGeometry = new THREE.IcosahedronGeometry(
                    Math.random() * 3 + 1, 
                    Math.floor(Math.random() * 2)
                );
                const asteroidMaterial = new THREE.MeshStandardMaterial({
                    color: Math.random() > 0.6 ? '#888888' : (Math.random() > 0.5 ? '#666666' : '#774444'),
                    roughness: 0.7 + Math.random() * 0.3,
                    metalness: Math.random() * 0.3,
                    side: THREE.DoubleSide
                });
                const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
                
                asteroid.position.set(
                    position.x + (Math.random() - 0.5) * 150,
                    position.y + (Math.random() - 0.5) * 100,
                    position.z + (Math.random() - 0.5) * 150
                );
                asteroid.rotation.set(
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2
                );
                group.add(asteroid);
            }
            scene3js.add(group);
            return group;
        };
        
        // Create asteroid fields at specified positions with enhanced density
        createAsteroidField(new THREE.Vector3(300, 200, 400), 85);
        createAsteroidField(new THREE.Vector3(-500, -150, 300), 80);
    });
    
    // Info panel removed for clean immersive view
});

/**
 * Planet Data Configuration
 * Includes real orbital data and properties
 */
const planetData = {
    sun: {
        radius: 12,
        distance: 0,
        speed: 0,
        texture: '2k_sun.jpg',
        info: 'The Sun - Our Star'
    },
    mercury: {
        radius: 2.6,
        distance: 55,
        orbital_period: 12000,
        speed: 47.87,
        texture: '2k_mercury.jpg',
        info: 'Mercury - Smallest Planet'
    },
    venus: {
        radius: 5.5,
        distance: 90,
        orbital_period: 18400,
        speed: 35.02,
        texture: '2k_venus_surface.jpg',
        info: 'Venus - Hottest Planet'
    },
    earth: {
        radius: 5.4,
        distance: 125,
        orbital_period: 31536,
        speed: 29.78,
        texture: '2k_earth_daymap.jpg',
        info: 'Earth - Our Home',
        moons: 1
    },
    mars: {
        radius: 4.2,
        distance: 175,
        orbital_period: 59400,
        speed: 24.07,
        texture: '2k_mars.jpg',
        info: 'Mars - Red Planet'
    },
    jupiter: {
        radius: 11,
        distance: 265,
        orbital_period: 120000,
        speed: 13.07,
        texture: '2k_jupiter.jpg',
        info: 'Jupiter - Gas Giant'
    },
    saturn: {
        radius: 9.2,
        distance: 365,
        orbital_period: 180000,
        speed: 9.68,
        texture: '2k_saturn.jpg',
        rings: '2k_saturn_ring_alpha.png',
        info: 'Saturn - Ringed Planet'
    },
    uranus: {
        radius: 7.0,
        distance: 470,
        orbital_period: 264000,
        speed: 6.80,
        texture: '2k_uranus.jpg',
        info: 'Uranus - Ice Giant'
    },
    neptune: {
        radius: 6.0,
        distance: 570,
        orbital_period: 360000,
        speed: 5.43,
        texture: '2k_neptune.jpg',
        info: 'Neptune - Distant Blue Giant'
    }
};

// Animation performance monitor
let frameCount = 0;
let lastTime = Date.now();
const perfMonitor = setInterval(function() {
    const now = Date.now();
    const elapsed = now - lastTime;
    if (elapsed >= 1000) {
        console.log('FPS:', Math.round(frameCount / (elapsed / 1000)));
        frameCount = 0;
        lastTime = now;
    }
}, 100);

// Optional: Cleanup on page unload
window.addEventListener('beforeunload', function() {
    clearInterval(perfMonitor);
});
