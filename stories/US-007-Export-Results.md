# US-007: Export Results as Image

## Description
As a user, I want to export the decision results (question, pros, cons, net score) as an image so that I can easily share it on social media or messaging apps.

## Acceptance Criteria
1.  **Export Button**: A button labeled "Export as Image" (or similar icon) is available on the Decision page.
2.  **Image Content**: The generated image must include:
    *   The decision question/title.
    *   The net score.
    *   A summary of top pros and cons (or all if feasible).
    *   The Decide-O-Mat branding/URL.
3.  **Download**: Clicking the button triggers a download of the generated image (e.g., PNG or JPEG).
4.  **Performance**: The generation should happen client-side to avoid server costs and latency.

## Technical Notes
-   Use a library like `html2canvas` or `dom-to-image` to render the DOM to an image.
-   Ensure the layout looks good in the exported image (might need a specific hidden container for rendering).
