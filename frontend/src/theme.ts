import type { ThemeConfig } from "antd";

export const theme: ThemeConfig = {
  token: {
    colorPrimary: "#ff1e1e",
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
      colorBgContainer: "#121212", // black background
      colorText: "#ffffff", // white text
      colorBorder: "#444", // invisible border
      colorTextHover: "#ff3333", // red text on hover
      colorBorderHover: "#ff3333", // red border on hover
      colorBgContainerHover: "#000000", // keep bg black on hover
      colorBgContainerDisabled: "#000000", // black when disabled
      colorTextDisabled: "#555555", // gray text when disabled
      borderRadius: 8,
    },
  },
};
