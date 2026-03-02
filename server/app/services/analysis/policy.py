from typing import Dict, Any, List
import os
import json
from groq import Groq

def generate_recommendations(
    default_rate: float,
    cascade_depth: int,
    centrality: Dict[int, float],
    risk_concentration: Dict[int, float],
    stability_score: float
) -> List[Dict[str, Any]]:
    recommendations = []

    if default_rate > 0.20:
        recommendations.append({
            "title": "Emergency Buffer Increase",
            "impact_score": min(10, round(default_rate * 15, 1)),
            "explanation": (
                f"Default rate is {default_rate*100:.1f}%, exceeding the 20% threshold. "
                "Recommend mandating minimum emergency reserves of 3x monthly expenses "
                "for all members to absorb income shocks."
            )
        })

    if centrality:
        max_centrality = max(centrality.values())
        avg_centrality = sum(centrality.values()) / len(centrality)
        if max_centrality > 2 * avg_centrality and max_centrality > 0.3:
            central_node = max(centrality, key=centrality.get)
            recommendations.append({
                "title": "Exposure Cap on Central Nodes",
                "impact_score": round(max_centrality * 10, 1),
                "explanation": (
                    f"Member {central_node} has centrality {max_centrality:.2f}, "
                    f"which is {max_centrality/max(avg_centrality, 0.01):.1f}x the average. "
                    "Cap single-node exposure to 15% of total community exposure to "
                    "reduce single-point-of-failure risk."
                )
            })

    if cascade_depth > 2:
        recommendations.append({
            "title": "Diversification Mandate",
            "impact_score": min(10, cascade_depth * 2),
            "explanation": (
                f"Cascade depth reached {cascade_depth} levels. "
                "Recommend limiting chain lending (A->B->C->D) to a maximum depth of 2. "
                "Encourage members to diversify lending across unconnected borrowers."
            )
        })

    if risk_concentration:
        high_risk_nodes = [n for n, r in risk_concentration.items() if r > 0.7]
        if len(high_risk_nodes) > len(risk_concentration) * 0.3:
            recommendations.append({
                "title": "Risk Redistribution",
                "impact_score": 7.0,
                "explanation": (
                    f"{len(high_risk_nodes)} members ({len(high_risk_nodes)/len(risk_concentration)*100:.0f}%) "
                    "have risk concentration above 70%. Recommend establishing a community "
                    "mutual insurance pool funded by 2% of monthly income from each member."
                )
            })

    if stability_score < 50:
        recommendations.append({
            "title": "Community Stability Alert",
            "impact_score": 9.0,
            "explanation": (
                f"Overall stability score is {stability_score:.1f}/100, indicating systemic fragility. "
                "Recommend immediate moratorium on new lending until reserves are rebuilt, "
                "combined with income-support programs for distressed members."
            )
        })

    if not recommendations:
        recommendations.append({
            "title": "Community is Stable",
            "impact_score": 0.0,
            "explanation": "No significant risks detected. Continue monitoring."
        })

    recommendations.sort(key=lambda x: x["impact_score"], reverse=True)

    # AI Enhancement with Groq
    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key:
        try:
            client = Groq(api_key=groq_api_key)
            prompt = f"""
You are an expert community financial risk analyst.
Review the following community metrics and rule-based recommendations.
Metrics:
- Default Rate: {default_rate:.2f}
- Cascade Depth: {cascade_depth}
- Stability Score: {stability_score:.2f}

Rule-based Recommendations:
{json.dumps(recommendations, indent=2)}

Provide exactly 3 high-level strategic policy recommendations based on this data.
Format your response strictly as a JSON object with a single key "recommendations" containing an array of objects.
Each object must have:
- "title" (string): A short, impactful title
- "impact_score" (float): A number between 0.0 and 10.0 representing the impact of this rule
- "explanation" (string): A detailed 1-2 sentence explanation
"""
            response = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"},
                temperature=0.7
            )
            content = response.choices[0].message.content
            if content:
                ai_data = json.loads(content)
                if "recommendations" in ai_data and isinstance(ai_data["recommendations"], list):
                    recommendations = ai_data["recommendations"]
                    recommendations.sort(key=lambda x: x.get("impact_score", 0), reverse=True)
        except Exception as e:
            print(f"Groq AI enhancement failed: {e}")

    # Ensure exactly 3 recommendations are returned
    default_recs = [
        {
            "title": "Continuous Monitoring",
            "impact_score": 3.0,
            "explanation": "Regularly review community metrics to catch early signs of liquidity stress before they manifest."
        },
        {
            "title": "Financial Literacy",
            "impact_score": 4.0,
            "explanation": "Host financial workshops to help members manage emergency reserves and limit unnecessary borrowing."
        },
        {
            "title": "Diversification Strategy",
            "impact_score": 5.0,
            "explanation": "Encourage lenders to distribute their exposure across multiple borrowers to mitigate individual risk."
        }
    ]

    # Remove the generic "Community is Stable" if we are going to pad with better defaults
    recommendations = [r for r in recommendations if r["title"] != "Community is Stable"]

    # Pad with defaults if less than 3
    if len(recommendations) < 3:
        for rec in default_recs:
            if len(recommendations) >= 3:
                break
            if not any(r["title"] == rec["title"] for r in recommendations):
                recommendations.append(rec)

    # Sort again and slice to exactly 3
    recommendations.sort(key=lambda x: x.get("impact_score", 0), reverse=True)
    return recommendations[:3]
