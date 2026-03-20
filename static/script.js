// 1. CONTACT FORM LOGIC
function sendMessage() {
    const nameInput = document.getElementById('name');
    const messageInput = document.getElementById('message');

    // Check if inputs are empty
    if (!nameInput.value || !messageInput.value) {
        alert("Please fill in both your name and message.");
        return;
    }

    const userData = {
        name: nameInput.value,
        message: messageInput.value
    };

    fetch('/submit_contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    })
    .then(res => {
        if (!res.ok) throw new Error("Server error - could not save message");
        return res.json();
    })
    .then(data => {
        // Show success message from Flask
        alert(data.msg);
        
        // CLEAR the input fields after successful send
        nameInput.value = "";
        messageInput.value = "";
    })
    .catch(err => {
        console.error("Error connecting to Flask:", err);
        alert("Failed to send message. Is your Flask server running?");
    });
}

// 2. SCROLL ANIMATION LOGIC (existing logic)
document.addEventListener('DOMContentLoaded', () => {
    // Select all elements you want to animate
    const cards = document.querySelectorAll('.card');

    const observerOptions = {
        root: null, // observe from the viewport
        rootMargin: '0px',
        threshold: 0.1 // trigger when 10% of the item is visible
    };

    // Function to add a fade-in class
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, observerOptions);

    // Apply initial hidden style and observe each card
    cards.forEach(card => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)'; // Start slightly below its final position
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });

    // --- 3. TYPING ANIMATION LOGIC (NEW) ---

    // Function to start a repeating typing/deleting animation cycle
    function startTypingAnimation(elementId, cursorId, fullText) {
        const textElement = document.getElementById(elementId);
        const cursorElement = document.getElementById(cursorId);
        let isDeleting = false;
        let textIndex = 0;
        const typingSpeed = 150; // milliseconds
        const deletingSpeed = 100;
        const delayBetweenCycles = 2000; // milliseconds

        function type() {
            const currentText = fullText.substring(0, textIndex);
            textElement.textContent = currentText;

            if (isDeleting) {
                // Deleting phase
                textIndex--;
            } else {
                // Typing phase
                textIndex++;
            }

            if (!isDeleting && textIndex === fullText.length + 1) {
                // Done typing, start deleting after a delay
                isDeleting = true;
                cursorElement.style.animation = 'blink .75s step-end infinite'; // Start blinking cursor while waiting
                setTimeout(type, delayBetweenCycles);
            } else if (isDeleting && textIndex === -1) {
                // Done deleting, start typing again after a delay
                isDeleting = false;
                cursorElement.style.animation = 'none'; // Stop blinking during typing
                setTimeout(type, delayBetweenCycles / 2);
            } else {
                // Continue typing or deleting
                const speed = isDeleting ? deletingSpeed : typingSpeed;
                setTimeout(type, speed);
            }
        }
        
        // Start the animation when the DOM is loaded
        type();
    }

    // Start animations for both names
    startTypingAnimation('main-name', 'main-cursor', 'Abhishek rautaray');

});
