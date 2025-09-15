export default function DashboardPage() {
  const div = document.createElement("div");

  // fills remaining space inside #app
  div.className =
    "d-flex flex-column justify-content-center align-items-center flex-grow-1";

  div.innerHTML = `
    <div class="text-center">
      <p class="lead">🚧 This page is under construction. Please check back soon! 🚧</p>
    </div>
  `;

  return div;
}
