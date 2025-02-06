import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", async () => {
    const BASE_URL = "images_with_prompt/";
    
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

        const urlParams = new URLSearchParams(window.location.search);
        const assignmentId = urlParams.get("assignmentId") || "Unknown";
        const workerId = urlParams.get("workerId") || "Unknown";

        function updateProgress() {
            document.getElementById("progress").innerText = `Completed: ${currentIndex} / ${totalPrompts}`;
        }

        function loadPrompt(index) {
            if (index >= totalPrompts) {
                generateSurveyCode();  
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

            push(ref(db, "mturk-results"), {
                assignmentId: assignmentId,
                workerId: workerId,
                prompt: dataset[currentIndex].prompt,
                selectedImage: selectedImage,
                timestamp: new Date().toISOString()
            });

            currentIndex++;  
            loadPrompt(currentIndex);
        });

        function generateSurveyCode() {
            const surveyCode = Math.random().toString(36).substr(2, 6).toUpperCase();

            push(ref(db, "mturk-results"), {
                assignmentId: assignmentId,
                workerId: workerId,
                surveyCode: surveyCode,
                completedAt: new Date().toISOString()
            });

            const surveyCodeElement = document.createElement("p");
            surveyCodeElement.innerHTML = `Your Survey Code: <strong>${surveyCode}</strong>`;
            surveyCodeElement.style.fontSize = "20px";
            surveyCodeElement.style.color = "green";
            document.body.appendChild(surveyCodeElement);

            document.getElementById("submit-btn").style.display = "none";
            localStorage.setItem("surveyCode", surveyCode);
        }

        loadPrompt(currentIndex);
    } catch (error) {
        console.error("Error loading data.json:", error);
    }
});
