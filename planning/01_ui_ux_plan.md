# AI Intelligence Dashboard - UI/UX & Design Plan

## 1. Design Philosophy & Principles
Based on the Information Architecture (IA) and your specific requirement for top-tier mobile responsiveness, the UI/UX will be governed by the following principles:

*   **Mobile-First & Fully Responsive:** Since many users will access this via phone, the layout must seamlessly transition from a data-dense Desktop view to a thumb-friendly Mobile view (e.g., Sidebars become bottom navigation, tables become stacked cards).
*   **Signal Over Volume:** The UI must prioritize the *Intelligence Score* and *Business Relevance*. Feeds default to scored/ranked views, not chronological firehoses.
*   **Consistent Anatomy (Flat Before Deep):** Every module (News, Funding, Research) follows the exact same visual pattern: `Feed (Summary)` -> `Filters/Sort` -> `Detail Page` -> `Related Objects`. 
*   **Context Follows the User:** If a user scrolls down a feed, applies filters, clicks an item, and goes back, their exact scroll position and filters must persist.
*   **Progressive Disclosure:** Feed cards show only the AI summary and score. Detail pages reveal the full depth.

## 2. Global Layout & Navigation
The platform uses a unified navigation structure that adapts to the device.

### Desktop Layout
*   **Left Persistent Sidebar:** Contains the 5 Navigation Zones (Overview, Intelligence Modules, Personal, System, Future).
*   **Top Bar:** Global Search bar (always accessible), user profile, and notification bell.
*   **Main Content Area:** The active module (Dashboard, News, etc.).
*   **Right Panel (Optional):** Contextual filters or quick-access Saved Intelligence.

### Mobile Layout
*   **Bottom Navigation Bar:** Quick access to the most used modules: Dashboard, Search, Saved, Notifications.
*   **Hamburger Menu (Drawer):** Opens the full 5-zone navigation sidebar.
*   **Sticky Top Header:** Contains the page title, filter toggle, and profile.

## 3. Core Page Templates
To keep development modular, we only need a few core templates that get reused across all 16 modules.

### A. The Dashboard (Home)
*   **Widgets:** "Today's AI Brief" (top, largest), "Trending AI News", "Startup Funding Updates", "Research Highlights".
*   **Layout:** Masonry or grid layout on desktop; single-column stacked on mobile.

### B. The Module Feed (e.g., AI News, Funding)
*   **Header:** Title and dynamic metric (e.g., "34 items today").
*   **Filter Bar:** Horizontal scrolling chips on mobile, dropdowns on desktop.
*   **The Feed:** A vertical list of "Intelligence Object Cards".

### C. The Intelligence Detail Page (The "Deep Dive")
*   **Header:** Title, status badges (Critical, High), and Bookmark/Save actions.
*   **AI Summary Panel:** The Gemini-generated summary taking center stage.
*   **Business Relevance Panel:** Why it matters to Viorant/Miraya.
*   **Related Objects Rail:** Horizontal scrolling list of linked entities (e.g., Authors, Investors, Competitors) at the bottom.

## 4. Universal Component Library
These components will be built once and used everywhere:
1.  **Intelligence Object Card:** The standard card showing a headline, 3-bullet AI summary, score badge, and source tag. Adapts its specific metadata (like $ raised vs. citations) based on the object type.
2.  **Filter & Sort Controls:** Standardized pills/chips for Date, Company, Priority, Category.
3.  **Status Badges:** Color-coded priority indicators (Critical=Red, High=Orange, Medium=Blue, Low=Gray).
4.  **AI Insight Panel:** A visually distinct container (perhaps with a subtle gradient or spark icon) indicating Gemini-generated text.

## 5. Theme & Aesthetics
*   **Color Palette:** A premium, data-focused dark mode (e.g., deep slate/navy backgrounds, high-contrast white text, vibrant accent colors for scores and AI features) to reduce eye strain during long reading sessions. Light mode supported but dark mode optimized.
*   **Typography:** A modern, highly legible sans-serif (e.g., Inter or Roboto) with tight tracking for data density, but comfortable line height for reading AI summaries.
*   **Micro-interactions:** Smooth transitions when opening detail pages, subtle hover states on cards, and satisfying bookmark animations.
