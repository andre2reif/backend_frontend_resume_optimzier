# 🧮 Match Score Berechnungslogik – gemeinsam für alle Sprachen

def match_score_logic():
    return '''
        Berechne den Match-Score nach folgender Formel:

        - matching_skills_ratio = len(matching_skills) / (len(matching_skills) + len(missing_skills))
        - additional_keywords_ratio = min(len(additional_keywords) / 10, 1)
        - penalty_for_missing_skills = 1 - min(len(missing_skills) / 10, 1)

        Dann:
        total_score = round((matching_skills_ratio × 0.6 +
                            additional_keywords_ratio × 0.2 +
                            penalty_for_missing_skills × 0.2) × 100)
        '''