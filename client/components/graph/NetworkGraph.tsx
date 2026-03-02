"use client";

import React, { useEffect, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";

interface NetworkGraphProps {
    members: any[];
    exposures: any[];
    onNodeClick?: (memberId: number) => void;
    height?: string;
}

const stylesheet = [
    {
        selector: "node",
        style: {
            label: "data(label)",
            color: "#e2e8f0",
            "font-family": "Nunito, sans-serif",
            "font-weight": "bold",
            "font-size": "11px",
            "text-valign": "center",
            "text-halign": "center",
            "text-outline-width": 2,
            "text-outline-color": "#0f172a",
            width: "data(size)",
            height: "data(size)",
            "border-width": 2,
            "border-color": "#0f172a",
            "background-color": "data(color)",
        } as any,
    },
    {
        selector: "edge",
        style: {
            width: 2,
            "line-color": "#334155",
            "target-arrow-color": "#475569",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "arrow-scale": 1,
            opacity: 0.5,
        } as any,
    },
    {
        selector: ".distressed",
        style: {
            "background-color": "#ef4444",
            "border-color": "#b91c1c",
            "border-width": 3,
        } as any,
    },
];

function getNodeColor(riskScore: number): string {
    // Cytoscape does not parse CSS variables directly here.
    // Values derived from globals.css Duolingo palette (true Green/Yellow/Red)
    if (riskScore > 0.6) return "#ff4b4b"; // --color-red-500
    if (riskScore > 0.3) return "#ffc800"; // --color-yellow-500
    return "#58cc02"; // --color-green-500
}

export default function NetworkGraph({ members, exposures, onNodeClick, height = "500px" }: NetworkGraphProps) {
    const cyRef = useRef<cytoscape.Core | null>(null);

    const elements: cytoscape.ElementDefinition[] = [
        ...members.map((m) => {
            const baseSize = 30;
            const bonus = Math.min(20, (m.emergency_reserve / (m.monthly_expenses || 1)) * 4);
            return {
                data: {
                    id: m.id.toString(),
                    label: m.name.split(" ")[0],
                    size: baseSize + bonus,
                    color: getNodeColor(m.risk_score || 0),
                },
            };
        }),
        ...exposures.map((e) => ({
            data: {
                id: `edge_${e.id}`,
                source: e.borrower_id.toString(),
                target: e.lender_id.toString(),
                amount: e.exposure_amount,
            },
        })),
    ];

    const layout = {
        name: "cose",
        idealEdgeLength: 120,
        nodeOverlap: 20,
        fit: true,
        padding: 30,
        randomize: false,
        nodeRepulsion: 500000,
        edgeElasticity: 80,
        gravity: 60,
        numIter: 1000,
        animate: true,
        animationDuration: 800,
    };

    useEffect(() => {
        return () => {
            if (cyRef.current) {
                cyRef.current.destroy();
                cyRef.current = null;
            }
        };
    }, []);

    return (
        <div className="w-full rounded-xl overflow-hidden border border-slate-700/50" style={{ height }}>
            <CytoscapeComponent
                elements={elements}
                style={{ width: "100%", height: "100%", background: "#0f172a" }}
                stylesheet={stylesheet}
                layout={layout}
                cy={(cy) => {
                    if (cyRef.current !== cy) {
                        cyRef.current = cy;
                        cy.on("tap", "node", (evt) => {
                            if (onNodeClick) {
                                onNodeClick(parseInt(evt.target.data().id));
                            }
                        });
                    }
                }}
            />
        </div>
    );
}
