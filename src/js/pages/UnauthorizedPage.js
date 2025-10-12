import { auth } from "../firebase.js";
import { signOut } from "firebase/auth";

import toastManager from "../components/ToastManager.js";

export default function UnauthorizedPage() {
  const wrapper = document.createElement("main");
  wrapper.className =
    "d-flex flex-column justify-content-center align-items-center flex-grow-1 position-relative overflow-hidden";

  wrapper.innerHTML = `
    <!-- Background decoration -->
    <div class="position-absolute w-100 h-100">
      <div class="position-absolute opacity-25 rounded-circle" 
          style="top: 10%; right: 10%; width: 200px; height: 200px; 
                  background: linear-gradient(45deg, var(--bs-primary), var(--bs-info)); 
                  filter: blur(40px);"></div>
      <div class="position-absolute opacity-25 rounded-circle" 
          style="bottom: 10%; left: 10%; width: 150px; height: 150px; 
                  background: linear-gradient(45deg, var(--bs-success), var(--bs-warning)); 
                  filter: blur(40px);"></div>
    </div>
    
    <div class="container position-relative">
      <div class="row justify-content-center">
        <div class="d-flex justify-content-center px-3">
          <div class="card shadow-lg border-0 bg-body" style="width: 100%; max-width: 450px;">
            <div class="card-body p-5">
              <!-- Icon -->
              <div class="text-center mb-4">
                <div class="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                    style="width: 64px; height: 64px;">
                  <i class="bi bi-shield-lock text-warning fs-1"></i>
                </div>
                <h1 class="h4 fw-bold mb-2">Unauthorized</h1>
                <p class="text-start text-body-secondary mb-0 fs-6">You don't have permission to access this system. Please contact your system administrator to request access.</p>
              </div>

              <!-- User Info -->
              <div class="bg-body-secondary rounded p-3 mb-4">
                <p class="text-body-secondary small mb-1">Signed in as:</p>
                <p class="mb-0 fw-semibold" id="userEmail">Loading...</p>
              </div>

              <!-- Actions -->
              <div class="d-grid mb-2">
                <button id="signOutBtn" class="btn btn-primary btn-lg">
                  <i class="bi bi-box-arrow-right me-2"></i>
                  <span class="fs-6 fw-bold">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Display user email
  const userEmailElement = wrapper.querySelector("#userEmail");
  if (auth.currentUser && userEmailElement) {
    userEmailElement.textContent = auth.currentUser.email || "Unknown";
  }

  // Sign out handler
  const signOutBtn = wrapper.querySelector("#signOutBtn");
  if (signOutBtn) {
    signOutBtn.addEventListener("click", async () => {
      const originalContent = signOutBtn.innerHTML;

      signOutBtn.innerHTML = `
        <div class="spinner-border spinner-border-sm me-2"></div>
        <span class="fw-bold">Signing out...</span>
      `;
      signOutBtn.disabled = true;

      try {
        await signOut(auth);
      } catch (error) {
        toastManager.showError("Sign out failed. Please try again.");
        signOutBtn.innerHTML = originalContent;
        signOutBtn.disabled = false;
      }
    });
  }

  return wrapper;
}
