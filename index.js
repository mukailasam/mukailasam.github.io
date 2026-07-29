/* ============================================================================
 * LICENSE & ATTRIBUTION NOTICE
 * ----------------------------------------------------------------------------
 * Project: Interactive 3D Brain & Procedural Dendritic Background Simulation
 * Author: Samsondeen Mukaila (Oluyanju - "The Problem Solver")
 * Website: https://mukailasam.space
 * Github: https://github.com/mukailasam
 * LinkedIn: https://linkedin.com/in/mukailasam
 *
 * TERMS OF USE:
 * This software, graphics, and procedural visual algorithms are free to use, 
 * modify, and distribute for personal, educational, or commercial projects, 
 * PROVIDED that prominent, visible credit and a link to the original author's 
 * profile (Samsondeen Mukaila / Oluyanju) are maintained in your project's 
 * source code and user interface.
 * ============================================================================ */

// ==========================================================
// USER CONFIGURATION (Edit properties directly here)
// ==========================================================
const config = {
    rotSpeed: 0.5, // Overall speed of the automatic multi-axis rotation
    fireFrequency: 5.5, // Spontaneous background firing rate
    renderSynapses: true, // Toggle visibility of connection pathways
    renderBrain: true, // Toggle the outer brain's geometric mesh

    // Color Theme Settings
    brainColor: 0x051a24, // Deep solid base of the brain
    wireframeColor: 0x00d2ff, // Neon blue/cyan highlighting the brain folds
    signalColor: 0x00ffd2, // Neon cyan color for active pathways & impulses

    // Scale Settings
    idleScale: 0.14, // Base size of resting turtles
    activeScale: 0.24 // Swell size of firing turtles
};

// --- Scene Setup ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020508, 0.08);

// Measure container dimensions instead of window.innerWidth
const width = container.clientWidth;
const height = container.clientHeight || 400;

const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
camera.position.set(0, 0, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Set alpha to true
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// This makes the canvas background 100% physically transparent
renderer.setClearColor(0x000000, 0);

container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 15;
controls.minDistance = 2.5;

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.12);
scene.add(ambientLight);

const rimLight1 = new THREE.DirectionalLight(config.wireframeColor, 1.5);
rimLight1.position.set(-5, 4, 3);
scene.add(rimLight1);

const rimLight2 = new THREE.DirectionalLight(0xff00aa, 0.7);
rimLight2.position.set(5, -4, -3);
scene.add(rimLight2);

// --- Core Groups ---
const mainBrainGroup = new THREE.Group();
scene.add(mainBrainGroup);

const brainMeshGroup = new THREE.Group();
const synapsesGroup = new THREE.Group();
const neuronsGroup = new THREE.Group();

mainBrainGroup.add(brainMeshGroup);
mainBrainGroup.add(synapsesGroup);
mainBrainGroup.add(neuronsGroup);

brainMeshGroup.visible = config.renderBrain;
synapsesGroup.visible = config.renderSynapses;

// --- Procedural Brain Construction ---
const brainMaterials = {
    wire: new THREE.MeshBasicMaterial({
        color: config.wireframeColor,
        wireframe: true,
        transparent: true,
        opacity: 0.07,
        depthWrite: false
    }),
    solid: new THREE.MeshPhongMaterial({
        color: config.brainColor,
        transparent: true,
        opacity: 0.45,
        shininess: 35,
        flatShading: true,
        side: THREE.DoubleSide
    })
};

function buildBrainGeometry() {
    brainMeshGroup.add(createHemisphere(true));
    brainMeshGroup.add(createHemisphere(false));
    brainMeshGroup.add(createCerebellum());
    brainMeshGroup.add(createBrainstem());
}

function createHemisphere(isLeft) {
    const geometry = new THREE.SphereGeometry(1, 48, 48);
    const pos = geometry.attributes.position;
    const normal = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);
        normal.set(x, y, z).normalize();

        const f1 = 11.5;
        const f2 = 23.0;
        let folds = Math.sin(x * f1) * Math.cos(y * f1) * Math.sin(z * f1) * 0.06;
        folds += Math.sin(x * f2) * Math.cos(y * f2) * Math.sin(z * f2) * 0.015;

        let lobeOffset = Math.sin(z * 2.5) * 0.02;

        const gapOffset = 0.08;
        if (isLeft && x > -gapOffset) {
            x = -gapOffset - (x + gapOffset) * 0.08;
        } else if (!isLeft && x < gapOffset) {
            x = gapOffset - (x - gapOffset) * 0.08;
        }

        pos.setXYZ(i,
            x + normal.x * (folds + lobeOffset),
            y + normal.y * (folds + lobeOffset),
            z + normal.z * (folds + lobeOffset)
        );
    }
    geometry.computeVertexNormals();
    geometry.scale(0.85, 0.95, 1.25);

    const mesh = new THREE.Mesh(geometry, brainMaterials.solid);
    const wire = new THREE.Mesh(geometry, brainMaterials.wire);
    mesh.add(wire);

    mesh.position.x = isLeft ? -0.11 : 0.11;
    mesh.position.y = 0.15;
    return mesh;
}

function createCerebellum() {
    const geometry = new THREE.SphereGeometry(0.55, 32, 32);
    const pos = geometry.attributes.position;
    const normal = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);
        normal.set(x, y, z).normalize();

        let fold = Math.sin(y * 32.0) * 0.018;
        pos.setXYZ(i, x + normal.x * fold, y + normal.y * fold, z + normal.z * fold);
    }
    geometry.computeVertexNormals();
    geometry.scale(0.9, 0.55, 0.7);

    const mesh = new THREE.Mesh(geometry, brainMaterials.solid);
    const wire = new THREE.Mesh(geometry, brainMaterials.wire);
    mesh.add(wire);
    mesh.position.set(0, -0.55, -0.65);
    return mesh;
}

function createBrainstem() {
    const geometry = new THREE.CylinderGeometry(0.15, 0.1, 1.0, 16, 16);
    const pos = geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);
        z -= Math.max(0, -y) * 0.1;
        pos.setXYZ(i, x, y, z);
    }
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, brainMaterials.solid);
    const wire = new THREE.Mesh(geometry, brainMaterials.wire);
    mesh.add(wire);
    mesh.position.set(0, -0.85, -0.15);
    return mesh;
}

buildBrainGeometry();

// --- Vector SVG Texture Templates ---

const idleTurtleSVG = `
      <svg width="60" height="60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 32 C18 18 8 35 26 48 L32 40 Z" fill="#6d8f33" stroke="#1d240c" stroke-width="0.8" />
        <path d="M70 32 C82 18 92 35 74 48 L68 40 Z" fill="#6d8f33" stroke="#1d240c" stroke-width="0.8" />
        <path d="M32 72 C18 88 12 68 28 58 L35 65 Z" fill="#4d6421" stroke="#1d240c" stroke-width="0.8" />
        <path d="M68 72 C82 88 88 68 72 58 L65 65 Z" fill="#4d6421" stroke="#1d240c" stroke-width="0.8" />
        <g>
          <path d="M41 28 C41 8 59 8 59 28" fill="#7da338" stroke="#1d240c" stroke-width="1.2" />
          <circle cx="46" cy="16" r="1.5" fill="#000" />
          <circle cx="54" cy="16" r="1.5" fill="#000" />
        </g>
        <path d="M50 20 C28 20 22 40 22 55 C22 75 30 88 50 88 C70 88 78 75 78 55 C78 40 72 20 50 20 Z" fill="#3c4a1b" stroke="#101407" stroke-width="1.8" />
        <g opacity="0.5" stroke="#000" fill="none" stroke-width="1.0">
          <path d="M50 35 L62 42 V62 L50 72 L38 62 V42 Z" />
          <path d="M38 42 L22 38 M38 62 L22 72 M50 35 V20 M50 72 V88 M62 42 L78 38 M62 62 L78 72" />
          <path d="M22 55 H38 M62 55 H78" />
        </g>
      </svg>
    `;

const firingTurtleSVG = `
      <svg width="60" height="60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 32 C18 18 8 35 26 48 L32 40 Z" fill="#00ffd2" stroke="#007766" stroke-width="1.2" />
        <path d="M70 32 C82 18 92 35 74 48 L68 40 Z" fill="#00ffd2" stroke="#007766" stroke-width="1.2" />
        <path d="M32 72 C18 88 12 68 28 58 L35 65 Z" fill="#00ccff" stroke="#005577" stroke-width="1.2" />
        <path d="M68 72 C82 88 88 68 72 58 L65 65 Z" fill="#00ccff" stroke="#005577" stroke-width="1.2" />
        <g>
          <path d="M41 28 C41 8 59 8 59 28" fill="#ffffff" stroke="#00ffd2" stroke-width="1.5" />
          <circle cx="46" cy="16" r="1.8" fill="#00ffd2" />
          <circle cx="54" cy="16" r="1.8" fill="#00ffd2" />
        </g>
        <path d="M50 20 C28 20 22 40 22 55 C22 75 30 88 50 88 C70 88 78 75 78 55 C78 40 72 20 50 20 Z" fill="#005a77" stroke="#00ffd2" stroke-width="2.2" />
        <g opacity="0.9" stroke="#ffffff" fill="none" stroke-width="1.2">
          <path d="M50 35 L62 42 V62 L50 72 L38 62 V42 Z" />
          <path d="M38 42 L22 38 M38 62 L22 72 M50 35 V20 M50 72 V88 M62 42 L78 38 M62 62 L78 72" />
          <path d="M22 55 H38 M62 55 H78" />
        </g>
      </svg>
    `;

function textureFromSVG(svgString) {
    const img = new Image();
    const texture = new THREE.Texture(img);
    img.onload = () => {
        texture.needsUpdate = true;
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    return texture;
}

const idleTexture = textureFromSVG(idleTurtleSVG);
const firingTexture = textureFromSVG(firingTurtleSVG);

function createGlowTexture(colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);

    const col = new THREE.Color(colorHex);
    const rgbStr = `${Math.floor(col.r * 255)}, ${Math.floor(col.g * 255)}, ${Math.floor(col.b * 255)}`;

    gradient.addColorStop(0, `rgba(${rgbStr}, 1.0)`);
    gradient.addColorStop(0.3, `rgba(${rgbStr}, 0.5)`);
    gradient.addColorStop(0.7, `rgba(${rgbStr}, 0.15)`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
}

const signalGlowTexture = createGlowTexture(config.signalColor);

// --- Generate Neural Network Population ---
const neurons = [];
const synapses = [];
const impulses = [];


// --- Precise Mathematical Boundary Checker ---
function isInsideBrain(pos) {
    // Check Hemispheres (Requires higher padding to clear folds and split)
    {
        const padding = 0.08;
        for (let isLeft of[true, false]) {
            const centerX = isLeft ? -0.11 : 0.11;
            const lx = pos.x - centerX;
            const ly = pos.y - 0.15;
            const lz = pos.z;

            // Undo geometry scale (0.85, 0.95, 1.25)
            const ux = lx / 0.85;
            const uy = ly / 0.95;
            const uz = lz / 1.25;

            const dist = Math.sqrt(ux * ux + uy * uy + uz * uz);
            if (dist > 0.001) {
                const nx = ux / dist;
                const ny = uy / dist;
                const nz = uz / dist;

                // Recreate the exact outer deformed boundary shape
                const f1 = 11.5;
                const f2 = 23.0;
                let folds = Math.sin(nx * f1) * Math.cos(ny * f1) * Math.sin(nz * f1) * 0.06;
                folds += Math.sin(nx * f2) * Math.cos(ny * f2) * Math.sin(nz * f2) * 0.015;
                let lobeOffset = Math.sin(nz * 2.5) * 0.02;

                const maxRadius = 1.0 + folds + lobeOffset;

                // Verify if the point is safely inside the outer shell with padding
                if (dist < maxRadius - padding) {
                    // Enforce split boundary (to keep them strictly out of the central gap)
                    if (isLeft && ux < -0.18) {
                        return true;
                    }
                    if (!isLeft && ux > 0.18) {
                        return true;
                    }
                }
            }
        }
    }

    // Check Cerebellum (Requires medium padding)
    {
        const padding = 0.04;
        const lx = pos.x;
        const ly = pos.y + 0.55;
        const lz = pos.z + 0.65;

        // Undo geometry scale (0.9, 0.55, 0.7)
        const ux = lx / 0.9;
        const uy = ly / 0.55;
        const uz = lz / 0.7;

        const dist = Math.sqrt(ux * ux + uy * uy + uz * uz);
        if (dist > 0.001) {
            const ny = uy / dist;
            let fold = Math.sin(ny * 32.0) * 0.018;
            const maxRadius = 0.55 + fold; // Base radius is 0.55

            if (dist < maxRadius - padding) {
                return true;
            }
        }
    }

    // Check Brainstem (Requires tiny padding because it is thin)
    {
        const padding = 0.02;
        const lx = pos.x;
        const ly = pos.y + 0.85;
        const lz = pos.z + 0.15;

        // Height is 1.0, so local y is between -0.5 and 0.5
        if (ly >= -0.5 + padding && ly <= 0.5 - padding) {
            // Undo brainstem curve deformation
            const uz = lz + Math.max(0, -ly) * 0.1;

            // Interpolate cylinder radius from bottom (0.1) to top (0.15)
            const t = ly + 0.5; // 0 to 1
            const cylinderRadius = 0.1 + t * 0.05;

            const horizontalDist = Math.sqrt(lx * lx + uz * uz);
            if (horizontalDist < cylinderRadius - padding) {
                return true;
            }
        }
    }

    return false;
}

// ==========================================================
// OPTIMIZED GENERATION BOUNDS (Prevents browser lockups)
// ==========================================================
const generatorVolumes = [
    { type: 'ellipse', scale: [0.75, 0.85, 1.15], offset: [-0.11, 0.15, 0], count: 85 }, // Left Hemisphere
    { type: 'ellipse', scale: [0.75, 0.85, 1.15], offset: [0.11, 0.15, 0], count: 85 }, // Right Hemisphere
    { type: 'ellipse', scale: [0.4, 0.2, 0.3], offset: [0, -0.55, -0.65], count: 35 }, // Cerebellum
    { type: 'cylinder', radius: 0.07, height: 0.6, offset: [0, -0.85, -0.15], count: 15 } // Brainstem
];

// --- Generate Neural Network Population ---
function generateNetwork() {
    const idleMaterial = new THREE.SpriteMaterial({ map: idleTexture, transparent: true });

    generatorVolumes.forEach((vol, volIndex) => {
        let generated = 0;
        while (generated < vol.count) {
            let pos = new THREE.Vector3();
            let isValid = false;

            // Rejection loop: keep trying until a point passes the exact boundary check
            while (!isValid) {
                if (vol.type === 'ellipse') {
                    const u = Math.random() * 2 - 1;
                    const phi = Math.random() * Math.PI * 2;
                    const r = Math.pow(Math.random(), 1 / 3);
                    const x = r * Math.sqrt(1 - u * u) * Math.cos(phi);
                    const y = r * Math.sqrt(1 - u * u) * Math.sin(phi);
                    const z = r * u;

                    pos.set(
                        x * vol.scale[0] + vol.offset[0],
                        y * vol.scale[1] + vol.offset[1],
                        z * vol.scale[2] + vol.offset[2]
                    );
                } else if (vol.type === 'cylinder') {
                    const r = Math.sqrt(Math.random()) * vol.radius;
                    const theta = Math.random() * Math.PI * 2;
                    const h = (Math.random() - 0.5) * vol.height;
                    pos.set(
                        r * Math.cos(theta) + vol.offset[0],
                        h + vol.offset[1], -Math.max(0, -h) * 0.1 + r * Math.sin(theta) + vol.offset[2]
                    );
                }

                // Run the optimized analytical boundary check
                if (isInsideBrain(pos)) {
                    // Prevent left hemisphere generator from leaking across the center
                    if (volIndex === 0 && pos.x >= 0) continue;
                    // Prevent right hemisphere generator from leaking across the center
                    if (volIndex === 1 && pos.x <= 0) continue;

                    isValid = true;
                }
            }

            // Create and position sprites on the verified coordinate
            const idleSprite = new THREE.Sprite(idleMaterial);
            idleSprite.position.copy(pos);
            idleSprite.scale.set(config.idleScale, config.idleScale, 1.0);
            neuronsGroup.add(idleSprite);

            const firingMaterial = new THREE.SpriteMaterial({
                map: firingTexture,
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending
            });
            const firingSprite = new THREE.Sprite(firingMaterial);
            firingSprite.position.copy(pos);
            firingSprite.scale.set(config.idleScale, config.idleScale, 1.0);
            neuronsGroup.add(firingSprite);

            const glowMaterial = new THREE.SpriteMaterial({
                map: signalGlowTexture,
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const glowSprite = new THREE.Sprite(glowMaterial);
            glowSprite.position.copy(pos);
            glowSprite.scale.set(0.01, 0.01, 1.0);
            neuronsGroup.add(glowSprite);

            neurons.push({
                position: pos.clone(),
                idleSprite: idleSprite,
                firingSprite: firingSprite,
                firingMat: firingMaterial,
                glowSprite: glowSprite,
                glowMat: glowMaterial,
                state: 'idle',
                timer: 0.0,
                neighbors: []
            });

            generated++;
        }
    });

    const maxDistance = 0.52;
    for (let i = 0; i < neurons.length; i++) {
        for (let j = i + 1; j < neurons.length; j++) {
            const dist = neurons[i].position.distanceTo(neurons[j].position);
            if (dist < maxDistance) {
                neurons[i].neighbors.push(j);
                neurons[j].neighbors.push(i);

                const points = [neurons[i].position, neurons[j].position];
                const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                const lineMaterial = new THREE.LineBasicMaterial({
                    color: config.signalColor,
                    transparent: true,
                    opacity: 0.09,
                    depthWrite: false
                });
                const line = new THREE.Line(lineGeometry, lineMaterial);
                synapsesGroup.add(line);

                synapses.push({
                    lineMesh: line,
                    p1: neurons[i].position,
                    p2: neurons[j].position,
                    n1Index: i,
                    n2Index: j
                });
            }
        }
    }
}
generateNetwork();

// --- Action Potential Impulse Propagation ---
function triggerNeuron(index) {
    const n = neurons[index];
    if (n.state !== 'idle') return;

    n.state = 'firing';
    n.timer = 1.0;

    const branchCount = Math.floor(Math.random() * 2) + 1;
    let spawned = 0;

    const shuffledNeighbors = [...n.neighbors].sort(() => 0.5 - Math.random());

    for (let i = 0; i < shuffledNeighbors.length; i++) {
        if (spawned >= branchCount) break;
        const neighborIdx = shuffledNeighbors[i];

        if (neurons[neighborIdx].state === 'idle') {
            spawnImpulse(index, neighborIdx);
            spawned++;
        }
    }
}

function spawnImpulse(startIndex, endIndex) {
    const impMat = new THREE.SpriteMaterial({
        map: signalGlowTexture,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const sprite = new THREE.Sprite(impMat);
    sprite.scale.set(0.06, 0.06, 1.0);
    sprite.position.copy(neurons[startIndex].position);
    scene.add(sprite);

    impulses.push({
        sprite: sprite,
        startPos: neurons[startIndex].position,
        endPos: neurons[endIndex].position,
        targetIdx: endIndex,
        progress: 0.0,
        speed: 1.8 + Math.random() * 1.5
    });
}

// --- Animation & Control Tick ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    if (config.rotSpeed > 0) {
        mainBrainGroup.rotation.y = time * 0.18 * config.rotSpeed;
        mainBrainGroup.rotation.x = Math.sin(time * 0.12 * config.rotSpeed) * 0.28;
        mainBrainGroup.rotation.z = Math.cos(time * 0.16 * config.rotSpeed) * 0.12;
    }

    neurons.forEach(n => {
        if (n.state === 'firing') {
            n.timer -= delta * 3.0;

            const progress = 1.0 - n.timer;
            const scaleOffset = Math.sin(progress * Math.PI) * (config.activeScale - config.idleScale);
            const currentScale = config.idleScale + scaleOffset;

            n.idleSprite.scale.set(currentScale, currentScale, 1.0);
            n.firingSprite.scale.set(currentScale, currentScale, 1.0);
            n.glowSprite.scale.set(currentScale * 1.8, currentScale * 1.8, 1.0);

            n.firingMat.opacity = Math.sin(progress * Math.PI);
            n.glowMat.opacity = Math.sin(progress * Math.PI) * 0.7;

            if (n.timer <= 0) {
                n.state = 'cooldown';
                n.timer = 1.0;
            }
        } else if (n.state === 'cooldown') {
            n.timer -= delta * 2.0;

            const progress = 1.0 - n.timer;
            const currentScale = config.activeScale - (progress * (config.activeScale - config.idleScale));

            n.idleSprite.scale.set(currentScale, currentScale, 1.0);
            n.firingSprite.scale.set(currentScale, currentScale, 1.0);

            n.firingMat.opacity = Math.max(0, n.firingMat.opacity - delta * 3.0);
            n.glowMat.opacity = Math.max(0, n.glowMat.opacity - delta * 3.0);

            if (n.timer <= 0) {
                n.state = 'idle';
                n.idleSprite.scale.set(config.idleScale, config.idleScale, 1.0);
                n.firingSprite.scale.set(config.idleScale, config.idleScale, 1.0);
            }
        }
    });

    for (let i = impulses.length - 1; i >= 0; i--) {
        const imp = impulses[i];
        imp.progress += delta * imp.speed;

        imp.sprite.position.lerpVectors(imp.startPos, imp.endPos, imp.progress);

        if (imp.progress >= 1.0) {
            triggerNeuron(imp.targetIdx);
            scene.remove(imp.sprite);
            imp.sprite.material.dispose();
            impulses.splice(i, 1);
        }
    }

    const baseTriggerChance = 0.005 * config.fireFrequency;
    if (Math.random() < baseTriggerChance) {
        const idx = Math.floor(Math.random() * neurons.length);
        triggerNeuron(idx);
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

// Standard Resize Handler (adapted cleanly to container scale)
window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight || 400;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
});



// ============================================================================
// BIOLOGICAL NEURAL NETWORK BACKGROUND GENERATOR
// ============================================================================

(function() {
    // Create and force-inject background canvas
    let canvas = document.getElementById('dendrite-bg-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'dendrite-bg-canvas';
        document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        generateAnatomicalNetwork();
    }

    // Draw organic, irregular cell body (Soma)
    function drawSoma(x, y, radius) {
        ctx.beginPath();
        const numPoints = 14;
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const r = radius * (0.8 + Math.random() * 0.4); // Creates bumpy organic shape
            const px = x + Math.cos(angle) * r;
            const py = y + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(110, 125, 140, 0.05)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Nucleus (center core)
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(110, 125, 140, 0.08)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fill();
    }

    // Draw segmented Myelin Sheaths (Axon Blocks) along a curved path
    function drawMyelinatedAxon(startX, startY, endX, endY) {
        // Curve control point
        const ctrlX = startX + (endX - startX) * 0.5 + (Math.random() - 0.5) * 100;
        const ctrlY = startY + (endY - startY) * 0.5 + (Math.random() - 0.5) * 100;

        const numSteps = 48;
        const points = [];
        for (let i = 0; i <= numSteps; i++) {
            const t = i / numSteps;
            const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * ctrlX + t * t * endX;
            const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * ctrlY + t * t * endY;
            points.push({ x, y });
        }

        // Draw Myelin Sheath capsules (the rectangular segments)
        ctx.lineWidth = 11;
        ctx.strokeStyle = 'rgba(120, 135, 150, 0.06)';
        ctx.lineCap = 'round';

        for (let i = 0; i < points.length - 4; i += 4) {
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[i + 3].x, points[i + 3].y);
            ctx.stroke();
        }

        // Draw the thin inner axon fiber running through the center of the sheaths
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        for (let i = 0; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.stroke();
    }

    // Recursive Bushy Dendrites with fine wavy segments and synaptic bulbs
    function drawDendrites(x, y, angle, length, depth, width) {
        if (depth <= 0) {
            // Synaptic terminal knobs (bulbous endpoints from my diagram)
            ctx.beginPath();
            ctx.arc(x, y, 2.5 + Math.random() * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(160, 180, 200, ${0.07 + Math.random() * 0.07})`;
            ctx.fill();
            return;
        }

        let cx = x;
        let cy = y;
        const steps = 4;
        const stepLength = length / steps;
        let currentAngle = angle;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        for (let i = 0; i < steps; i++) {
            currentAngle += (Math.random() - 0.5) * 0.22; // Organic waviness
            cx += Math.cos(currentAngle) * stepLength;
            cy += Math.sin(currentAngle) * stepLength;
            ctx.lineTo(cx, cy);
        }
        ctx.strokeStyle = `rgba(140, 155, 170, ${0.01 + (depth * 0.007)})`;
        ctx.lineWidth = width;
        ctx.stroke();

        const numBranches = Math.random() < 0.3 ? 3 : 2;
        const angleSpread = 0.55;

        for (let b = 0; b < numBranches; b++) {
            const branchAngle = currentAngle + (b - (numBranches - 1) / 2) * angleSpread + (Math.random() - 0.5) * 0.2;
            const nextLength = length * (0.64 + Math.random() * 0.14);
            const nextWidth = width * 0.65;
            drawDendrites(cx, cy, branchAngle, nextLength, depth - 1, nextWidth);
        }
    }

    // Generate diagram anatomy (centered, emanating outward from behind the 3D model)
    function generateAnatomicalNetwork() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Position cell bodies horizontally symmetric to the center 3D brain
        const leftSomaX = centerX - Math.max(180, canvas.width * 0.16);
        const leftSomaY = centerY + 80;
        const rightSomaX = centerX + Math.max(180, canvas.width * 0.16);
        const rightSomaY = centerY - 50;

        // --- DRAW LEFT NEURON ---
        drawSoma(leftSomaX, leftSomaY, 18);
        // Axon going to bottom-left corner
        drawMyelinatedAxon(leftSomaX, leftSomaY, 0, canvas.height);
        // Bushy dendrites spreading up, left, and meeting in the center gap
        const leftAngles = [-0.2, -0.9, -1.8, -2.4, 0.5];
        leftAngles.forEach(angle => {
            drawDendrites(leftSomaX, leftSomaY, angle, 65 + Math.random() * 30, 5, 3.2);
        });

        // --- DRAW RIGHT NEURON ---
        drawSoma(rightSomaX, rightSomaY, 18);
        // Axon going to bottom-right corner
        drawMyelinatedAxon(rightSomaX, rightSomaY, canvas.width, canvas.height);
        // Bushy dendrites spreading up, right, and meeting in the center gap
        const rightAngles = [-1.0, -1.8, -2.5, -2.9, 2.5, 0.8];
        rightAngles.forEach(angle => {
            drawDendrites(rightSomaX, rightSomaY, angle, 65 + Math.random() * 30, 5, 3.2);
        });

        // --- DRAW DESCENDING PATHWAY (Top Center) ---
        // Mimics the synaptic terminal pathways descending from the top of my diagram
        const topX = centerX + 80;
        const topY = 0;
        ctx.beginPath();
        ctx.moveTo(topX, topY);
        const termY = centerY - 140;
        const termX = centerX - 40;

        ctx.bezierCurveTo(topX - 30, topY + 100, termX + 80, termY - 100, termX, termY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Branch terminal buttons in the space between the somas
        drawDendrites(termX, termY, 1.2, 55, 4, 1.8);
        drawDendrites(termX, termY, 2.1, 45, 4, 1.8);
    }

    window.addEventListener('resize', resizeCanvas);

    if (document.readyState === 'complete') {
        setTimeout(resizeCanvas, 80);
    } else {
        window.addEventListener('load', () => setTimeout(resizeCanvas, 80));
    }
})();


const backToTopButton = document.getElementById("backToTop");

window.onscroll = function() {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        backToTopButton.style.display = "block";
    } else {
        backToTopButton.style.display = "none";
    }
};

backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});