'use client';
// ... Rest des existierenden Codes ... 

import { ResumeAnalysis } from '@/types/api';

interface ResumeAnalysisResultsProps {
  analysis: ResumeAnalysis;
}

export function ResumeAnalysisResults({ analysis }: ResumeAnalysisResultsProps) {
  return (
    <div className="mt-8 space-y-6">
      <div className="overflow-hidden bg-base-200 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-base-content">ATS-Score</h3>
          <div className="mt-2 max-w-xl text-sm text-base-content/80">
            <p>Gesamtbewertung: {analysis.ats_score.total_score}%</p>
            <ul className="mt-2 list-disc pl-5">
              <li>Keyword-Dichte: {analysis.ats_score.score_breakdown.keyword_density}%</li>
              <li>Skill-Übereinstimmung: {analysis.ats_score.score_breakdown.skill_alignment}%</li>
              <li>Format-Konformität: {analysis.ats_score.score_breakdown.format_compliance}%</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-base-200 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-base-content">Übereinstimmende Skills</h3>
          <div className="mt-2 max-w-xl text-sm text-base-content/80">
            <ul className="mt-2 list-disc pl-5">
              {analysis.match_score.matching_skills.map((skill: string, index: number) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-base-200 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-base-content">Fehlende Skills</h3>
          <div className="mt-2 max-w-xl text-sm text-base-content/80">
            <ul className="mt-2 list-disc pl-5">
              {analysis.match_score.missing_skills.map((skill: string, index: number) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-base-200 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-base-content">Verbesserungsvorschläge</h3>
          <div className="mt-2 max-w-xl text-sm text-base-content/80">
            <p className="mt-2">{analysis.improvement_suggestions.resume_suggestions}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-base-200 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-base-content">Zusammenfassung</h3>
          <div className="mt-2 max-w-xl text-sm text-base-content/80">
            <p className="mt-2">{analysis.summary}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 