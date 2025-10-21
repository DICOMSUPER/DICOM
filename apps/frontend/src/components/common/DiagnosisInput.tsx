"use client";
import axios from "axios";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

export default function DiagnosisInput({
  state,
  setState,
  className,
  style,
}: {
  state: string;
  setState: Dispatch<SetStateAction<string>>;
  className?: string;
  style?: object;
}) {
  const [suggestions, setSuggestions] = useState<string[][]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [total, setTotal] = useState(0);
  const [queryTime, setQueryTime] = useState(0);
  const [bytes, setBytes] = useState(0);
  const [maxList, setMaxList] = useState<number | undefined>(undefined);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSuggestion = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    let url = `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(
      state
    )}`;
    if (maxList !== undefined) {
      url += `&maxList=${maxList}`;
    }

    try {
      const start = Date.now();
      const res = await axios.get(url, {
        signal: abortControllerRef.current.signal,
      });
      const end = Date.now();
      setQueryTime(end - start);
      setBytes(parseInt(res.headers["content-length"]) || 0);
      setTotal(res.data[0] || 0);
      setSuggestions(res.data[3] || []);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error(error);
        setSuggestions([]);
        setTotal(0);
        setQueryTime(0);
        setBytes(0);
      }
    }
  };

  useEffect(() => {
    if (state.trim() === "") {
      setSuggestions([]);
      setShowDropdown(false);
      setTotal(0);
      setQueryTime(0);
      setBytes(0);
      return;
    }
    fetchSuggestion();
  }, [state, maxList]);

  useEffect(() => {
    setShowDropdown(suggestions.length > 0);
  }, [suggestions]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={state}
        onChange={(e) => setState(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setShowDropdown(true);
        }}
        onBlur={(e) => {
          // Use setTimeout to allow onClick to fire first
          setTimeout(() => setShowDropdown(false), 150);
        }}
        className={className ? className : ""}
        style={style ? style : {}}
        placeholder="Code or name"
      />
      {showDropdown && suggestions.length > 0 && (
        <div
          className="absolute top-full left-0 z-10 bg-white border border-gray-300 max-h-52 overflow-y-auto text-sm"
          style={{
            width: inputRef.current
              ? `${inputRef.current.clientWidth}px`
              : "auto",
          }}
        >
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-gray-300 p-1 text-left">Code</th>
                <th className="border-b border-gray-300 p-1 text-left">Name</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((sug, idx) => (
                <tr
                  key={idx}
                  onClick={() => {
                    setState(`${sug[0]} - ${sug[1]}`);
                    setShowDropdown(false);
                  }}
                  className="cursor-pointer border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="p-0.5">{sug[0]}</td>
                  <td className="p-0.5">{sug[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {suggestions.length < total && (
            <div
              className="p-1 text-blue-600 underline cursor-pointer"
              onClick={() => setMaxList(total)}
            >
              See more items. (Ctl Ret)
            </div>
          )}
          <div className="p-1 text-xs text-gray-500">
            {total} total; {bytes} bytes in {queryTime} ms
          </div>
        </div>
      )}
    </div>
  );
}
