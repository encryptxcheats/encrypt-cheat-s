const canvas = document.getElementById('cursorEffectCanvas');
const ctx = canvas.getContext('2d');

let mouse = { x: 0, y: 0 };
let lastMouse = { x: 0, y: 0 };
let particles = [];
let animationFrameId = null;

const MAX_PARTICLES = 300; // Max number of trail segments/points. (Adjust as needed)
const PARTICLE_LIFESPAN = 60; // How many frames a particle exists before fully fading.
                              // INCREASE this for a longer trail (e.g., 80-120).
                              // DECREASE for a shorter, snappier trail (e.g., 30-50).

const PARTICLE_SEGMENT_LENGTH = 2.0; // Controls how close new points are added to the trail. (Higher for sparser)
const LINE_WIDTH = 1.5; // Thickness of the individual trail segments.

// Colors (matching the original effect's purple/violet)
const COLOR_START_RGB = [200, 50, 255]; // Brighter Purple/Violet start color
const COLOR_END_RGB = [100, 0, 150];   // Darker Purple/Violet end color

const SWIRL_INTENSITY = 0.4; // How much the particles "swirl" outwards.
const SWIRL_DAMPING = 0.9; // How quickly the swirl velocity decays.

// --- Particle Class (no changes here) ---
class Particle {
    constructor(x, y, dx, dy, angle) {
        this.x = x;
        this.y = y;
        this.vx = dx * SWIRL_INTENSITY;
        this.vy = dy * SWIRL_INTENSITY;
        this.life = 0;
        this.maxLife = PARTICLE_LIFESPAN + Math.random() * 20; // Slightly varied lifespan

        const perpendicularAngle = angle + Math.PI / 2;
        this.vx += Math.cos(perpendicularAngle) * (Math.random() - 0.5) * 4;
        this.vy += Math.sin(perpendicularAngle) * (Math.random() - 0.5) * 4;
    }

    update() {
        this.vx *= SWIRL_DAMPING;
        this.vy *= SWIRL_DAMPING;
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
    }

    draw(ctx) {
        const opacity = 1 - (this.life / this.maxLife); // Particle's individual fading opacity
        if (opacity <= 0) return;

        const r = COLOR_START_RGB[0] + (COLOR_END_RGB[0] - COLOR_START_RGB[0]) * (this.life / this.maxLife);
        const g = COLOR_START_RGB[1] + (COLOR_END_RGB[1] - COLOR_START_RGB[1]) * (this.life / this.maxLife);
        const b = COLOR_START_RGB[2] + (COLOR_END_RGB[2] - COLOR_START_RGB[2]) * (this.life / this.maxLife);

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.lineWidth = LINE_WIDTH;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.arc(this.x, this.y, LINE_WIDTH / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fill();
    }
}

// --- Canvas Resizing Function (no changes) ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- Mouse Movement Tracking (no changes) ---
document.addEventListener('mousemove', (e) => {
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > PARTICLE_SEGMENT_LENGTH) {
        const angle = Math.atan2(dy, dx);
        const steps = Math.ceil(distance / PARTICLE_SEGMENT_LENGTH);

        for (let i = 0; i < steps; i++) {
            const ratio = i / steps;
            const x = lastMouse.x + dx * ratio;
            const y = lastMouse.y + dy * ratio;
            particles.push(new Particle(x, y, dx, dy, angle));
        }
    }

    mouse.x = e.clientX;
    mouse.y = e.clientY;
    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;
});

// --- Animation Loop ---
function animate() {
    // *** CRITICAL CHANGE HERE ***
    // This line now COMPLETELY CLEARS the canvas in each frame.
    // This ensures your website content is ALWAYS visible underneath.
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    // FADE_OUT_OPACITY is no longer used here.

    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.update();
        p.draw(ctx); // Particles will draw with their own fading opacity

        if (p.life > p.maxLife) {
            particles.splice(i, 1);
            i--;
        }
    }

    while (particles.length > MAX_PARTICLES) {
        particles.shift();
    }

    animationFrameId = requestAnimationFrame(animate);
}

animate();

// Optional: Pause animation when user leaves the tab
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    } else {
        if (!animationFrameId) {
            animate();
        }
    }
});