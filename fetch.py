import os
import json
import requests
import random
from tqdm import tqdm
from datasets import load_dataset

# Define where to save images
SAVE_DIR = "diffusiondb_subset"
os.makedirs(SAVE_DIR, exist_ok=True)

# Load metadata from Hugging Face (without full dataset download)
print("Loading metadata from Hugging Face...")
dataset = load_dataset("poloclub/diffusiondb", split="train", streaming=True)

# Convert the dataset into a fixed list (instead of using tqdm with an iterator)
sampled_data = []
count = 0  # Track the number of processed samples

# Process only a limited number of samples
for sample in dataset:
    if count >= 10000:  # Limit to avoid endless streaming
        break

    prompt = sample['prompt']
    image_url = sample['image']
    
    # Store prompts and their images
    found = False
    for entry in sampled_data:
        if entry["prompt"] == prompt:
            if len(entry["images"]) < 4:
                entry["images"].append(image_url)
                found = True
            break
    
    if not found:
        sampled_data.append({"prompt": prompt, "images": [image_url]})

    # Stop when we have 50 prompts with 4 images each
    if len(sampled_data) >= 50 and all(len(entry["images"]) == 4 for entry in sampled_data):
        break

    count += 1

# Download selected images
print(f"Downloading images for {len(sampled_data)} prompts...")
for i, entry in enumerate(tqdm(sampled_data, desc="Downloading images")):
    prompt_text = entry["prompt"]
    images = entry["images"]

    prompt_dir = os.path.join(SAVE_DIR, f"prompt_{i+1}")
    os.makedirs(prompt_dir, exist_ok=True)

    for j, img_url in enumerate(images):
        img_path = os.path.join(prompt_dir, f"image_{j+1}.png")
        try:
            response = requests.get(img_url, timeout=10)
            response.raise_for_status()
            with open(img_path, "wb") as img_file:
                img_file.write(response.content)
        except requests.RequestException as e:
            print(f"Error downloading {img_url}: {e}")

    # Save prompt as text file
    with open(os.path.join(prompt_dir, "prompt.txt"), "w", encoding="utf-8") as prompt_file:
        prompt_file.write(prompt_text)

print("✅ Done! 50 prompts with 4 images each have been downloaded.")
