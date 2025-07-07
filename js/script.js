// NASA APOD API key
const apiKey = 'yaq6ybUr1vCdflErEbZJAGeMv9msNgaQFcfS5Yyc';

// Find the button and gallery elements
const getImagesBtn = document.querySelector('button');
const gallery = document.getElementById('gallery');

// Function to fetch APOD images from NASA API
async function fetchAPODImages(startDate, endDate) {
  // Build the API URL with the selected dates and API key
  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

  try {
    // Fetch data from NASA's API
    const response = await fetch(url);
    // Convert the response to JSON
    const data = await response.json();
    // Return the data (an array of image objects)
    return data;
  } catch (error) {
    // If there's an error, log it
    console.error('Error fetching APOD images:', error);
    return [];
  }
}

// Create and append a modal to the body (only once)
let modal = document.getElementById('apodModal');
if (!modal) {
  modal = document.createElement('div');
  modal.id = 'apodModal';
  modal.style.display = 'none';
  modal.innerHTML = `
    <div class="modal-backdrop" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);z-index:1000;display:flex;align-items:center;justify-content:center;">
      <div class="modal-content" style="background:#fff;border-radius:10px;max-width:600px;width:90vw;padding:24px;position:relative;font-family:Helvetica,Arial,sans-serif;box-shadow:0 4px 24px rgba(0,0,0,0.2);">
        <button id="closeModalBtn" style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:2rem;color:#061f4a;cursor:pointer;">&times;</button>
        <img id="modalImg" src="" alt="" style="width:100%;max-height:350px;object-fit:contain;border-radius:6px;margin-bottom:16px;" />
        <h2 id="modalTitle" style="color:#061f4a;font-size:1.3rem;font-weight:bold;margin-bottom:8px;"></h2>
        <p id="modalDate" style="font-weight:bold;margin-bottom:12px;"></p>
        <p id="modalExplanation" style="color:#333;font-size:1rem;"></p>
      </div>
    </div>
  `;
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.zIndex = '1000';
  modal.style.background = 'rgba(0,0,0,0.7)';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.transition = 'opacity 0.2s';
  document.body.appendChild(modal);
}

function showModal(image) {
  const dateObj = new Date(image.date);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = dateObj.toLocaleDateString('en-US', options);

  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalDate = document.getElementById('modalDate');
  const modalExplanation = document.getElementById('modalExplanation');

  modalTitle.textContent = image.title;
  modalDate.textContent = formattedDate;
  modalExplanation.textContent = image.explanation;

  // Remove any previously embedded video
  const oldVideo = document.getElementById('modalVideo');
  if (oldVideo) oldVideo.remove();

  if (image.media_type === 'image') {
    modalImg.style.display = '';
    modalImg.src = image.url.replace(/^http:/, 'https:');
    modalImg.alt = image.title;
  } else if (image.media_type === 'video') {
    modalImg.style.display = 'none';

    const url = image.url.replace(/^http:/, 'https:');
    const ytMatch = url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);

    let videoEmbed = '';

    if (ytMatch && ytMatch[1]) {
      const videoId = ytMatch[1];

      videoEmbed = `
        <div id="modalVideo" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:6px;margin-bottom:16px;">
          <iframe
            src="https://www.youtube.com/embed/${videoId}?rel=0"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer"
            style="position:absolute;top:0;left:0;width:100%;height:100%;">
          </iframe>
        </div>
      `;
    } else {
      // Fallback message if not a valid YouTube URL
      videoEmbed = `
        <div id="modalVideo" style="margin-bottom:16px;">
          <p style="color:red;">This video cannot be embedded. <a href="${url}" target="_blank" rel="noopener noreferrer">Watch it here</a>.</p>
        </div>
      `;
    }

    modalTitle.insertAdjacentHTML('beforebegin', videoEmbed);
  }

  modal.style.display = 'flex';
}



// Close modal on button click or backdrop click
modal.addEventListener('click', function(e) {
  if (e.target.id === 'apodModal' || e.target.id === 'closeModalBtn' || e.target.classList.contains('modal-backdrop')) {
    modal.style.display = 'none';
  }
});

// Function to display images in the gallery
function displayGallery(images) {
  // Show loading message while waiting for images
  gallery.innerHTML = '';
  // If no images, show a message
  if (!images || images.length === 0) {
    gallery.innerHTML = '<p>No images found for this date range.</p>';
    return;
  }

  // Create a Bootstrap row to hold the cards
  const row = document.createElement('div');
  row.className = 'row g-3'; // g-3 adds spacing between cards

  images.forEach((image, index) => {
    // Format the date as Month-Day-Year (e.g., July 6, 2025)
    const dateObj = new Date(image.date);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = dateObj.toLocaleDateString('en-US', options);

    // Create a column for each card (col-4 for 3 columns per row)
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4';

    // Create a Bootstrap card
    const card = document.createElement('div');
    card.className = 'card h-100';

    if (image.media_type === 'image') {
      card.innerHTML = `
        <img src="${image.url}" class="card-img-top" alt="${image.title}" style="object-fit:cover; height:180px; font-family:Helvetica, Arial, sans-serif;">
        <div class="card-body" style="font-family:Helvetica, Arial, sans-serif;">
          <h5 class="card-title" style="font-size:1rem; font-weight:bold; color:#061f4a; font-family:Helvetica, Arial, sans-serif;">${image.title}</h5>
          <p class="card-text" style="font-size:0.9rem; font-weight:bold; font-family:Helvetica, Arial, sans-serif;">${formattedDate}</p>
        </div>
      `;
      card.addEventListener('click', () => showModal(image));
    } else if (image.media_type === 'video') {
      // Check if it's a YouTube video
      let videoEmbed = '';
      if (image.url.includes('youtube.com') || image.url.includes('youtu.be')) {
        // Extract YouTube video ID
        let videoId = '';
        // Try to match both youtube.com and youtu.be links
        let ytMatch = image.url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (ytMatch && ytMatch[1]) {
          videoId = ytMatch[1];
        }
        if (videoId) {
          videoEmbed = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:6px;margin-bottom:10px;"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe></div>`;
        }
      }
      // If not YouTube, try to embed as a generic video
      if (!videoEmbed && image.url) {
        videoEmbed = `<video controls style="width:100%;max-height:180px;border-radius:6px;margin-bottom:10px;background:#000;">
          <source src="${image.url}">
          Your browser does not support the video tag.
        </video>`;
      }
      card.innerHTML = `
        ${videoEmbed}
        <div class="card-body" style="font-family:Helvetica, Arial, sans-serif;">
          <h5 class="card-title" style="font-size:1rem; font-weight:bold; color:#061f4a; font-family:Helvetica, Arial, sans-serif;">${image.title}</h5>
          <p class="card-text" style="font-size:0.9rem; font-weight:bold; font-family:Helvetica, Arial, sans-serif;">${formattedDate}</p>
        </div>
      `;
      card.addEventListener('click', () => showModal(image));
    }
    row.appendChild(col);
    col.appendChild(card);
  });

  gallery.appendChild(row);
}

// Helper to show loading message
function showLoadingMessage() {
  gallery.innerHTML = '<div style="text-align:center;font-size:1.2rem;padding:40px 0;">🔄 Loading space photos…</div>';
}

// Fun space facts array
const spaceFacts = [
  "A day on Venus is longer than a year on Venus!",
  "Neutron stars can spin at a rate of 600 rotations per second.",
  "There are more trees on Earth than stars in the Milky Way.",
  "The footprints on the Moon will be there for millions of years.",
  "One million Earths could fit inside the Sun.",
  "A spoonful of a neutron star weighs about a billion tons.",
  "Jupiter has 95 known moons!",
  "Space is completely silent—there's no air for sound to travel.",
  "The hottest planet in our solar system is Venus.",
  "A year on Mercury is just 88 days long."
];

// Function to show a random fact
function showRandomFact() {
  const factSection = document.getElementById('spaceFact');
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  factSection.innerHTML = `<span style="font-size:1.1rem;">🚀 <strong>Did You Know?</strong> ${spaceFacts[randomIndex]}</span>`;
}

// When the button is clicked, fetch and show images
getImagesBtn.addEventListener('click', async () => {
  // Get the selected start and end dates
  const startDate = startInput.value;
  const endDate = endInput.value;
  // Show loading message
  showLoadingMessage();
  // Fetch images from NASA's API
  const images = await fetchAPODImages(startDate, endDate);
  // Display the images in the gallery
  displayGallery(images);
});

// On DOMContentLoaded, show a random fact and then load gallery
window.addEventListener('DOMContentLoaded', async () => {
  showRandomFact();
  showLoadingMessage();
  const images = await fetchAPODImages(startInput.value, endInput.value);
  setTimeout(() => displayGallery(images), 2000);
});

// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);
