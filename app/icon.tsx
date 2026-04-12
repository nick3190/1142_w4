import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          fontWeight: 700,
          color: "#fafafa",
          background: "linear-gradient(135deg,#6d28d9,#0ea5e9)",
        }}
      >
        N
      </div>
    ),
    { ...size },
  );
}
