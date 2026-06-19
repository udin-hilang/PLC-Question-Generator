# Project Summary

## Overall Goal
Develop a professional AI-powered PLC Question Generator application with a modern glassmorphism UI to create high-quality technical examination questions for PLC students.

## Key Knowledge
- **Technology Stack**: React, Vite, and CSS. Integration with **Google Gemini 1.5 Flash API** for AI content generation.
- **Theme & Aesthetics**: 
    - **Glassmorphism**: Heavy use of `backdrop-filter: blur`, semi-transparent backgrounds, and thin borders.
    - **Color Palettes**: 
        - Base Theme: Deep blue/black gradients (`#000033` to `#000000`).
        - Generator Theme: Deep green/black gradients (`#003300` to `#000000`).
    - **Visual Effects**: Linear gradient text, glowing shadows (drop-shadow), and smooth cross-fade background transitions using pseudo-elements (`::before`/`::after`).
- **UI Conventions**: 
    - Fixed navbar that shrinks on scroll.
    - Dynamic theme switching based on the current route (`/generator` triggers the green theme).
    - Consistent focus states and active states using `#00ff88` (green) or `#00d2ff` (blue).
- **Domain Focus**: Primary focus on Omron PLC instructions (TIM, CNT, KEEP, SET, RSET, etc.), while maintaining compatibility with other brands like Siemens and Mitsubishi.
- **API Configuration**: Uses `VITE_GEMINI_API_KEY` from a `.env` file.

## Recent Actions
- **Generator UI**: Implemented a comprehensive configuration form including scenario descriptions, I/O counts, operation modes, branching flows, and hardware selection.
- **Custom Instruction Selector**: Created a checkbox-based dropdown for Omron PLC instructions with stabilized layout and text ellipsis.
- **Theming Overhaul**: 
    - Implemented a full "Green Theme" that applies to the background, navbar (including scrolled state), brand logo, buttons, and form focus states.
    - Replaced abrupt background changes with a smooth cross-fade animation.
- **AI Integration**: 
    - Integrated the Gemini API with a specialized "PLC Expert Instructor" system prompt to ensure pedagogical quality and technical accuracy.
    - Implemented an output section at the bottom of the Generator page with a loading state, error handling, and a "Copy Text" feature.
- **UX Fixes**: Resolved header scroll jitters and logo rendering issues.

## Current Plan
1. [DONE] Design and implement the Question Generator UI with glassmorphism and dynamic Green theme.
2. [DONE] Resolve UI/UX glitches (jitters, layout shifts) and implement smooth cross-fade transitions.
3. [DONE] Integrate Gemini AI API for professional PLC question generation.
4. [TODO] Create and implement the History page for storing and viewing previously generated questions.
5. [TODO] Create and implement the Settings page for user preferences.

---

## Summary Metadata
**Update time**: 2026-06-18T02:29:21.381Z 
