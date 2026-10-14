import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import BallotIcon from "./BallotIcon";
import QRCodeIcon from "./QRCodeIcon";
import StatsIcon from "./StatsIcon";

describe("Icon Components", () => {
    describe("BallotIcon", () => {
        it("renders with default props (size 32, aria-hidden true)", () => {
            render(<BallotIcon data-testid="ballot-icon" />);
            const icon = screen.getByTestId("ballot-icon");
            expect(icon).toBeInTheDocument();
            expect(icon.tagName.toLowerCase()).toBe("svg");
            expect(icon).toHaveAttribute("width", "32");
            expect(icon).toHaveAttribute("height", "32");
            expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
            expect(icon).toHaveAttribute("fill", "currentColor");
            expect(icon).toHaveAttribute("aria-hidden", "true");
        });

        it("supports custom size and className", () => {
            render(<BallotIcon size={48} className="custom-ballot" data-testid="ballot-custom" />);
            const icon = screen.getByTestId("ballot-custom");
            expect(icon).toHaveAttribute("width", "48");
            expect(icon).toHaveAttribute("height", "48");
            expect(icon).toHaveClass("custom-ballot");
        });

        it("passes through additional SVG props", () => {
            render(<BallotIcon id="test-ballot-id" role="img" aria-label="Ballot Icon" data-testid="ballot-props" />);
            const icon = screen.getByTestId("ballot-props");
            expect(icon).toHaveAttribute("id", "test-ballot-id");
            expect(icon).toHaveAttribute("role", "img");
            expect(icon).toHaveAttribute("aria-label", "Ballot Icon");
        });
    });

    describe("QRCodeIcon", () => {
        it("renders with default props (size 20, aria-hidden true)", () => {
            render(<QRCodeIcon data-testid="qrcode-icon" />);
            const icon = screen.getByTestId("qrcode-icon");
            expect(icon).toBeInTheDocument();
            expect(icon.tagName.toLowerCase()).toBe("svg");
            expect(icon).toHaveAttribute("width", "20");
            expect(icon).toHaveAttribute("height", "20");
            expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
            expect(icon).toHaveAttribute("fill", "none");
            expect(icon).toHaveAttribute("stroke", "currentColor");
            expect(icon).toHaveAttribute("stroke-width", "2");
            expect(icon).toHaveAttribute("aria-hidden", "true");
        });

        it("supports custom size and className", () => {
            render(<QRCodeIcon size={32} className="qr-custom" data-testid="qrcode-custom" />);
            const icon = screen.getByTestId("qrcode-custom");
            expect(icon).toHaveAttribute("width", "32");
            expect(icon).toHaveAttribute("height", "32");
            expect(icon).toHaveClass("qr-custom");
        });

        it("passes through additional SVG props", () => {
            render(<QRCodeIcon id="test-qr-id" role="img" aria-label="QR Code" data-testid="qrcode-props" />);
            const icon = screen.getByTestId("qrcode-props");
            expect(icon).toHaveAttribute("id", "test-qr-id");
            expect(icon).toHaveAttribute("role", "img");
            expect(icon).toHaveAttribute("aria-label", "QR Code");
        });
    });

    describe("StatsIcon", () => {
        it("renders with default props (size 20, aria-hidden true)", () => {
            render(<StatsIcon data-testid="stats-icon" />);
            const icon = screen.getByTestId("stats-icon");
            expect(icon).toBeInTheDocument();
            expect(icon.tagName.toLowerCase()).toBe("svg");
            expect(icon).toHaveAttribute("width", "20");
            expect(icon).toHaveAttribute("height", "20");
            expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
            expect(icon).toHaveAttribute("fill", "currentColor");
            expect(icon).toHaveAttribute("aria-hidden", "true");
        });

        it("supports custom size and className", () => {
            render(<StatsIcon size={40} className="stats-custom" data-testid="stats-custom" />);
            const icon = screen.getByTestId("stats-custom");
            expect(icon).toHaveAttribute("width", "40");
            expect(icon).toHaveAttribute("height", "40");
            expect(icon).toHaveClass("stats-custom");
        });

        it("passes through additional SVG props", () => {
            render(<StatsIcon id="test-stats-id" role="img" aria-label="Statistics" data-testid="stats-props" />);
            const icon = screen.getByTestId("stats-props");
            expect(icon).toHaveAttribute("id", "test-stats-id");
            expect(icon).toHaveAttribute("role", "img");
            expect(icon).toHaveAttribute("aria-label", "Statistics");
        });
    });
});
