import * as Carousel from "./Carousel.js";
import axios from "axios";
// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");

// Step 0: Store your API key here for reference and easy access.
const API_KEY =
  "live_0h5T1ejjlZ7LZRZe1yqjyZQMlNIq6SmOasK4zBGsYWyX99kRvCz1b0LwW4m95DaQ";

/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using fetch().
 * - Create new <options> for each of these breeds, and append them to breedSelect.
 *  - Each option should have a value attribute equal to the id of the breed.
 *  - Each option should display text equal to the name of the breed.
 * This function should execute immediately.
 */
async function initialLoad() {
  try {
    const response = await fetch("https://api.thecatapi.com/v1/breeds", {
      headers: { "x-api-key": API_KEY },
    });
    const breeds = await response.json();
    console.log(breeds);
    breeds.forEach((element) => {
      const options = document.createElement("option");
      options.value = element.id;
      options.textContent = element.name;
      breedSelect.appendChild(options);
    });

    // Set up event handler after initial load
    breedSelect.addEventListener("change", breedSelectHandler);
  } catch (error) {
    console.error("Error fetching breeds:", error);
    infoDump.innerHTML =
      "<p>Failed to load breeds. Please try again later.</p>";
  }
}

initialLoad();

/**
 * 2. Event handler for breed selection:
 * - Fetch breed details and create carousel items.
 */
async function breedSelectHandler(event) {
  const breedId = event.target.value;

  if (!breedId) return; // If no breed is selected, do nothing

  // Clear previous carousel items
  Carousel.clear();

  // Show progress bar while fetching
  progressBar.style.width = "0%";
  progressBar.style.display = "block";

  try {
    const response = await fetch(
      `https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}&limit=10`,
      {
        headers: { "x-api-key": API_KEY },
      }
    );
    const images = await response.json();
    console.log(images);

    // Hide progress bar after fetching images
    progressBar.style.width = "100%";
    setTimeout(() => {
      progressBar.style.display = "none";
    }, 500);

    // Create carousel items from the images
    images.forEach((imageData) => {
      const { url, id } = imageData;
      const imgSrc = url;
      const imgAlt = `Image of a ${breedId}`;
      const imgId = id;

      const carouselItem = Carousel.createCarouselItem(imgSrc, imgAlt, imgId);
      Carousel.appendCarousel(carouselItem);
    });

    // Display additional breed information
    const breedDetails = await fetch(
      `https://api.thecatapi.com/v1/breeds/${breedId}`,
      {
        headers: { "x-api-key": API_KEY },
      }
    );
    const breedInfo = await breedDetails.json();
    infoDump.innerHTML = `
      <h3>${breedInfo.name}</h3>
      <p><strong>Temperament:</strong> ${breedInfo.temperament}</p>
      <p><strong>Description:</strong> ${breedInfo.description}</p>
      <p><strong>Life Span:</strong> ${breedInfo.life_span} years</p>
      <p><strong>Origin:</strong> ${breedInfo.origin}</p>
    `;

    // Start the carousel
    Carousel.start();
  } catch (error) {
    console.error("Error fetching breed images or details:", error);
    infoDump.innerHTML =
      "<p>Failed to load breed images. Please try again later.</p>";
  }
}
