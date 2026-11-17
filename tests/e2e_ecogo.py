"""Automated Playwright E2E test suite for EcoGo Smart Web/PWA."""

import os
import sys
from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("ECOGO_URL", "http://localhost:5000")


def log_step(name, ok, detail=""):
    status = "PASS" if ok else "FAIL"
    print(f"[{status}] {name}" + (f" - {detail}" if detail else ""))
    if not ok:
        raise AssertionError(f"{name}: {detail}")


def ensure_logged_in(page):
    """Advance past splash/onboarding/OTP into the authenticated Home screen if needed."""
    page.wait_for_timeout(4200)  # Wait for splash auto-transition

    if page.locator("text=Bạn cần thuê xe ở đâu?").count() > 0:
        return

    # Step 1: Location permission
    for label in ["Cho phép một lần", "Allow Once", "Cho phép khi dùng ứng dụng"]:
        btn = page.locator(f"text={label}").first
        if btn.count() > 0 and btn.is_visible():
            btn.click()
            page.wait_for_timeout(500)
            break

    # Step 2: Welcome -> click phone input box to open keypad
    phone_box = page.locator("text=Nhập số điện thoại của bạn").first
    if phone_box.count() > 0 and phone_box.is_visible():
        phone_box.click()
        page.wait_for_timeout(500)

    # Step 3/4: Enter phone via input or custom numeric keypad
    phone_input = page.locator("input").first
    if phone_input.count() > 0 and phone_input.is_visible():
        phone_input.fill("386726647")
    else:
        for digit in "386726647":
            page.locator(f"div[tabindex='0']:has-text('{digit}')").last.click(force=True)
            page.wait_for_timeout(60)

    cont = page.locator("text=Tiếp tục").first
    if cont.count() > 0 and cont.is_visible():
        cont.click(force=True)
        page.wait_for_timeout(600)

    # Step 4: Send verification code (retry once if Render cold-start returns transient error)
    for _ in range(2):
        send_otp = page.locator("text=Gửi mã xác thực").first
        if send_otp.count() > 0 and send_otp.is_visible():
            send_otp.click(force=True)
            page.wait_for_timeout(1500)
        else:
            break

    # Step 5: OTP
    quick = page.locator("text=/Điền nhanh OTP|Quick Fill OTP|Autofill/i").first
    if quick.count() > 0 and quick.is_visible():
        quick.click(force=True)
    else:
        for digit in "8888":
            d_btn = page.locator(f"div[tabindex='0']:has-text('{digit}')").last
            if d_btn.count() > 0 and d_btn.is_visible():
                d_btn.click(force=True)
                page.wait_for_timeout(80)

    try:
        page.wait_for_selector("text=Bạn cần thuê xe ở đâu?", timeout=12000)
    except Exception:
        print("DEBUG SCREEN TEXT:", page.inner_text("body")[:600])
        raise


def run_suite():
    page_errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 412, "height": 915})
        page = context.new_page()
        page.on("pageerror", lambda err: page_errors.append(str(err)))
        page.on("dialog", lambda dialog: dialog.accept())

        print(f"Running EcoGo Smart E2E tests against: {BASE_URL}")
        page.goto(BASE_URL, wait_until="networkidle")
        ensure_logged_in(page)
        log_step("1. App Boot & Auth -> Home Screen", True)

        # Dismiss daily promo popup if shown
        dismiss_btn = page.locator("text=Không hiện lại hôm nay").first
        if dismiss_btn.count() > 0 and dismiss_btn.is_visible():
            dismiss_btn.click()
            page.wait_for_timeout(300)

        # 2. Home -> Map shortcut button
        map_btn = page.locator("text=Bản đồ").first
        log_step("2a. Home Map shortcut visible", map_btn.is_visible())
        map_btn.click()
        page.wait_for_timeout(800)
        map_loaded = (
            page.locator("text=Điểm thuê xe").count() > 0
            or page.locator("text=Trạm sạc EV").count() > 0
        )
        log_step("2b. Map Screen opens from Home", map_loaded)

        # Return to Home via bottom dock (1st tab)
        page.go_back() if page.url != BASE_URL else None
        page.goto(BASE_URL, wait_until="networkidle")
        page.wait_for_selector("text=Bạn cần thuê xe ở đâu?", timeout=10000)

        # 3. Doorstep delivery -> VehiclesScreen (must NOT show 0/0 xe)
        page.locator("text=Giao xe tận nơi").first.click()
        page.wait_for_timeout(400)
        view_all_btn = page.locator("text=/Xem Toàn Bộ .* Xe & Đặt Giao Tận Nơi/").first
        log_step("3a. Doorstep modal CTA visible", view_all_btn.is_visible())
        view_all_btn.click()
        page.wait_for_timeout(800)
        zero_bug = page.locator("text=Hiển thị 0/0 xe").count() > 0
        log_step("3b. Vehicles Screen has cars (not 0/0)", not zero_bug)

        # 4. Offers tab -> Tier Rank modal
        dock_count = page.evaluate(
            """() => {
                const btns = Array.from(document.querySelectorAll('[tabindex="0"]'));
                const dock = btns.filter(el => {
                    const r = el.getBoundingClientRect();
                    return r.top > window.innerHeight - 130 && r.bottom <= window.innerHeight && r.width > 20 && r.width < 110 && r.height > 20 && r.height < 95;
                });
                if (dock.length >= 5) dock[2].click();
                return dock.length;
            }"""
        )
        page.wait_for_timeout(900)

        log_step(
            "4a. Offers Screen loaded",
            page.locator("text=Đặc quyền & Ưu đãi").count() > 0,
            f"dock_count={dock_count}",
        )
        page.locator("text=Xếp hạng").first.click()
        page.wait_for_timeout(400)
        log_step(
            "4b. Tier Rank modal opens",
            page.locator("text=HẠNG THÀNH VIÊN HIỆN TẠI").count() > 0,
        )
        # Close rank modal
        page.keyboard.press("Escape")
        page.wait_for_timeout(300)

        # 5. Profile tab -> EN/VI Language Toggle sync
        page.evaluate(
            """() => {
                const btns = Array.from(document.querySelectorAll('[tabindex="0"]'));
                const dock = btns.filter(el => {
                    const r = el.getBoundingClientRect();
                    return r.top > window.innerHeight - 130 && r.bottom <= window.innerHeight && r.width > 30 && r.width < 95 && r.height > 30 && r.height < 85;
                });
                if (dock.length >= 5) dock[dock.length - 1].click();
            }"""
        )
        page.wait_for_timeout(700)
        log_step(
            "5a. Profile Screen loaded",
            page.locator("text=Cài đặt hệ thống").count() > 0,
        )
        page.locator("text=Ngôn ngữ hiển thị").first.click()
        page.wait_for_timeout(500)
        en_synced = (
            page.locator("text=Actions & Privileges").count() > 0
            and page.locator("text=System Settings").count() > 0
            and page.locator("text=Sign Out").count() > 0
        )
        log_step("5b. Profile switches to English cleanly", en_synced)

        # Switch back to Vietnamese
        page.locator("text=Display Language").first.click()
        page.wait_for_timeout(400)

        log_step("6. Zero uncaught JS page errors", len(page_errors) == 0, "; ".join(page_errors))
        browser.close()

    print("\nALL E2E CHECKS PASSED!")


if __name__ == "__main__":
    try:
        run_suite()
    except Exception as exc:
        print(f"\nE2E SUITE FAILED: {exc}", file=sys.stderr)
        sys.exit(1)
