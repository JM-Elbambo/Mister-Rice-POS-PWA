// import Navbar from "../components/Navbar.js";

export default function DashboardPage() {
  const div = document.createElement("div");
  div.innerHTML = `
    <h1>Dashboard</h1>
    <p>Welcome to Mister Rice POS Dashboard</p>
  `;

  //   div.prepend(Navbar()); // add navbar at the top
  return div;
}
