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
const API_URL = "https://api.thecatapi.com/v1"; // ✅ Added API_URL definition

// Configure Axios globally
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common["x-api-key"] = API_KEY;

// Axios Interceptors
axios.interceptors.request.use((config) => {
  console.log("Request started at:", new Date().toISOString());
  progressBar.style.width = "0%";
  progressBar.style.display = "block";
  document.body.style.cursor = "progress";
  config.metadata = { startTime: new Date().getTime() };
  return config;
});

axios.interceptors.response.use(
  (response) => {
    document.body.style.cursor = "default";
    const duration = new Date().getTime() - response.config.metadata.startTime;
    console.log(`Request completed in ${duration} ms`);
    return response;
  },
  (error) => {
    document.body.style.cursor = "default";
    console.error("Error in Axios Request:", error);
    return Promise.reject(error);
  }
);

// Progress Update Function
function updateProgress(event) {
  if (event.lengthComputable) {
    const percentComplete = (event.loaded / event.total) * 100;
    progressBar.style.width = `${percentComplete}%`;
    console.log(`Progress: ${percentComplete}%`);
  }
}

// Fetch Breeds
export async function fetchBreeds() {
  try {
    const response = await axios.get("/breeds", {
      onDownloadProgress: updateProgress,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching breeds:", error);
    throw error;
  }
}

// Fetch Images by Breed
export async function fetchImagesByBreed(breedId) {
  try {
    const response = await axios.get(
      `/images/search?breed_ids=${breedId}&limit=10`,
      { onDownloadProgress: updateProgress }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching images:", error);
    throw error;
  }
}

// Fetch Breed Details
export async function fetchBreedDetails(breedId) {
  try {
    const response = await axios.get(`/breeds/${breedId}`, {
      onDownloadProgress: updateProgress,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching breed details:", error);
    throw error;
  }
}

// Favourite or Unfavourite Image
export async function favourite(imageId, isFavourited) {
  try {
    if (isFavourited) {
      const response = await axios.get("/favourites");

      const favData = response.data.find((fav) => fav.image_id === imageId);

      if (favData) {
        await axios.delete(`/favourites/${favData.id}`);
        console.log(`Removed from favourites: ${imageId}`);
        return false;
      }
    } else {
      const response = await axios.post("/favourites", { image_id: imageId });
      console.log(`Added to favourites: ${imageId}`, response.data);
      return true;
    }
  } catch (error) {
    console.error("Error in favourite toggle operation:", error);
    throw error;
  }
}

// Fetch All Favourites
export async function fetchFavourites() {
  try {
    const response = await axios.get("/favourites");
    return response.data;
  } catch (error) {
    console.error("Error fetching favourites:", error);
    throw error;
  }
}
