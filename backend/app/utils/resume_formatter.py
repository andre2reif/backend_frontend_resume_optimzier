def simplify_optimized_resume(resume: dict) -> str:
    lines = []

    # 1. Summary
    summary = resume.get("summary", {})
    if summary:
        lines.append("== SUMMARY ==")
        lines.append(summary.get("experience", ""))
        lines.extend(summary.get("key_aspects", []))

    # 2. Personal Statement
    if resume.get("personal_statement"):
        lines.append("\n== PERSONAL STATEMENT ==")
        lines.append(resume["personal_statement"])

    # 3. Career
    if resume.get("career"):
        lines.append("\n== CAREER ==")
        for job in resume["career"]:
            lines.append(f"\n→ {job.get('position')} @ {job.get('company')} ({job.get('time_period')})")
            for t in job.get("tasks", []):
                lines.append(f"- {t}")
            for a in job.get("achievements", []):
                lines.append(f"✓ {a}")

    # 4. Key Skills
    if resume.get("key_skills"):
        lines.append("\n== KEY SKILLS ==")
        for group in resume["key_skills"].get("items", []):
            lines.append(f"{group.get('category')}:")
            for skill in group.get("skills", []):
                lines.append(f"- {skill}")

    # 5. Education
    if resume.get("education"):
        lines.append("\n== EDUCATION ==")
        for item in resume["education"].get("items", []):
            lines.append(f"- {item}")

    # 6. Languages
    if resume.get("languages"):
        lines.append("\n== LANGUAGES ==")
        for item in resume["languages"].get("items", []):
            lines.append(f"- {item}")

    # 7. Optionals (falls vorhanden)
    if resume.get("optionals"):
        lines.append("\n== OPTIONALE BEREICHE ==")
        for section in resume["optionals"]:
            lines.append(f"\n-- {section.get('title')} --")
            for item in section.get("items", []):
                lines.append(f"- {item}")

    return "\n".join(line for line in lines if line.strip())
