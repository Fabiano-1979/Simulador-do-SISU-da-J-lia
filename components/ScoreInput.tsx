import React from 'react';

interface ScoreInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  icon?: React.ReactNode;
  colorClass: string;
}

export const ScoreInput: React.FC<ScoreInputProps> = ({ label, value, onChange, icon, colorClass }) => {
  return (
    <div className="relative group">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          {icon}
        </div>
        <input
          type="number"
          min="0"
          max="1000"
          className={`block w-full pl-10 pr-3 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-1 transition-all duration-200 shadow-sm border ${colorClass} text-lg font-medium bg-gray-800 text-white placeholder-gray-500`}
          placeholder="0"
          value={value === 0 ? '' : value}
          onChange={(e) => {
            let val = parseFloat(e.target.value);
            if (isNaN(val)) val = 0;
            if (val > 1000) val = 1000;
            if (val < 0) val = 0;
            onChange(val);
          }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1 text-right">0 a 1000 pontos</p>
    </div>
  );
};