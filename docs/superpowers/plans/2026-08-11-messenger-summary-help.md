# 메신저 요약 알리미 지원 안내 페이지 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 제공된 7장의 스크린샷을 활용해 설치 폴더 분석 ZIP 파일을 만드는 과정을 안내하는 독립 실행형 한국어 도움말 페이지를 만든다.

**Architecture:** `index.html`이 의미 있는 콘텐츠와 단계별 스크린샷을 제공하고, `styles.css`가 회청색·청록색 기반의 타임라인 UI와 반응형 레이아웃을 담당한다. `script.js`는 이미지 확대 모달, 이메일 주소 복사, 모달 포커스 복귀만 담당하며 JavaScript가 꺼져도 핵심 안내와 `mailto:` 링크는 사용할 수 있다.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, 로컬 PNG assets. 외부 CDN, 웹폰트, 빌드 도구, 서버, 추적 코드는 사용하지 않는다.

## Global Constraints

- `index.html`을 파일 탐색기에서 직접 열어도 동작해야 한다.
- 페이지의 단일 목표는 설치 폴더 주소 입력과 분석 ZIP 파일 저장·전송 안내다.
- 스크린샷 7장을 `assets/step-01-context.png`부터 `assets/step-07-save.png`로 포함한다.
- 경로와 파일명은 고정폭 글꼴로 보여주고, 실행 파일 자체가 아니라 실행 파일이 들어 있는 폴더를 입력한다고 명시한다.
- ZIP 파일에 포함되는 정보와 포함되지 않는 정보를 스크린샷에 표시된 내용과 일치하게 안내한다.
- 수신 주소는 `poo1355@h.jne.go.kr`이며 클릭 가능한 `mailto:` 링크와 복사 기능을 제공한다.
- 키보드 포커스, `Esc` 모달 닫기, `prefers-reduced-motion: reduce`, 375px·768px·1280px 폭을 지원한다.
- 이미지와 콘텐츠는 JavaScript 없이도 보이고, JavaScript는 보조 상호작용만 담당한다.

---

### Task 1: 제공 스크린샷을 로컬 assets로 가져오기

**Files:**
- Create: `assets/step-01-context.png` through `assets/step-07-save.png`

**Interfaces:**
- Consumes: `C:\Users\user\Pictures\Screenshots\스크린샷 2026-08-11 161907.png` through `스크린샷 2026-08-11 162305.png`
- Produces: HTML에서 상대 경로로 참조할 수 있는 7개의 PNG 파일

- [ ] **Step 1: Create the asset directory**

Run:

```powershell
New-Item -ItemType Directory -Force -Path 'C:\Users\user\Documents\ChatGPT\도움말 제작\assets'
```

Expected: `assets` directory exists in the workspace.

- [ ] **Step 2: Copy the seven user-provided images with stable names**

Run:

```powershell
Copy-Item -LiteralPath 'C:\Users\user\Pictures\Screenshots\스크린샷 2026-08-11 161907.png' -Destination 'C:\Users\user\Documents\ChatGPT\도움말 제작\assets\step-01-context.png'
Copy-Item -LiteralPath 'C:\Users\user\Pictures\Screenshots\스크린샷 2026-08-11 161943.png' -Destination 'C:\Users\user\Documents\ChatGPT\도움말 제작\assets\step-02-properties.png'
Copy-Item -LiteralPath 'C:\Users\user\Pictures\Screenshots\스크린샷 2026-08-11 162010.png' -Destination 'C:\Users\user\Documents\ChatGPT\도움말 제작\assets\step-03-menu.png'
Copy-Item -LiteralPath 'C:\Users\user\Pictures\Screenshots\스크린샷 2026-08-11 162028.png' -Destination 'C:\Users\user\Documents\ChatGPT\도움말 제작\assets\step-04-settings.png'
Copy-Item -LiteralPath 'C:\Users\user\Pictures\Screenshots\스크린샷 2026-08-11 162242.png' -Destination 'C:\Users\user\Documents\ChatGPT\도움말 제작\assets\step-05-folder.png'
Copy-Item -LiteralPath 'C:\Users\user\Pictures\Screenshots\스크린샷 2026-08-11 162254.png' -Destination 'C:\Users\user\Documents\ChatGPT\도움말 제작\assets\step-06-consent.png'
Copy-Item -LiteralPath 'C:\Users\user\Pictures\Screenshots\스크린샷 2026-08-11 162305.png' -Destination 'C:\Users\user\Documents\ChatGPT\도움말 제작\assets\step-07-save.png'
```

Expected: seven non-empty PNG files exist with the exact target names.

- [ ] **Step 3: Verify the asset set**

Run:

```powershell
Get-ChildItem -LiteralPath 'C:\Users\user\Documents\ChatGPT\도움말 제작\assets' -Filter '*.png' | Select-Object Name, Length
```

Expected: seven rows, all lengths greater than zero, in step order.

- [ ] **Step 4: Commit the asset import**

```powershell
git add -- assets
git commit -m "feat: add messenger help screenshots"
```

---

### Task 2: 의미 있는 HTML 콘텐츠와 단계 구조 작성

**Files:**
- Create: `index.html`

**Interfaces:**
- Consumes: `assets/step-01-context.png` through `assets/step-07-save.png`
- Produces: 단계별 제목·설명·경로 라벨·스크린샷 figure, 개인정보 카드, 이메일 완료 카드, 이미지 모달 뼈대

- [ ] **Step 1: Write the semantic page shell**

Create `<!doctype html>` with `lang="ko"`, a descriptive `<title>`, viewport metadata, and links to `styles.css` and `script.js`. Use this top-level structure:

```html
<body>
  <header class="site-header">...</header>
  <main>
    <section class="hero" id="top">...</section>
    <nav class="progress-nav" aria-label="안내 순서">...</nav>
    <section class="guide" aria-labelledby="guide-title">...</section>
    <section class="privacy-card" aria-labelledby="privacy-title">...</section>
    <section class="trouble-card" aria-labelledby="trouble-title">...</section>
    <section class="send-card" id="send" aria-labelledby="send-title">...</section>
  </main>
  <footer>...</footer>
  <div class="image-modal" hidden>...</div>
  <script src="script.js"></script>
</body>
```

- [ ] **Step 2: Add the exact user-facing copy for the five ordered steps**

Use five `<article class="step-card">` elements with `data-step` values `01` through `05`. Map the screenshots as follows:

```html
<figure class="shot" data-lightbox>
  <button class="shot-button" type="button" aria-label="스크린샷 크게 보기">
    <img src="assets/step-01-context.png" alt="메신저 바로가기의 오른쪽 클릭 메뉴에서 속성을 선택하는 화면">
  </button>
  <figcaption>그림 1 · 메신저 바로가기의 속성 열기</figcaption>
</figure>
```

Repeat the same accessible figure pattern for the remaining six images. The step copy must explicitly use these controls: `속성`, `시작 위치(S)`, `대상(T)`, `설정...`, `메신저 설치 폴더`, `이 폴더 분석하기`, the consent checkbox, `파일 만들기`.

- [ ] **Step 3: Add paths, privacy content, and completion action**

Include a path label that shows the distinction between an executable and its folder:

```html
<div class="path-label">
  <span>지금 확인할 것</span>
  <code>C:\Program Files (x86)\CoolMessenger Gentoo</code>
</div>
```

Add the inclusion and exclusion lists from the design spec, a clear note that the ZIP does not contain message content, and a completion card with:

```html
<a class="email-link" href="mailto:poo1355@h.jne.go.kr">poo1355@h.jne.go.kr</a>
<button class="copy-button" type="button" data-copy-email>주소 복사</button>
```

- [ ] **Step 4: Add modal markup and no-script fallback**

The modal must contain a close button, an empty `<img>` whose `src` and `alt` are set by `script.js`, and a `<p>` caption. Keep the original thumbnails and `mailto:` link usable if JavaScript is disabled.

- [ ] **Step 5: Verify static references before styling**

Run:

```powershell
Select-String -Path 'C:\Users\user\Documents\ChatGPT\도움말 제작\index.html' -Pattern 'step-0[1-7]-|poo1355@h.jne.go.kr|이 폴더 분석하기|파일 만들기'
```

Expected: every screenshot filename, email address, and required control label appears in `index.html`.

- [ ] **Step 6: Commit the semantic page**

```powershell
git add -- index.html
git commit -m "feat: add messenger help page content"
```

---

### Task 3: 타임라인 UI와 반응형 스타일 구현

**Files:**
- Create: `styles.css`

**Interfaces:**
- Consumes: classes and attributes from `index.html`, including `.site-header`, `.hero`, `.progress-nav`, `.step-card`, `.path-label`, `.shot`, `.privacy-card`, `.trouble-card`, `.send-card`, `.image-modal`, and `[data-copy-email]`
- Produces: desktop two-column timeline, mobile single-column flow, visible focus states, reduced-motion behavior

- [ ] **Step 1: Define the design tokens and base rules**

Add `:root` variables for the approved palette, radii, shadows, max width, and spacing. Set `box-sizing: border-box`, a neutral body margin, the Korean font stack, a readable `line-height`, and smooth in-page navigation with a reduced-motion override.

- [ ] **Step 2: Style the hero and progress navigation**

Use a quiet pale background and a dark text panel, with a teal “업데이트 지원 안내” eyebrow. Make the progress nav a horizontal row on desktop and a compact grid on small screens. Each item must have a visible `:focus-visible` outline.

- [ ] **Step 3: Style the vertical guide and screenshot cards**

Use a real left-side timeline rail because the content is ordered. Each step card uses a grid with copy on the left and screenshot on the right. The number marker is a teal circle with a small step label, while the `path-label` uses a darker code-like panel and horizontal scrolling rather than clipping.

- [ ] **Step 4: Style privacy, troubleshooting, and email completion cards**

Use teal for included data, orange for privacy cautions, and dark navy for the final email card. Keep the email action visually prominent but not decorative. Buttons must have hover, active, and `:focus-visible` states.

- [ ] **Step 5: Add responsive and accessibility rules**

At `max-width: 800px`, collapse step grids, hide the decorative timeline rail, make images full width, and reduce horizontal padding. At `max-width: 480px`, keep headings readable, allow path labels to scroll, and stack the email controls. Add `@media (prefers-reduced-motion: reduce)` to remove transitions and reveal animations.

- [ ] **Step 6: Verify CSS selectors and layout references**

Run:

```powershell
Select-String -Path 'C:\Users\user\Documents\ChatGPT\도움말 제작\styles.css' -Pattern ':focus-visible|prefers-reduced-motion|max-width: 800px|path-label|step-card'
```

Expected: focus, reduced motion, responsive, path, and step rules are present.

- [ ] **Step 7: Commit the visual layer**

```powershell
git add -- styles.css
git commit -m "feat: style messenger help guide"
```

---

### Task 4: 이미지 확대와 이메일 복사 상호작용 구현

**Files:**
- Create: `script.js`

**Interfaces:**
- Consumes: buttons wrapping `[data-lightbox]` images, `.image-modal`, `[data-modal-close]`, `[data-copy-email]`, `#copy-status`
- Produces: `openImage(button)`, `closeImage()`, and `copyEmail()` behavior with focus restoration and no-script-safe defaults

- [ ] **Step 1: Implement modal state and focus restoration**

Use module-scoped `let lastTrigger = null`. `openImage(button)` reads the nested image’s `src`, `alt`, and `figcaption`, fills the modal image and caption, removes `hidden`, adds a body lock class, and focuses the close button. `closeImage()` restores `hidden`, removes the body lock, and returns focus to `lastTrigger`.

- [ ] **Step 2: Implement keyboard and pointer close behavior**

Attach click listeners to every `[data-lightbox] .shot-button`, `[data-modal-close]`, and the modal backdrop. Add a `keydown` listener that closes on `Escape` and does nothing for other keys. Keep the close button’s text and accessible label in Korean.

- [ ] **Step 3: Implement clipboard copy with a visible status**

Read the email from `data-email` or the `.email-link` text. On success, call `navigator.clipboard.writeText(email)` and set `#copy-status` to `주소를 복사했습니다.` for 2 seconds. On failure, set the status to `주소를 직접 선택해서 복사해 주세요.` without blocking the `mailto:` link.

- [ ] **Step 4: Verify the script syntax and hooks**

Run:

```powershell
node --check 'C:\Users\user\Documents\ChatGPT\도움말 제작\script.js'
Select-String -Path 'C:\Users\user\Documents\ChatGPT\도움말 제작\script.js' -Pattern 'data-lightbox|Escape|clipboard|data-copy-email|hidden'
```

Expected: Node reports no syntax errors and all required hooks appear.

- [ ] **Step 5: Commit the interaction layer**

```powershell
git add -- script.js
git commit -m "feat: add help page interactions"
```

---

### Task 5: 로컬 브라우저 검증 및 품질 정리

**Files:**
- Modify: `index.html`, `styles.css`, `script.js` only if verification finds a concrete issue

**Interfaces:**
- Consumes: all page files and local assets
- Produces: verified direct-file experience at `index.html`

- [ ] **Step 1: Verify every image and required phrase exists**

Run:

```powershell
$page = Get-Content -LiteralPath 'C:\Users\user\Documents\ChatGPT\도움말 제작\index.html' -Raw
1..7 | ForEach-Object { if ($page -notmatch "assets/step-0$_-") { throw "missing image step $_" } }
foreach ($phrase in @('시작 위치(S)', '대상(T)', '이 폴더 분석하기', '파일 만들기', 'poo1355@h.jne.go.kr')) { if ($page -notmatch [regex]::Escape($phrase)) { throw "missing phrase: $phrase" } }
```

Expected: command exits without throwing.

- [ ] **Step 2: Open the page directly and inspect visual states**

Open `C:\Users\user\Documents\ChatGPT\도움말 제작\index.html` in a browser. Check the first viewport, all five step cards, privacy card, troubleshooting card, and email completion card. Resize to approximately 375px, 768px, and 1280px widths and confirm no content is clipped.

- [ ] **Step 3: Exercise interactions with keyboard and pointer**

Click one screenshot, press `Escape`, reopen it and use the close button, then tab through the page to confirm visible focus. Click `주소 복사` and confirm the visible status text; click the email address and confirm it is a `mailto:` link.

- [ ] **Step 4: Inspect final Git diff and status**

Run:

```powershell
git status --short
git diff HEAD~4 --stat
```

Expected: only the design/plan docs, `index.html`, `styles.css`, `script.js`, and seven asset files are present; no generated caches or unrelated edits exist.

- [ ] **Step 5: Commit verified page**

```powershell
git add -- index.html styles.css script.js assets
git commit -m "chore: verify messenger help page"
```
