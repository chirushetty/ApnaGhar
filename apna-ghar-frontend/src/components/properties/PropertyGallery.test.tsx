import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PropertyGallery from "./PropertyGallery";

// Render next/image as a plain <img> so we can assert on the resolved src.
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img src={typeof src === "string" ? src : ""} alt={alt} />
  ),
}));

const images = [
  "https://images.unsplash.com/photo-a?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-b?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-c?auto=format&fit=crop&w=1200&q=70",
];

function renderGallery() {
  return render(
    <PropertyGallery images={images} title="T" isRent={false} vastuCompliant={false} />,
  );
}

beforeEach(() => vi.clearAllMocks());

describe("PropertyGallery", () => {
  it("only renders the first full-size slide initially (lazy)", () => {
    renderGallery();
    expect(screen.getByAltText(/— photo 1/)).toBeInTheDocument();
    expect(screen.queryByAltText(/— photo 2/)).not.toBeInTheDocument();
    expect(screen.queryByAltText(/— photo 3/)).not.toBeInTheDocument();
  });

  it("loads a slide only after the user navigates to it", async () => {
    const user = userEvent.setup();
    renderGallery();
    await user.click(screen.getByLabelText("Next photo"));
    expect(await screen.findByAltText(/— photo 2/)).toBeInTheDocument();
  });

  it("requests full-size for the main slide and small thumbnails", () => {
    renderGallery();
    const main = screen.getByAltText(/— photo 1/) as HTMLImageElement;
    expect(main.getAttribute("src")).toContain("w=1200");

    const thumb = screen.getByAltText(/thumbnail 1/) as HTMLImageElement;
    expect(thumb.getAttribute("src")).toContain("w=160");
    expect(thumb.getAttribute("src")).not.toContain("w=1200");
  });
});
