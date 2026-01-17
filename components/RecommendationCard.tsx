import React from 'react';
import { CourseRecommendation, ChanceLevel } from '../types';

interface Props {
  data: CourseRecommendation;
}

export const RecommendationCard: React.FC<Props> = ({ data }) => {
  
  const getBadgeColor = (chance: ChanceLevel) => {
    switch (chance) {
      case ChanceLevel.MUITO_ALTA: return "bg-green-100 text-green-800 border-green-200";
      case ChanceLevel.ALTA: return "bg-blue-100 text-blue-800 border-blue-200";
      case ChanceLevel.MEDIA: return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case ChanceLevel.BAIXA: return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressWidth = (chance: ChanceLevel) => {
    switch (chance) {
      case ChanceLevel.MUITO_ALTA: return "95%";
      case ChanceLevel.ALTA: return "75%";
      case ChanceLevel.MEDIA: return "50%";
      case ChanceLevel.BAIXA: return "25%";
      default: return "0%";
    }
  };

  const getProgressColor = (chance: ChanceLevel) => {
    switch (chance) {
      case ChanceLevel.MUITO_ALTA: return "bg-green-500";
      case ChanceLevel.ALTA: return "bg-blue-500";
      case ChanceLevel.MEDIA: return "bg-yellow-500";
      case ChanceLevel.BAIXA: return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-300 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900 leading-tight serif mb-1">{data.course}</h3>
        <p className="text-sm font-semibold text-blue-900 uppercase tracking-wide">{data.university}</p>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          {data.location}
          <span className="mx-1">•</span>
          <span>{data.shift}</span>
        </div>
      </div>

      <div className="w-full sm:w-48 flex flex-col gap-2">
        <div className={`px-3 py-1 rounded-full text-xs font-bold border text-center uppercase tracking-wider ${getBadgeColor(data.chance)}`}>
          Chance: {data.chance}
        </div>
        
        <div className="flex justify-between items-end">
             <span className="text-xs text-gray-500">Nota de Corte</span>
             <span className="text-lg font-bold text-gray-800">{data.cutoffEstimate}</span>
        </div>
        
        {/* Visual Probability Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getProgressColor(data.chance)}`} 
            style={{ width: getProgressWidth(data.chance) }}
          ></div>
        </div>
      </div>
    </div>
  );
};
