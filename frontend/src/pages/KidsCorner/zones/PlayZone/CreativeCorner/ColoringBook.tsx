import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

import {
  IoArrowBack,
  IoColorPalette,
  IoTrash,
  IoSave,
  IoCheckmarkCircle,
  IoSparkles,
  IoBookOutline,
} from "react-icons/io5";

import { GiButterfly } from "react-icons/gi";
import { FaHeart, FaSun, FaLeaf } from "react-icons/fa";

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

/* -------------------------------------------------------
   CLEAN SVG DEFINITIONS WITH data-id FOR EACH SHAPE
---------------------------------------------------------*/

const COLORING_PAGES = [
  {
    id: "butterfly",
    name: "Beautiful Butterfly",
    icon: GiButterfly,
    difficulty: "Easy",
    color: "text-purple-600",
    svg: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="100" rx="5" ry="30" fill="white" stroke="black" stroke-width="2" class="colorable" data-id="body"/>
  <path d="M 100 70 Q 90 50 85 45" fill="none" stroke="black" stroke-width="2"/>
  <path d="M 100 70 Q 110 50 115 45" fill="none" stroke="black" stroke-width="2"/>
  <circle cx="85" cy="45" r="3" fill="black"/>
  <circle cx="115" cy="45" r="3" fill="black"/>
  <ellipse cx="70" cy="85" rx="30" ry="25" fill="white" stroke="black" stroke-width="2" class="colorable" data-id="left-top-wing"/>
  <ellipse cx="75" cy="115" rx="25" ry="30" fill="white" stroke="black" stroke-width="2" class="colorable" data-id="left-bottom-wing"/>
  <ellipse cx="130" cy="85" rx="30" ry="25" fill="white" stroke="black" stroke-width="2" class="colorable" data-id="right-top-wing"/>
  <ellipse cx="125" cy="115" rx="25" ry="30" fill="white" stroke="black" stroke-width="2" class="colorable" data-id="right-bottom-wing"/>
  <circle cx="70" cy="85" r="8" fill="white" stroke="black" stroke-width="1.5" class="colorable" data-id="left-eye"/>
  <circle cx="130" cy="85" r="8" fill="white" stroke="black" stroke-width="1.5" class="colorable" data-id="right-eye"/>
</svg>
`,
  },
  {
    id: "flower",
    name: "Happy Flower",
    icon: FaLeaf,
    difficulty: "Easy",
    color: "text-green-600",
    svg: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <line x1="100" y1="100" x2="100" y2="180" stroke="black" stroke-width="3"/>
  <ellipse cx="85" cy="140" rx="15" ry="8" fill="white" stroke="black" stroke-width="2" class="colorable" data-id="leaf-1"/>
  <ellipse cx="115" cy="160" rx="15" ry="8" fill="white" stroke="black" stroke-width="2" class="colorable" data-id="leaf-2"/>
  <circle cx="100" cy="100" r="15" fill="white" stroke="black" stroke-width="2" class="colorable" data-id="center"/>
  <circle cx="100" cy="70" r="18" fill="white" stroke="black" stroke-width="2" class="colorable" data-id="petal-1"/>
  <circle cx="130" cy="100" r="18" fill="white" stroke="black" stroke-width="2" class="colorable" data-id="petal-2"/>
  <circle cx="100" cy="130" r="18" fill="white" stroke="black" stroke-width="2" class="colorable" data-id="petal-3"/>
  <circle cx="70" cy="100" r="18" fill="white" stroke="black" stroke-width="2" class="colorable" data-id="petal-4"/>
  <circle cx="115" cy="77" r="18" fill="white" stroke="black" stroke-width="2" class="colorable" data-id="petal-5"/>
  <circle cx="115" cy="123" r="18" fill="white" stroke="black" stroke-width="2" class="colorable" data-id="petal-6"/>
  <circle cx="85" cy="77" r="18" fill="white" stroke="black" stroke-width="2" class="colorable" data-id="petal-7"/>
  <circle cx="85" cy="123" r="18" fill="white" stroke="black" stroke-width="2" class="colorable" data-id="petal-8"/>
</svg>
`,
  },
  {
    id: "heart",
    name: "Love Heart",
    icon: FaHeart,
    difficulty: "Easy",
    color: "text-pink-600",
    svg: `
<svg viewBox="0 0 200 200">
  <path d="M 100 160 C 100 160, 60 120, 60 90 C 60 70, 70 60, 85 60 C 95 60, 100 65, 100 65 C 100 65, 105 60, 115 60 C 130 60, 140 70, 140 90 C 140 120, 100 160, 100 160 Z"
        fill="white" stroke="black" stroke-width="3" class="colorable" data-id="main-heart"/>
  <circle cx="75" cy="85" r="5" fill="white" stroke="black" stroke-width="2" class="colorable" data-id="left-cheek"/>
  <circle cx="125" cy="85" r="5" fill="white" stroke="black" stroke-width="2" class="colorable" data-id="right-cheek"/>
</svg>
`,
  },
  {
    id: "sun",
    name: "Sunshine",
    icon: FaSun,
    difficulty: "Medium",
    color: "text-yellow-600",
    svg: `
<svg viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="35" fill="white" stroke="black" stroke-width="3" class="colorable" data-id="sun-core"/>
  ${[0, 45, 90, 135, 180, 225, 270, 315]
    .map((angle, index) => {
      const rad = (angle * Math.PI) / 180;
      const x1 = 100 + 45 * Math.cos(rad);
      const y1 = 100 + 45 * Math.sin(rad);
      const x2 = 100 + 70 * Math.cos(rad);
      const y2 = 100 + 70 * Math.sin(rad);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="black" stroke-width="3"/>`;
    })
    .join("")}
  <circle cx="85" cy="90" r="4" fill="black"/>
  <circle cx="115" cy="90" r="4" fill="black"/>
  <path d="M 85 110 Q 100 120 115 110" fill="none" stroke="black" stroke-width="2"/>
</svg>
`,
  },
];

const COLORS = [
  { hex: "#FF6B6B", name: "Red" },
  { hex: "#FFE66D", name: "Yellow" },
  { hex: "#4ECDC4", name: "Teal" },
  { hex: "#95E1D3", name: "Mint" },
  { hex: "#FF8B94", name: "Pink" },
  { hex: "#A8E6CF", name: "Green" },
  { hex: "#C7CEEA", name: "Purple" },
  { hex: "#FFA07A", name: "Orange" },
  { hex: "#DDA15E", name: "Brown" },
  { hex: "#87CEEB", name: "Sky Blue" },
];

/* -------------------------------------------------------
   MAIN COMPONENT
---------------------------------------------------------*/

const ColoringBook: React.FC<Props> = ({ onComplete, onBack }) => {
  const [selectedPage, setSelectedPage] = useState(COLORING_PAGES[0]);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [coloredAreas, setColoredAreas] = useState<Set<string>>(new Set());
  const [hasCompleted, setHasCompleted] = useState(false);

  const svgRef = useRef<HTMLDivElement>(null);

  /* Reset progress when switching pages */
  useEffect(() => {
    setColoredAreas(new Set());
    setHasCompleted(false);
  }, [selectedPage]);

  /* -------------------------------------------------------
     Handle Coloring
  ---------------------------------------------------------*/
  const handleSvgClick = (e: React.MouseEvent) => {
    const target = e.target as SVGElement;

    if (!target.classList.contains("colorable")) return;

    const elementId = target.dataset.id;
    if (!elementId) return;

    const currentFill = target.getAttribute("fill");

    // Apply selected color
    target.setAttribute("fill", currentColor.hex);

    // Register new colored area
    if (currentFill === "white") {
      setColoredAreas((prev) => {
        const updated = new Set(prev);
        updated.add(elementId);

        if (updated.size >= 5 && !hasCompleted) {
          setHasCompleted(true);

          setTimeout(() => {
            toast.success("Beautiful coloring! Sticker earned!", {
              icon: "✨",
              duration: 3000,
            });
            onComplete();
          }, 400);
        }

        return updated;
      });
    }
  };

  /* -------------------------------------------------------
     Reset Canvas
  ---------------------------------------------------------*/
  const resetColors = () => {
    if (!svgRef.current) return;

    const nodes = svgRef.current.querySelectorAll(".colorable");
    nodes.forEach((node) => node.setAttribute("fill", "white"));

    setColoredAreas(new Set());
    setHasCompleted(false);

    toast("Canvas cleared! Start fresh!", { icon: "🧹" });
  };

  const progress = Math.min((coloredAreas.size / 5) * 100, 100);

  /* -------------------------------------------------------
     RENDER
  ---------------------------------------------------------*/
  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-lg">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700"
          >
            <IoArrowBack className="text-xl" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <IoBookOutline className="text-3xl text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Coloring Book</h1>
          </div>

          <div className="w-20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-1 space-y-6">
            {/* PROGRESS */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-4">
                <IoSparkles className="text-3xl text-blue-600" />
                <div>
                  <h3 className="font-bold text-gray-800">Progress</h3>
                  <p className="text-sm text-gray-600">
                    {coloredAreas.size}/5 areas
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {coloredAreas.size >= 5 ? (
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <IoCheckmarkCircle className="text-xl" />
                  Completed!
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Color {5 - coloredAreas.size} more areas to earn a sticker.
                </p>
              )}
            </div>

            {/* PAGE SELECTOR */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <IoBookOutline className="text-2xl text-gray-700" />
                <h3 className="font-bold text-gray-800">Choose Page</h3>
              </div>

              <div className="space-y-3">
                {COLORING_PAGES.map((page) => {
                  const Icon = page.icon;
                  const selected = selectedPage.id === page.id;

                  return (
                    <button
                      key={page.id}
                      onClick={() => setSelectedPage(page)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition ${
                        selected
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className={`text-2xl ${page.color}`} />
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-800">
                          {page.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {page.difficulty}
                        </div>
                      </div>

                      {selected && (
                        <IoCheckmarkCircle className="text-blue-600 text-xl" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* COLOR PALETTE */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <IoColorPalette className="text-2xl text-gray-700" />
                <h3 className="font-bold text-gray-800">Colors</h3>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setCurrentColor(color)}
                    className={`rounded-lg aspect-square transition transform hover:scale-110 ${
                      currentColor.hex === color.hex
                        ? "ring-4 ring-blue-500 scale-110"
                        : "ring-2 ring-gray-200 hover:ring-gray-300"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>

              <div className="mt-3 text-center text-sm font-semibold text-gray-700">
                {currentColor.name}
              </div>
            </div>
          </div>

          {/* MAIN CANVAS */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <div
                ref={svgRef}
                onClick={handleSvgClick}
                className="max-w-xl mx-auto cursor-pointer select-none"
                dangerouslySetInnerHTML={{ __html: selectedPage.svg }}
              />

              {/* BUTTONS */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <button
                  onClick={resetColors}
                  className="bg-red-50 border-2 border-red-200 hover:bg-red-100 hover:border-red-300 text-red-600 px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <IoTrash className="text-xl" />
                  Clear
                </button>

                <button
                  onClick={() =>
                    toast.success("Masterpiece saved! (Coming soon)", {
                      icon: "💾",
                    })
                  }
                  className="bg-green-50 border-2 border-green-200 hover:bg-green-100 hover:border-green-300 text-green-600 px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <IoSave className="text-xl" />
                  Save
                </button>
              </div>
            </div>

            {/* TIPS */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
              <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                <IoSparkles className="text-xl" />
                Coloring Tips
              </h4>

              <ul className="space-y-2 text-sm text-yellow-800">
                <li>• Click shapes to fill them with color</li>
                <li>• Mix colors to create unique art</li>
                <li>• You can recolor any area anytime</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColoringBook;