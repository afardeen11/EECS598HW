import os
import random
import json
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow frontend requests

# Path to your dataset
DATASET_PATH = "organized_images/"
SUBMISSIONS_FILE = "submissions.json"

# Load dataset directories
def get_dataset():
    prompts = []
    for folder in os.listdir(DATASET_PATH):
        prompt_path = os.path.join(DATASET_PATH, folder, "prompt.txt")
        images = [
            os.path.join(DATASET_PATH, folder, f"image_{i+1}.png")
            for i in range(4)
        ]
        if os.path.exists(prompt_path):
            with open(prompt_path, "r", encoding="utf-8") as f:
                prompt_text = f.read().strip()
                prompts.append({"prompt": prompt_text, "images": images})
    return prompts

# Load all prompts and images
dataset = get_dataset()

@app.route("/get_task", methods=["GET"])
def get_task():
    """Serve a random prompt with 4 images"""
    if not dataset:
        return jsonify({"error": "Dataset not found"}), 500
    task = random.choice(dataset)
    return jsonify(task)

@app.route("/submit", methods=["POST"])
def submit_response():
    """Store user selections"""
    data = request.json
    worker_id = data.get("workerId")
    prompt = data.get("prompt")
    selected_image = data.get("selectedImage")

    if not worker_id or not prompt or not selected_image:
        return jsonify({"error": "Invalid submission"}), 400

    submission = {"worker_id": worker_id, "prompt": prompt, "selected_image": selected_image}

    # Store submissions in JSON
    if os.path.exists(SUBMISSIONS_FILE):
        with open(SUBMISSIONS_FILE, "r") as f:
            submissions = json.load(f)
    else:
        submissions = []

    submissions.append(submission)
    with open(SUBMISSIONS_FILE, "w") as f:
        json.dump(submissions, f, indent=4)

    return jsonify({"message": "Submission recorded!"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
