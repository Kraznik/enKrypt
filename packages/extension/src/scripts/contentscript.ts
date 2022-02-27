import browser from "webextension-polyfill";
import { EXTENSION_NAMESPACE } from "../configs/constants";
import {
  sendMessage,
  onMessage,
  allowWindowMessaging,
} from "@enkryptcom/extension-bridge";

onMessage("show-message", async (message) => {
  console.log(JSON.stringify(message), "content-script");
  return "abc from content";
});

const injectURL = browser.runtime.getURL("scripts/inject.js");
fetch(injectURL).then((response) => {
  response.text().then((inpageContent) => {
    const inpageSuffix = `//# sourceURL=${injectURL}\n`;
    const inpageBundle = inpageContent + inpageSuffix;
    injectScript(inpageBundle);
  });
});
function injectScript(content: string) {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement("script");
    scriptTag.setAttribute("async", "false");
    scriptTag.textContent = content;
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
    allowWindowMessaging(EXTENSION_NAMESPACE);
    sendMessage("show-message", { injected: true }, "background");
    console.log("hello");
  } catch (error) {
    console.error("Enkrypt: Provider injection failed.", error);
  }
}
console.log("Hello from the content-script");