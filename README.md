# Bulk Certificate Generator 🎓

A fast, private, and 100% client-side web application designed for graphic design teams, educators, and event organizers to generate 100+ personalized certificates in one click from Canva templates.

## ✨ Features

- **1. Canva & Image Template Import**
  - Drag-and-drop or select any PNG/JPG/WEBP template exported from Canva.
  - Built-in "Open in Canva" helper with instructions.
  - Built-in luxury sample gold-navy certificate template demo for instant testing.
  - Preserves 100% full original resolution (e.g. 4K / 300 DPI Canva exports).

- **2. Flexible Student Name Sources**
  - **Excel / CSV Upload (.xlsx, .xls, .csv)**: Powered by SheetJS. Auto-detects columns named `name`, `student`, `candidate`, `participant`, `recipient`, `attendee`, etc. with header row toggling.
  - **Manual Entry**: Type or paste names directly (one per line).
  - Real-time name counter, blank row filtering, whitespace trimming, and chip previews.

- **3. Interactive Name Styling & Live Preview**
  - **Direct Drag & Click Positioning**: Reposition recipient name by clicking or dragging anywhere on the preview canvas (stored as fractional coordinates to scale accurately to any resolution).
  - **Curated Google Fonts**: Playfair Display, Great Vibes, Pinyon Script, Alex Brush, Dancing Script, Cormorant Garamond, Lora, Montserrat, Poppins, and Figtree.
  - **Typography Controls**: Font weights, font size slider + number input, text color picker + hex input + quick swatches, alignment (Left, Center, Right), letter casing (As Typed, Title Case, UPPERCASE).
  - **Shrink-to-Fit**: Automatically prevents text overflow for long names within a customizable bounding width.
  - **Student Preview Cycler**: Step through student names to verify how short and long names look.

- **4. Batch Export Engine**
  - **Output Formats**: High-Resolution PDF (jsPDF with exact pixel-matching page sizes) or PNG images.
  - **Generate & Download ZIP**: Bundles all certificates in a single compressed ZIP archive using JSZip.
  - **Generate into Folder**: Directly writes individual certificate files into a local folder using the modern File System Access API (`showDirectoryPicker`) with graceful ZIP fallback.
  - **Smart File Naming**: Strips illegal filesystem characters and handles duplicate names automatically (`Name.pdf`, `Name (2).pdf`, `Name (3).pdf`).
  - **Non-blocking Loop**: Smooth real-time progress bar, live file status updates, and cancellation support.

- **5. User Experience & Design**
  - Responsive two-column layout with sticky preview.
  - Light & Dark mode support.
  - Accessible, fully self-contained in a single `index.html` file.
  - 100% client-side: Zero data leaves the browser, zero backend required, and zero `localStorage` tracking.

## 🚀 How to Run

Simply open [index.html](file:///c:/Users/YUVARAJ%20KHOT/my%20files/Desktop/project/Certificate-Maker/index.html) in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari). No installation or server needed!