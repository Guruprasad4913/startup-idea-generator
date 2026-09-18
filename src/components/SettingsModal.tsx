"use client";

import React, { useState, useEffect } from "react";
import { X, Key, Cpu, Cloud, Check, ExternalLink, ShieldCheck, Database, RefreshCw, Globe } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  tavilyApiKey?: string;
  onSaveTavilyApiKey?: (key: string) => void;
  cloudPreference: string;
  onSaveCloudPreference: (pref: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  tavilyApiKey = "",
  onSaveTavilyApiKey,
  cloudPreference,
  onSaveCloudPreference,
}) => {
  const [localKey, setLocalKey] = useState(apiKey);
  const [localTavilyKey, setLocalTavilyKey] = useState(tavilyApiKey);
  const [localCloud, setLocalCloud] = useState(cloudPreference);
  const [savedStatus, setSavedStatus] = useState(false);

  // Tavily test connection state
  const [isTestingTavily, setIsTestingTavily] = useState(false);
  const [tavilyTestResult, setTavilyTestResult] = useState<{
    tested: boolean;
    ok: boolean;
    message: string;
    latencyMs?: number;
  }>({ tested: false, ok: false, message: "" });

  // MongoDB connection state
  const [mongoUri, setMongoUri] = useState("");
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{
    tested: boolean;
    ok: boolean;
    message: string;
    latencyMs?: number;
  }>({ tested: false, ok: false, message: "" });

  useEffect(() => {
    setLocalKey(apiKey);
    setLocalTavilyKey(tavilyApiKey);
    setLocalCloud(cloudPreference);
    if (typeof window !== "undefined") {
      const savedUri = localStorage.getItem("startupgen_mongodb_uri") || "";
      setMongoUri(savedUri);
      const savedTavily = localStorage.getItem("startupgen_tavily_key") || "";
      if (savedTavily && !tavilyApiKey) {
        setLocalTavilyKey(savedTavily);
      }
    }
  }, [apiKey, tavilyApiKey, cloudPreference, isOpen]);

  if (!isOpen) return null;

  const handleTestTavily = async () => {
    setIsTestingTavily(true);
    setTavilyTestResult({ tested: false, ok: false, message: "" });
    try {
      const res = await fetch("/api/test-tavily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: localTavilyKey.trim() }),
      });
      const data = await res.json();
      setTavilyTestResult({
        tested: true,
        ok: !!data.ok,
        message: data.message || (data.ok ? "Connected to Tavily" : "Connection failed"),
        latencyMs: data.latencyMs,
      });
    } catch (err: any) {
      setTavilyTestResult({
        tested: true,
        ok: false,
        message: err?.message || "Failed to reach test-tavily endpoint",
      });
    } finally {
      setIsTestingTavily(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingDb(true);
    setDbTestResult({ tested: false, ok: false, message: "" });
    try {
      const res = await fetch("/api/db-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uri: mongoUri.trim() || undefined }),
      });
      const data = await res.json();
      setDbTestResult({
        tested: true,
        ok: !!data.ok,
        message: data.message || (data.ok ? "Connected to MongoDB" : "Connection failed"),
        latencyMs: data.latencyMs,
      });
    } catch (err: any) {
      setDbTestResult({
        tested: true,
        ok: false,
        message: err?.message || "Failed to reach MongoDB test endpoint",
      });
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleSave = () => {
    onSaveApiKey(localKey.trim());
    if (onSaveTavilyApiKey) {
      onSaveTavilyApiKey(localTavilyKey.trim());
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("startupgen_tavily_key", localTavilyKey.trim());
    }
    onSaveCloudPreference(localCloud);
    if (typeof window !== "undefined") {
      localStorage.setItem("startupgen_mongodb_uri", mongoUri.trim());
    }
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-cyan-500" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Platform &amp; API Settings</h2>
              <p className="text-xs text-slate-400">Configure your AI engine, market research APIs, and cloud preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* Dual AI Engine Notice */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-300 font-medium">Built-in Neural Engine Active:</strong> You don&apos;t need to provide an API key to validate concepts. The platform includes a comprehensive domain intelligence engine. Optionally enter Gemini or Tavily keys for live dynamic web queries.
            </div>
          </div>

          {/* Gemini API Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Google Gemini API Key (Optional)
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
              >
                Get Free Gemini Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="AIzaSy... (Leave empty to use built-in smart generator)"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Keys are stored strictly in your browser&apos;s local storage and never exposed publicly.
            </p>
          </div>

          {/* Tavily Search API Key (Market Research) */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400" />
                Tavily Search API Key (Market Analysis)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestTavily}
                  disabled={isTestingTavily || !localTavilyKey.trim()}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 font-semibold disabled:opacity-40 cursor-pointer"
                >
                  {isTestingTavily ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" /> Testing...
                    </>
                  ) : (
                    <>
                      <Check className="w-3 h-3" /> Test Tavily API
                    </>
                  )}
                </button>
                <a
                  href="https://tavily.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  Get 1,000 Free Searches <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <input
              type="password"
              placeholder="tvly-... (Enables live web TAM/SAM market research & real competitor discovery)"
              value={localTavilyKey}
              onChange={(e) => setLocalTavilyKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-mono"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Powers real-time market sizing, verified industry reports, and live competitor URLs across all tech &amp; non-tech sectors.
            </p>

            {/* Tavily Test Result Banner */}
            {tavilyTestResult.tested && (
              <div
                className={`mt-2.5 p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                  tavilyTestResult.ok
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : "bg-amber-950/30 border-amber-500/30 text-amber-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      tavilyTestResult.ok ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    }`}
                  />
                  <span>{tavilyTestResult.message}</span>
                </div>
                {tavilyTestResult.latencyMs && (
                  <span className="font-mono text-[10px] opacity-75">{tavilyTestResult.latencyMs}ms</span>
                )}
              </div>
            )}
          </div>

          {/* MongoDB Database Connection */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                MongoDB Connection String
              </label>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingDb}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 font-semibold disabled:opacity-50"
              >
                {isTestingDb ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" /> Testing...
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3" /> Test Connection
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              placeholder="mongodb://127.0.0.1:27017/startupgen (or MongoDB Atlas URI)"
              value={mongoUri}
              onChange={(e) => setMongoUri(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono text-xs"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Persists all validation reports, market signals, and business roadmaps directly into your MongoDB cluster.
            </p>

            {/* Test result banner */}
            {dbTestResult.tested && (
              <div
                className={`mt-2.5 p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                  dbTestResult.ok
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : "bg-amber-950/30 border-amber-500/30 text-amber-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      dbTestResult.ok ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    }`}
                  />
                  <span>{dbTestResult.message}</span>
                </div>
                {dbTestResult.latencyMs !== undefined && (
                  <span className="font-mono text-[10px] text-slate-400">
                    {dbTestResult.latencyMs}ms
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Cloud Provider Preference */}
          <div className="pt-2 border-t border-slate-800">
            <label className="text-sm font-medium text-slate-200 flex items-center gap-1.5 mb-2.5">
              <Cloud className="w-4 h-4 text-cyan-400" />
              Preferred Cloud Ecosystem Blueprint
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: "AWS", name: "Amazon Web Services", desc: "Lambda, Aurora, S3" },
                { id: "GCP", name: "Google Cloud", desc: "Cloud Run, BigQuery" },
                { id: "Azure", name: "Microsoft Azure", desc: "Functions, CosmosDB" },
              ].map((prov) => (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() => setLocalCloud(prov.id)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    localCloud === prov.id
                      ? "bg-indigo-950/40 border-indigo-500 text-white shadow-sm shadow-indigo-500/20"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-200">{prov.id}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{prov.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-7 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
          >
            {savedStatus ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
