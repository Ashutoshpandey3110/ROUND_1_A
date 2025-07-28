📘 Adobe Hackathon Round 1A – Document Outline Extractor
🚀 Overview
This project is built for Adobe Hackathon 2025 – Round 1A and automates the extraction of a structured outline from PDF documents. The tool identifies:

🏷️ The actual document title (not filename)

📚 Headings and their hierarchy (levels: H1, H2, H3)

📄 Page numbers for each heading

The extracted data is returned in a clean JSON format, as required by the problem statement.

🧠 Problem Statement Solved
Extract PDF structure (Title + Headings)

Distinguish heading levels using font size

Output should match:

{
  "title": "Understanding AI",
  "outline": [
    { "level": "H1", "text": "Introduction", "page": 1 },
    { "level": "H2", "text": "What is AI?", "page": 2 },
    { "level": "H3", "text": "History of AI", "page": 3 }
  ]
}

📁 Project Structure
project-root/
│
├── 📂 input/              → Put your PDF files here
├── 📂 output/             → Processed JSON output is saved here
├── 📝 processAll.js      → Main Node.js PDF processor
├── 🐳 Dockerfile          → Docker build setup
├── 📦 package.json        → Node dependencies
├── 📄 .gitignore         → Specifies files for Git to ignore
└── 📄 README.md          → This file

‼️ Important: Local Setup
Before building the Docker image, you need to install the Node.js dependencies locally. This is only required once.

Run the following command in your project's root directory:

npm install

🐳 How to Run with Docker
✅ Step 1: Build the Docker Image

Run this in PowerShell or terminal from your /server folder:

docker build --platform linux/amd64 -t pdf-extractor .

✅ Step 2: Place PDFs

Drop any PDF(s) inside the input/ folder.

✅ Step 3: Run the Container

docker run --rm -v "${pwd}/input:/app/input" -v "${pwd}/output:/app/output" --network none pdf-extractor

🔁 This will process all .pdf files in input/ and output .json files in output/.

🛠 Tech Stack
Node.js

pdfjs-dist

Docker (Linux/amd64 compatible)

✅ Output Example
Example of what you'll get in output/sample.json:

{
  "title": "Connecting the Dots Challenge",
  "outline": [
    { "level": "H1", "text": "Welcome to the Challenge", "page": 1 },
    { "level": "H1", "text": "Round 1A: Understand Your Document", "page": 2 },
    { "level": "H2", "text": "Your Mission", "page": 2 },
    { "level": "H3", "text": "What You Need to Build", "page": 3 }
  ]
}