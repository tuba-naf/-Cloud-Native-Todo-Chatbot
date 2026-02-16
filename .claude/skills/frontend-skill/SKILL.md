---
name: frontend-skill
description: Build pages, components, layouts, and styling for modern web applications. Use for Next.js, React, or static site tasks.
---

# Frontend Skill

## Instructions

1. **Page & Layout Structure**
   - Use responsive design with mobile-first approach
   - Implement full-page sections, headers, footers, and navigation
   - Use CSS grid or flexbox for flexible layouts
   - Organize content for clarity and visual hierarchy

2. **Components**
   - Build reusable UI components (buttons, cards, forms, modals)
   - Follow atomic design principles
   - Accept props and state to render dynamic content
   - Apply component-level styling with Tailwind, CSS Modules, or styled-components

3. **Styling**
   - Use consistent color palettes and typography
   - Apply spacing, padding, and margins systematically
   - Ensure high contrast for readability
   - Implement hover, focus, and active states for interactive elements

4. **Animations & Interactions**
   - Apply smooth transitions for hover and focus states
   - Use motion libraries (Framer Motion, React Spring) for animations
   - Ensure animations are subtle and enhance UX, not distract
   - Avoid performance-heavy effects on mobile devices

---

## Best Practices

- Keep components small and focused  
- Write semantic HTML for accessibility  
- Use consistent naming conventions for classes and components  
- Optimize images and assets for performance  
- Test responsiveness on multiple screen sizes  
- Keep animations smooth and subtle  
- Separate logic from presentation in components  

---

## Example Structure

```jsx
import React from "react";

export default function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
      <h1 className="text-5xl font-bold animate-fade-in">Your Headline</h1>
      <p className="mt-4 text-lg animate-fade-in-delay">Supporting text goes here</p>
      <button className="mt-6 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition">
        Get Started
      </button>
    </section>
  );
}
