import type { ThemeConfig } from "antd";

export const theme: ThemeConfig = {
  token: {
    colorPrimary: "#e10600",
    colorText: "#fff",
    borderRadius: 8,
    controlHeight: 40,
    colorBorder: "#333",
    colorTextPlaceholder: "#aaa",
  },
  components: {
    Select: {
      colorBgContainer: "#1a1a1a",
      colorBorder: "#444",
      optionSelectedBg: "rgba(255, 255, 255, 0.15)",
      colorPrimaryHover: "#ff3c3c",
      controlOutline: "none",
      colorBgElevated: "#1f1f1f",
    },
    Button: {
      colorBgContainer: "#121212",
      colorText: "#ffffff",
      colorBorder: "#444",
      colorBgContainerDisabled: "#000000",
      colorTextDisabled: "#555555",
      borderRadius: 8,
    },
  },
};
