// WM Attire - Interactive Features
// Smooth animations and user interactions

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
    } else {
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Animate feature cards on scroll
const animateElements = document.querySelectorAll('.feature-card, .pricing-card');
animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Interactive sliders in demo section
const sliders = document.querySelectorAll('.slider');
sliders.forEach(slider => {
    slider.addEventListener('input', function() {
        // Add haptic-like feedback
        this.style.background = `linear-gradient(to right, #8B7AB8 0%, #8B7AB8 ${(this.value - this.min) / (this.max - this.min) * 100}%, #e0e0e0 ${(this.value - this.min) / (this.max - this.min) * 100}%, #e0e0e0 100%)`;
    });
});

// Button hover effects with subtle animation
const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
    
    button.addEventListener('click', function(e) {
        // Ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Preload fonts and smooth page load
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.3s ease';
});

// Add ripple effect styles dynamically
const style = document.createElement('style');
style.innerHTML = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    button {
        position: relative;
        overflow: hidden;
    }
`;
document.head.appendChild(style);

// Console message for developers
console.log('%cWM Attire', 'font-size: 24px; font-weight: bold; color: #8B7AB8;');
console.log('%cSee how it fits before you buy', 'font-size: 14px; color: #6a6a6a;');
console.log('\nBuilt with care for students and fashion enthusiasts.');

// AI Fit Engine & Storage Integration
// Initialize AI and Storage when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing WM Attire AI & Storage...');
    
    const hasProfile = wmStorage.hasProfile();
    if (hasProfile) {
        const profile = wmStorage.getProfile();
        console.log('Welcome back!', profile.firstName);
    }
});

// Demo Avatar Generation
const generateAvatarBtn = document.querySelector('.demo-controls button');
if (generateAvatarBtn) {
    generateAvatarBtn.addEventListener('click', () => {
        const heightSlider = document.querySelector('.demo-controls input[type="range"]');
        const buildSlider = document.querySelectorAll('.demo-controls input[type="range"]')[1];
        
        if (heightSlider && buildSlider) {
            const height = parseInt(heightSlider.value);
            const build = parseInt(buildSlider.value);
            
            const measurements = {
                height: height,
                chest: 85 + (build * 3),
                waist: 70 + (build * 2.5),
                hips: 90 + (build * 2),
                weight: 50 + (build * 7),
                shoulders: 40 + (build * 1.5)
            };
            
            wmStorage.saveMeasurements(measurements);
            const recommendation = aiFitEngine.recommendSize('shirt', measurements, 'Zara');
            
            alert(`Avatar Generated!\n\nMeasurements: ${height}cm height, ${measurements.chest}cm chest\nRecommended Size: ${recommendation.size}\nConfidence: ${recommendation.confidence}%`);
        }
    });
}

window.wmAttire = { storage: wmStorage, ai: aiFitEngine };
console.log('WM Attire AI Ready!');

// Get Started Button - Create Profile
const getStartedBtns = document.querySelectorAll('.btn-primary');
getStartedBtns.forEach(btn => {
    if (btn.textContent.includes('Get Started')) {
        btn.addEventListener('click', () => {
            const firstName = prompt('Enter your first name to get started:');
            if (firstName) {
                wmStorage.createProfile({
                    firstName: firstName,
                    email: `${firstName.toLowerCase()}@example.com`,
                    gender: 'unisex'
                });
                alert(`Welcome to WM Attire, ${firstName}!\n\nYou can now create your 3D avatar and try on clothes virtually.`);
                location.reload();
            }
        });
    }
});
