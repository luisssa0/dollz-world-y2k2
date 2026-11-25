export class Input {
  constructor() {
    this.keys = new Set();
    this.touch = { left:false, right:false, jump:false };
    this.jumpQueued = false;
    this.active = true;
    window.addEventListener("keydown", e => {
      const key = e.key.toLowerCase();
      if (["arrowleft","arrowright","arrowup"," ","w","a","d"].includes(key)) e.preventDefault();
      if (!this.keys.has(key) && [" ","w","arrowup"].includes(key)) this.jumpQueued = true;
      this.keys.add(key);
    });
    window.addEventListener("keyup", e => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener("blur", () => this.clear());
    document.querySelectorAll("[data-control]").forEach(button => {
      const control = button.dataset.control;
      const down = e => {
        e.preventDefault();
        if (control === "jump" && !this.touch.jump) this.jumpQueued = true;
        this.touch[control] = true;
        button.setPointerCapture?.(e.pointerId);
      };
      const up = e => { e.preventDefault(); this.touch[control] = false; };
      button.addEventListener("pointerdown", down);
      ["pointerup","pointercancel","lostpointercapture"].forEach(type => button.addEventListener(type, up));
    });
  }
  get left() { return this.active && (this.keys.has("arrowleft") || this.keys.has("a") || this.touch.left); }
  get right() { return this.active && (this.keys.has("arrowright") || this.keys.has("d") || this.touch.right); }
  consumeJump() { const value = this.active && this.jumpQueued; this.jumpQueued = false; return value; }
  clear() { this.keys.clear(); this.touch.left = this.touch.right = this.touch.jump = false; this.jumpQueued = false; }
}