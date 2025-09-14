export default function SigninPage() {
	const wrapper = document.createElement("div");

	wrapper.innerHTML = `
    <div class="d-flex align-items-center position-relative bg-body-secondary" style="min-height: calc(100vh - 48px);">
      <!-- Background decoration -->
      <div class="position-absolute w-100 h-100 overflow-hidden">
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
  <div class="d-flex justify-content-center px-3">
  <div class="card shadow-lg border-0 bg-body" style="width: 100%; max-width: 400px;">
    <div class="card-body p-5">
      <!-- Brand -->
      <div class="text-center mb-4">
        <div class="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
             style="width: 64px; height: 64px;">
          <i class="bi bi-shop text-primary fs-1"></i>
        </div>
        <h1 class="h4 fw-bold mb-1">Welcome Back</h1>
        <p class="text-body-secondary mb-0 fs-6">Sign in to Rice Store POS</p>
      </div>

      <!-- Google Sign-in -->
      <div class="d-grid mb-4">
        <button id="googleSignIn" class="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span class="fs-6 fw-bold">Continue with Google</span>
        </button>
      </div>
      
      <!-- Footer -->
      <div class="text-center">
        <p class="text-body-secondary mb-0 small">
          <i class="bi bi-shield-check me-1"></i>
          Secure sign-in
        </p>
      </div>
    </div>
  </div>
</div>
      </div>
    </div>
  `;

	// Google sign-in handler
	const googleBtn = wrapper.querySelector("#googleSignIn");
	if (!googleBtn) return wrapper;

	const originalContent = googleBtn.innerHTML;

	googleBtn.addEventListener("click", async () => {
		// Update button state
		googleBtn.innerHTML = `
			<div class="spinner-border spinner-border-sm me-2"></div>
			<span>Signing in...</span>
		`;
		googleBtn.disabled = true;

		try {
			const { auth } = await import("../firebase.js");
			const { GoogleAuthProvider, signInWithPopup } = await import(
				"firebase/auth"
			);
			const provider = new GoogleAuthProvider();
			await signInWithPopup(auth, provider);
		} catch (error) {
			console.error("Sign-in error:", error);

			// Show error message
			const showError = () => {
				if (window.bootstrap && bootstrap.Toast) {
					const errorToast = document.createElement("div");
					errorToast.className =
						"toast align-items-center text-bg-danger border-0 position-fixed top-0 end-0 m-3";
					errorToast.setAttribute("role", "alert");
					errorToast.innerHTML = `
						<div class="d-flex">
							<div class="toast-body">
								<i class="bi bi-exclamation-triangle me-2"></i>
								Sign in failed. Please try again.
							</div>
							<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
						</div>
					`;

					document.body.appendChild(errorToast);
					const toast = new bootstrap.Toast(errorToast);
					toast.show();

					errorToast.addEventListener("hidden.bs.toast", () => {
						errorToast.remove();
					});
				} else {
					alert("Sign in failed. Please try again.");
				}
			};

			showError();
		} finally {
			// Restore button state
			googleBtn.innerHTML = originalContent;
			googleBtn.disabled = false;
		}
	});

	return wrapper;
}
