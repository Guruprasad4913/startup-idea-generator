"use client";

import React, { useState } from "react";
import {
  MapPin,
  Globe2,
  TrendingUp,
  Award,
  ShieldCheck,
  DollarSign,
  Users,
  Compass,
  CheckCircle2,
  Building,
} from "lucide-react";
import { MapLocation } from "@/types";
import { GLOBAL_STARTUP_HUBS } from "@/lib/location-data";

interface MapLocationPickerProps {
  selectedLocation: MapLocation;
  onSelectLocation: (location: MapLocation) => void;
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  selectedLocation,
  onSelectLocation,
}) => {
  const [filterRegion, setFilterRegion] = useState<string>("All");
  const [hoveredHub, setHoveredHub] = useState<MapLocation | null>(null);

  const regions = ["All", "North America", "Europe", "Asia-Pacific", "Middle East", "Latin America"];

  const filteredHubs = filterRegion === "All"
    ? GLOBAL_STARTUP_HUBS
    : GLOBAL_STARTUP_HUBS.filter((h) => h.region === filterRegion);

  const [customCityInput, setCustomCityInput] = useState<string>("");

  const handleApplyCustomCity = () => {
    const trimmed = customCityInput.trim();
    if (!trimmed) return;

    // Check if matches existing hub
    const match = GLOBAL_STARTUP_HUBS.find(
      (h) => h.city.toLowerCase().includes(trimmed.toLowerCase()) || trimmed.toLowerCase().includes(h.city.toLowerCase())
    );

    if (match) {
      onSelectLocation(match);
      setCustomCityInput("");
      return;
    }

    // Create custom MapLocation
    const customLoc: MapLocation = {
      city: trimmed,
      country: "Global Target Territory",
      region: "Custom Region",
      lat: 20.0,
      lng: 0.0,
      ecosystemScore: 88,
      talentIndex: "8.9/10 Emerging & High-Skill",
      vcFundingClimate: "Active ($5B+ Regional Allocations)",
      regulatoryFriendliness: "Standard Innovation Framework",
      avgCustomerAcquisitionCost: "$120 - $240",
      keyHubs: [trimmed, `${trimmed} Tech Corridor`],
    };

    onSelectLocation(customLoc);
    setCustomCityInput("");
  };

  // Projection math to map lat/lng to an 800x400 SVG canvas (Equirectangular approximation)
  const getCoordinates = (lat: number, lng: number) => {
    const x = ((lng + 180) * (800 / 360));
    const y = ((90 - lat) * (400 / 180));
    return { x, y };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-indigo-400" />
          <span>Launch Geography & Target Startup Ecosystem</span>
        </label>
        <span className="text-xs text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-medium">
          Pinned: {selectedLocation.city}, {selectedLocation.country}
        </span>
      </div>

      {/* Region Filter Chips & Manual City Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 text-xs">
          {regions.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setFilterRegion(r)}
              className={`px-3 py-1 rounded-lg transition border text-[11px] font-medium ${
                filterRegion === r
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                  : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Manual City / Country Input */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="Type custom city (e.g. Mumbai, Tokyo, Austin)..."
            value={customCityInput}
            onChange={(e) => setCustomCityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApplyCustomCity();
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-56"
          />
          <button
            type="button"
            onClick={handleApplyCustomCity}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition border border-indigo-500 shadow-sm"
          >
            Apply City
          </button>
        </div>
      </div>

      {/* Interactive SVG World Map Container */}
      <div className="relative rounded-2xl bg-slate-950/90 border border-slate-800/80 overflow-hidden shadow-2xl">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#6366f1 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* SVG Canvas */}
        <div className="relative w-full aspect-[2/1] min-h-[220px] sm:min-h-[280px]">
          <svg viewBox="0 0 800 400" className="w-full h-full select-none">
            {/* Equator & Meridian grid lines */}
            <line x1="0" y1="200" x2="800" y2="200" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
            <line x1="400" y1="0" x2="400" y2="400" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
            <line x1="200" y1="0" x2="200" y2="400" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 4" />
            <line x1="600" y1="0" x2="600" y2="400" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 4" />

            {/* Stylized continent polygons for authentic global map feel */}
            {/* North America */}
            <path
              d="M120 70 L260 65 L290 100 L250 150 L200 180 L180 230 L160 210 L140 180 L100 140 Z"
              fill="#1e293b"
              opacity="0.6"
              className="transition hover:opacity-80"
            />
            {/* South America */}
            <path
              d="M210 220 L270 240 L285 300 L250 380 L220 370 L205 280 Z"
              fill="#1e293b"
              opacity="0.6"
              className="transition hover:opacity-80"
            />
            {/* Europe */}
            <path
              d="M370 70 L460 70 L480 120 L440 140 L380 140 L360 100 Z"
              fill="#1e293b"
              opacity="0.6"
              className="transition hover:opacity-80"
            />
            {/* Africa */}
            <path
              d="M380 150 L470 150 L490 220 L450 310 L410 320 L380 230 Z"
              fill="#1e293b"
              opacity="0.6"
              className="transition hover:opacity-80"
            />
            {/* Asia */}
            <path
              d="M480 60 L710 70 L720 160 L650 200 L560 220 L490 140 Z"
              fill="#1e293b"
              opacity="0.6"
              className="transition hover:opacity-80"
            />
            {/* Australia */}
            <path
              d="M640 270 L740 270 L730 340 L650 340 Z"
              fill="#1e293b"
              opacity="0.6"
              className="transition hover:opacity-80"
            />

            {/* Global Startup Hub Pins */}
            {GLOBAL_STARTUP_HUBS.map((hub) => {
              const { x, y } = getCoordinates(hub.lat, hub.lng);
              const isSelected = selectedLocation.city === hub.city;
              const isHovered = hoveredHub?.city === hub.city;

              return (
                <g
                  key={hub.city}
                  className="cursor-pointer transition-transform"
                  onClick={() => onSelectLocation(hub)}
                  onMouseEnter={() => setHoveredHub(hub)}
                  onMouseLeave={() => setHoveredHub(null)}
                >
                  {/* Selected Ripple Rings */}
                  {isSelected && (
                    <>
                      <circle
                        cx={x}
                        cy={y}
                        r="14"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="1.5"
                        opacity="0.5"
                        className="animate-ping"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="9"
                        fill="#6366f1"
                        opacity="0.3"
                      />
                    </>
                  )}

                  {/* Pin outer circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 6 : isHovered ? 5.5 : 4}
                    fill={isSelected ? "#10b981" : isHovered ? "#38bdf8" : "#818cf8"}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 1.5 : 0.8}
                    className="transition-all duration-200"
                  />

                  {/* City Label if selected or hovered */}
                  {(isSelected || isHovered) && (
                    <g transform={`translate(${x}, ${y - 12})`}>
                      <rect
                        x="-50"
                        y="-16"
                        width="100"
                        height="18"
                        rx="4"
                        fill="#0f172a"
                        stroke={isSelected ? "#10b981" : "#6366f1"}
                        strokeWidth="1"
                        opacity="0.95"
                      />
                      <text
                        x="0"
                        y="-4"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {hub.city.split("/")[0].trim()}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floating Instruction overlay */}
          <div className="absolute top-2 left-3 pointer-events-none text-[10px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800">
            Interactive Global Map — Click any hub pin to target
          </div>
        </div>

        {/* City Quick-Select Row */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            Top Hubs:
          </span>
          <div className="flex items-center gap-1.5">
            {filteredHubs.map((hub) => {
              const isSelected = selectedLocation.city === hub.city;
              return (
                <button
                  key={hub.city}
                  type="button"
                  onClick={() => onSelectLocation(hub)}
                  className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition flex items-center gap-1.5 border ${
                    isSelected
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-semibold"
                      : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isSelected ? "text-emerald-400" : "text-slate-500"}`} />
                  <span>{hub.city.split("/")[0].trim()}</span>
                  {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Regional Ecosystem Intelligence Cards */}
      <div className="p-4 rounded-2xl glass-panel border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-slate-900/90 to-indigo-950/20 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
              {selectedLocation.ecosystemScore}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{selectedLocation.city}, {selectedLocation.country}</span>
                <span className="text-[10px] text-slate-400 font-normal">({selectedLocation.region})</span>
              </h4>
              <p className="text-[11px] text-emerald-400 font-medium">
                Ranked Tier-1 Startup Hub · Ecosystem Score {selectedLocation.ecosystemScore}/100
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Key Corridors:</span>
            <span className="text-slate-200 font-medium text-[11px]">
              {selectedLocation.keyHubs.slice(0, 2).join(" · ")}
            </span>
          </div>
        </div>

        {/* 4 Ecosystem Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Users className="w-3 h-3 text-cyan-400" /> Tech Talent Index
            </span>
            <div className="text-xs font-bold text-white">{selectedLocation.talentIndex}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-indigo-400" /> Early-Stage VC
            </span>
            <div className="text-xs font-bold text-indigo-300 truncate">{selectedLocation.vcFundingClimate}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Regulatory Climate
            </span>
            <div className="text-xs font-bold text-emerald-300 truncate">{selectedLocation.regulatoryFriendliness}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-amber-400" /> Regional CAC Range
            </span>
            <div className="text-xs font-bold text-amber-300">{selectedLocation.avgCustomerAcquisitionCost}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
