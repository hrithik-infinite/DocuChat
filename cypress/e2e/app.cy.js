/* eslint-disable no-undef */
describe("Navigation", () => {
  it("should navigate to the about page", () => {
    // Start from the index page
    cy.visit("http://localhost:3001/");

    // Find a link with an href attribute containing "about" and click it

    // The new url should include "/about"

    // The new page should contain an h1 with "About"
  });
});
