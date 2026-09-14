import os
from pptx import Presentation
from pptx.util import Inches, Pt

# Define slide titles (25 slides)
titles = [
    "Cover Page",
    "Certificate",
    "Student Declaration",
    "Acknowledgement",
    "Abstract",
    "Table of Contents",
    "Introduction",
    "Project Overview",
    "Problem Statement",
    "Objectives",
    "Existing System / Motivation",
    "Proposed System – Nexus Platform",
    "System Requirements & Technology Stack",
    "System Architecture",
    "Project Workflow / Flow Pattern",
    "Module Description",
    "UI / Screenshots",
    "Implementation Overview",
    "Database / API / AI Architecture",
    "Testing",
    "Results / Output",
    "Challenges & Solutions",
    "Skills Developed & Learning Outcomes",
    "Limitations & Future Scope",
    "Conclusion & References",
    "Appendix"
]

# Create a presentation
prs = Presentation()

# Define a simple slide layout (Title and Content)
title_slide_layout = prs.slide_layouts[0]  # Title Slide
content_slide_layout = prs.slide_layouts[1]  # Title and Content

# Helper to add a slide with title only or with placeholder content
def add_slide(layout, title, content=None):
    slide = prs.slides.add_slide(layout)
    slide.shapes.title.text = title
    if content and layout == content_slide_layout:
        tf = slide.placeholders[1].text_frame
        tf.text = content
    return slide

# Add Cover Page (use title layout)
add_slide(title_slide_layout, "Nexus Platform – Project Presentation")

# The rest use content layout with placeholder text
placeholder = "[Insert relevant content, graphics, or screenshots here]"
for t in titles[1:]:
    add_slide(content_slide_layout, t, placeholder)

# Save the presentation
output_path = os.path.join(os.getcwd(), "Nexus_Project_Presentation.pptx")
prs.save(output_path)
print(f"Presentation saved to {output_path}")
