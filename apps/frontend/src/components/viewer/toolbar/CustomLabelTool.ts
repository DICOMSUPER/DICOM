/**
 * Custom Label Tool with styled dialog
 * Extends Cornerstone's LabelTool to use a dark-themed modal instead of browser prompt
 */
import { LabelTool } from "@cornerstonejs/tools";

// Custom getTextCallback that shows a styled dialog
const customGetTextCallback = (callback: (text: string | null) => void): void => {
  // Create overlay
  const overlay = document.createElement("div");
  overlay.id = "custom-label-dialog-overlay";
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.7); z-index: 10000;
    display: flex; align-items: center; justify-content: center;
  `;

  // Create dialog
  const dialog = document.createElement("div");
  dialog.style.cssText = `
    background: #1e293b; border-radius: 12px; padding: 24px;
    min-width: 320px; box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    border: 1px solid #334155; font-family: system-ui, sans-serif;
  `;

  dialog.innerHTML = `
    <h3 style="color: white; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Add Label</h3>
    <input type="text" id="customLabelInput" placeholder="Enter label text..." 
      style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #475569;
      background: #0f172a; color: white; font-size: 14px; box-sizing: border-box;
      outline: none;" />
    <div style="display: flex; gap: 12px; margin-top: 16px; justify-content: flex-end;">
      <button id="customLabelCancel" style="padding: 10px 20px; border-radius: 8px; border: none;
        background: #475569; color: white; cursor: pointer; font-size: 14px;
        transition: background 0.2s;">Cancel</button>
      <button id="customLabelSubmit" style="padding: 10px 20px; border-radius: 8px; border: none;
        background: #0d9488; color: white; cursor: pointer; font-size: 14px;
        transition: background 0.2s;">Add Label</button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  const input = dialog.querySelector("#customLabelInput") as HTMLInputElement;
  const submitBtn = dialog.querySelector("#customLabelSubmit") as HTMLButtonElement;
  const cancelBtn = dialog.querySelector("#customLabelCancel") as HTMLButtonElement;

  // Focus input
  setTimeout(() => input.focus(), 50);

  const cleanup = () => {
    if (document.body.contains(overlay)) {
      document.body.removeChild(overlay);
    }
  };

  const handleSubmit = () => {
    const text = input.value.trim();
    cleanup();
    callback(text || null);
  };

  const handleCancel = () => {
    cleanup();
    callback(null);
  };

  submitBtn.onclick = handleSubmit;
  cancelBtn.onclick = handleCancel;

  input.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  overlay.onclick = (e) => {
    if (e.target === overlay) {
      handleCancel();
    }
  };

  // Hover effects
  submitBtn.onmouseenter = () => (submitBtn.style.background = "#0f766e");
  submitBtn.onmouseleave = () => (submitBtn.style.background = "#0d9488");
  cancelBtn.onmouseenter = () => (cancelBtn.style.background = "#64748b");
  cancelBtn.onmouseleave = () => (cancelBtn.style.background = "#475569");
};

// Custom changeTextCallback for editing existing labels
const customChangeTextCallback = (
  annotation: any,
  currentLabel: string,
  callback: (newLabel: string | null) => void
): void => {
  // Create overlay
  const overlay = document.createElement("div");
  overlay.id = "custom-label-dialog-overlay";
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.7); z-index: 10000;
    display: flex; align-items: center; justify-content: center;
  `;

  // Create dialog
  const dialog = document.createElement("div");
  dialog.style.cssText = `
    background: #1e293b; border-radius: 12px; padding: 24px;
    min-width: 320px; box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    border: 1px solid #334155; font-family: system-ui, sans-serif;
  `;

  dialog.innerHTML = `
    <h3 style="color: white; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Edit Label</h3>
    <input type="text" id="customLabelInput" value="${currentLabel || ""}" 
      style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #475569;
      background: #0f172a; color: white; font-size: 14px; box-sizing: border-box;
      outline: none;" />
    <div style="display: flex; gap: 12px; margin-top: 16px; justify-content: flex-end;">
      <button id="customLabelCancel" style="padding: 10px 20px; border-radius: 8px; border: none;
        background: #475569; color: white; cursor: pointer; font-size: 14px;">Cancel</button>
      <button id="customLabelSubmit" style="padding: 10px 20px; border-radius: 8px; border: none;
        background: #0d9488; color: white; cursor: pointer; font-size: 14px;">Save</button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  const input = dialog.querySelector("#customLabelInput") as HTMLInputElement;
  const submitBtn = dialog.querySelector("#customLabelSubmit") as HTMLButtonElement;
  const cancelBtn = dialog.querySelector("#customLabelCancel") as HTMLButtonElement;

  setTimeout(() => {
    input.focus();
    input.select();
  }, 50);

  const cleanup = () => {
    if (document.body.contains(overlay)) {
      document.body.removeChild(overlay);
    }
  };

  submitBtn.onclick = () => {
    const text = input.value.trim();
    cleanup();
    callback(text || null);
  };

  cancelBtn.onclick = () => {
    cleanup();
    callback(null);
  };

  input.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitBtn.click();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      cancelBtn.click();
    }
  };

  overlay.onclick = (e) => {
    if (e.target === overlay) cancelBtn.click();
  };
};

/**
 * Custom Label Tool class with styled dialog
 */
class CustomLabelTool extends LabelTool {
  static toolName = "CustomLabel";

  constructor(
    toolProps: any = {},
    defaultToolProps: any = {
      supportedInteractionTypes: ["Mouse", "Touch"],
      configuration: {
        shadow: true,
        getTextCallback: customGetTextCallback,
        changeTextCallback: customChangeTextCallback,
        preventHandleOutsideImage: false,
      },
    }
  ) {
    super(toolProps, defaultToolProps);
  }
}

export { CustomLabelTool, customGetTextCallback, customChangeTextCallback };
export default CustomLabelTool;
