const form = document.getElementById("qrForm");
const img = document.getElementById("qrImage");
const statusEl = document.getElementById("status");
const logEl = document.getElementById("log");
const downloadBtn = document.getElementById("downloadBtn");

let currentObjectUrl = null;
let currentDownloadUrl = null;

function setStatus(text, kind = "idle") {
  statusEl.textContent = text;
  statusEl.className = `status ${kind}`;
}

function setLog(text = "") {
  logEl.textContent = text;
}

function clearPreview() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
  img.removeAttribute("src");
  currentDownloadUrl = null;
  downloadBtn.disabled = true;
}

function normalizeBase64(payload) {
  if (!payload) {
    return "";
  }
  if (typeof payload === "string") {
    return payload;
  }
  if (typeof payload.base64 === "string") {
    return payload.base64;
  }
  if (typeof payload.data === "string") {
    return payload.data;
  }
  if (typeof payload.image === "string") {
    return payload.image;
  }
  return "";
}

function toDataUrl(base64) {
  if (base64.startsWith("data:image")) {
    return base64;
  }
  return `data:image/png;base64,${base64}`;
}

async function requestWxacode(apiBase, payload) {
  const endpoint = `${apiBase.replace(/\/$/, "")}/api/wxacode`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type") || "";
  if (!response.ok) {
    let detail = "";
    try {
      if (contentType.includes("application/json")) {
        detail = JSON.stringify(await response.json(), null, 2);
      } else {
        detail = await response.text();
      }
    } catch (error) {
      detail = "无法读取错误详情。";
    }
    throw new Error(`请求失败：${response.status}\n${detail}`);
  }

  if (contentType.includes("application/json")) {
    const data = await response.json();
    return { type: "base64", value: normalizeBase64(data) };
  }

  const blob = await response.blob();
  return { type: "blob", value: blob };
}

function buildPayload() {
  const scene = document.getElementById("scene").value.trim();
  const page = document.getElementById("page").value.trim();
  const width = document.getElementById("width").value.trim();
  const envVersion = document.getElementById("envVersion").value;
  const checkPath = document.getElementById("checkPath").value;
  const isHyaline = document.getElementById("isHyaline").value;

  if (!scene) {
    throw new Error("scene 不能为空。");
  }

  const payload = {
    scene,
    env_version: envVersion,
    check_path: checkPath === "true",
    is_hyaline: isHyaline === "true",
  };

  if (page) {
    payload.page = page;
  }
  if (width) {
    payload.width = Number(width);
  }

  return payload;
}

function setDownloadUrl(url) {
  currentDownloadUrl = url;
  downloadBtn.disabled = false;
}

downloadBtn.addEventListener("click", () => {
  if (!currentDownloadUrl) {
    return;
  }
  const anchor = document.createElement("a");
  anchor.href = currentDownloadUrl;
  anchor.download = `wxacode_${Date.now()}.png`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearPreview();
  setLog("");
  setStatus("生成中...", "loading");

  const apiBase = document.getElementById("apiBase").value.trim();
  if (!apiBase) {
    setStatus("API Base 不能为空", "error");
    return;
  }

  let payload;
  try {
    payload = buildPayload();
  } catch (error) {
    setStatus(error.message || "参数错误", "error");
    return;
  }

  try {
    const result = await requestWxacode(apiBase, payload);
    if (result.type === "base64") {
      const base64 = result.value;
      if (!base64) {
        throw new Error("服务端返回的 base64 为空。");
      }
      const dataUrl = toDataUrl(base64);
      img.src = dataUrl;
      setDownloadUrl(dataUrl);
    } else {
      currentObjectUrl = URL.createObjectURL(result.value);
      img.src = currentObjectUrl;
      setDownloadUrl(currentObjectUrl);
    }
    setStatus("生成成功", "success");
    setLog(JSON.stringify({ apiBase, payload }, null, 2));
  } catch (error) {
    setStatus("生成失败", "error");
    setLog(error.message || String(error));
  }
});
