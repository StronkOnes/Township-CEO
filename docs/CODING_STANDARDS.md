# Coding Standards and Design Principles

Township CEO is built using industry-best clean-code principles.

---

## 📐 Core Engineering Doctrines

### 1. SOLID Design Principles
*   **Single Responsibility (SRP)**: Each file represents a single modular component. Do not combine UI presentation logic and backend model abstractions inside the same file.
*   **Open/Closed (OCP)**: The **Provider Abstraction Layer** allows new AI models to be integrated without rewriting the core business agents.
*   **Dependency Inversion (DIP)**: Core agents rely on standard, abstracted provider interfaces, never direct vendor-specific libraries.

### 2. KISS (Keep It Simple, Stupid)
*   Do not over-complicate states. State structures should map directly to physical user inputs.
*   Avoid adding deep nested visual wrappers in Tailwind. Use clean grid systems and flex containers.

### 3. DRY (Don't Repeat Yourself)
*   Utility functions such as currency formatting (`ZAR / R`) and date conversions must be written once and shared.

### 4. Composition Over Inheritance
*   Utilize modular React functional components wrapped with clean Tailwind CSS utility classes.

---

## 🎨 Typography and Colors (Swiss Minimalist)

*   **Primary Display Font**: **Space Grotesk** for modern display headings.
*   **Body Font**: **Inter** for high-legibility interface controls.
*   **Data Font**: **JetBrains Mono** for financial outputs and code tables.
*   **Palette**: Dark-mode-safe, off-white background paired with elegant dark charcoal gray cards, highlighted by vibrant, accessible accents (e.g., amber, emerald, blue) for distinct status indicators.
