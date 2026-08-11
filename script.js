(() => {
  const modal = document.querySelector(".image-modal");
  const modalImage = document.querySelector(".modal-image");
  const modalCaption = document.querySelector(".modal-caption");
  const closeButton = document.querySelector("[data-modal-close].modal-close");
  const copyButton = document.querySelector("[data-copy-email]");
  const copyStatus = document.querySelector("#copy-status");
  const emailLink = document.querySelector(".email-link");
  let lastTrigger = null;
  let statusTimer = null;

  if (modal && modalImage && modalCaption) {
    function openImage(button) {
      const image = button.querySelector("img");
      const caption = button.closest(".shot")?.querySelector("figcaption");

      if (!image) {
        return;
      }

      lastTrigger = button;
      modalImage.src = image.currentSrc || image.src;
      modalImage.alt = image.alt;
      modalCaption.textContent = caption?.textContent?.trim() || image.alt;
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      closeButton?.focus();
    }

    function closeImage() {
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      modalImage.removeAttribute("src");
      modalImage.alt = "";
      document.body.classList.remove("modal-open");

      if (lastTrigger && document.contains(lastTrigger)) {
        lastTrigger.focus();
      }
      lastTrigger = null;
    }

    document.querySelectorAll("[data-lightbox]").forEach((button) => {
      button.addEventListener("click", () => openImage(button));
    });

    document.querySelectorAll("[data-modal-close]").forEach((element) => {
      element.addEventListener("click", closeImage);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) {
        closeImage();
      }
    });
  }

  function showCopyStatus(message) {
    if (!copyStatus) {
      return;
    }

    window.clearTimeout(statusTimer);
    copyStatus.textContent = message;
    statusTimer = window.setTimeout(() => {
      copyStatus.textContent = "";
    }, 2200);
  }

  async function copyEmail() {
    const email = copyButton?.dataset.email || emailLink?.dataset.email || emailLink?.textContent?.trim();

    if (!email) {
      return;
    }

    if (!navigator.clipboard || !window.isSecureContext) {
      showCopyStatus("주소를 직접 선택해서 복사해 주세요.");
      return;
    }

    try {
      await navigator.clipboard.writeText(email);
      showCopyStatus("주소를 복사했습니다.");
    } catch {
      showCopyStatus("주소를 직접 선택해서 복사해 주세요.");
    }
  }

  copyButton?.addEventListener("click", copyEmail);
})();
