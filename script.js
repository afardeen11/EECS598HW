import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {

    apiKey: "AIzaSyB26oHzRvNNdKqAQ8z8RJ73HUlH2bmpsjs",
  
    authDomain: "hw-ba8d2.firebaseapp.com",
  
    databaseURL: "https://hw-ba8d2-default-rtdb.firebaseio.com",
  
    projectId: "hw-ba8d2",
  
    storageBucket: "hw-ba8d2.firebasestorage.app",
  
    messagingSenderId: "653958479385",
  
    appId: "1:653958479385:web:b28ad15803f5843260f488"
  
  };

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", async () => {
    const BASE_URL = "images_with_prompt/";
    let surveyCode = localStorage.getItem("surveyCode"); 

    try {
        const response = await fetch("data.json");
        let dataset = await response.json();

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]]; 
            }
        }

        shuffleArray(dataset);
        dataset = dataset.slice(0, 50); 

        let currentIndex = 0;
        let selectedImage = null;
        const totalPrompts = dataset.length; 

        if (!surveyCode) {
            surveyCode = Math.random().toString(36).substr(2, 6).toUpperCase();
            localStorage.setItem("surveyCode", surveyCode); 
        }

        function updateProgress() {
            document.getElementById("progress").innerText = `Completed: ${currentIndex} / ${totalPrompts}`;
        }

        function loadPrompt(index) {
            if (index >= totalPrompts) {
                displaySurveyCode();
                return;
            }

            const data = dataset[index];
            document.getElementById("prompt-text").innerText = data.prompt;
            const container = document.getElementById("image-container");
            container.innerHTML = ""; 

            data.images.forEach(imgName => {
                const img = document.createElement("img");
                img.src = `${BASE_URL}${data.prompt}/${imgName}`;
                img.dataset.filename = imgName;
                img.addEventListener("click", () => selectImage(img));
                container.appendChild(img);
            });

            selectedImage = null;
            document.getElementById("submit-btn").disabled = true;
            updateProgress();
        }

        function selectImage(img) {
            document.querySelectorAll(".image-container img").forEach(image => {
                image.classList.remove("selected");
            });
            img.classList.add("selected");
            selectedImage = img.dataset.filename;
            document.getElementById("submit-btn").disabled = false;
        }

        document.getElementById("submit-btn").addEventListener("click", async () => {
            if (!selectedImage) return;

            console.log(`Selected Image: ${selectedImage} for Prompt: "${dataset[currentIndex].prompt}"`);

            const surveyRef = ref(db, `mturk-results/${surveyCode}/responses`);
            push(surveyRef, {
                prompt: dataset[currentIndex].prompt,
                selectedImage: selectedImage,
                timestamp: new Date().toISOString()
            }).then(() => {
                console.log("✅ Selection stored in Firebase.");
            }).catch(error => {
                console.error("❌ Error saving selection:", error);
            });

            currentIndex++;  
            loadPrompt(currentIndex);
        });

        function displaySurveyCode() {
            const surveyCodeElement = document.createElement("p");
            surveyCodeElement.innerHTML = `Your Survey Code: <strong>${surveyCode}</strong>`;
            surveyCodeElement.style.fontSize = "20px";
            surveyCodeElement.style.color = "green";
            document.body.appendChild(surveyCodeElement);

            document.getElementById("submit-btn").style.display = "none";
        }

        loadPrompt(currentIndex);
    } catch (error) {
        console.error("Error loading data.json:", error);
    }
});
