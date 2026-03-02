"use client";

import React, { useEffect, useRef, useState } from "react";
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
            color: "#ffffff",
            "font-family": "Nunito, sans-serif",
            "font-weight": "800",
            "font-size": "14px",
            "text-valign": "center",
            "text-halign": "center",
            "text-outline-width": 3,
            "text-outline-color": "data(borderColor)",
            width: "data(size)",
            height: "data(size)",
            "border-width": 4,
            "border-color": "data(borderColor)",
            "background-color": "data(color)",
            "transition-property": "background-color, border-color, border-width",
            "transition-duration": "0.3s",
        } as any,
    },
    {
        selector: "node:hover",
        style: {
            "border-width": 6,
            "z-index": 999,
        } as any,
    },
    {
        selector: "edge",
        style: {
            width: "data(width)",
            "line-color": "data(color)",
            "target-arrow-color": "data(color)",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "arrow-scale": 1.5,
            opacity: 0.6,
            "transition-property": "line-color, width, opacity",
            "transition-duration": "0.3s",
        } as any,
    },
    {
        selector: "edge:hover",
        style: {
            opacity: 1,
            width: "data(hoverWidth)",
            "z-index": 998,
        } as any,
    },
    {
        selector: ".highlighted",
        style: {
            "border-width": 6,
            "z-index": 999,
        } as any,
    },
    {
        selector: ".dimmed",
        style: {
            opacity: 0.2,
        } as any,
    },
    {
        selector: ".distressed",
        style: {
            "background-color": "#ef4444",
            "border-color": "#b91c1c",
            "border-width": 5,
        } as any,
    },
];

function getNodeColor(riskScore: number): string {
    if (riskScore > 0.6) return "#ef4444"; // High risk - red
    if (riskScore > 0.3) return "#fbbf24"; // Medium risk - amber
    return "#10b981"; // Low risk - green
}

function getNodeBorderColor(riskScore: number): string {
    if (riskScore > 0.6) return "#991b1b"; // Dark red
    if (riskScore > 0.3) return "#b45309"; // Dark amber
    return "#047857"; // Dark green
}

function getEdgeColor(amount: number, maxAmount: number): string {
    const intensity = amount / maxAmount;
    if (intensity > 0.7) return "#dc2626"; // High exposure - red
    if (intensity > 0.4) return "#f59e0b"; // Medium exposure - amber
    return "#6366f1"; // Low exposure - indigo
}

export default function NetworkGraph({ members, exposures, onNodeClick, height = "500px" }: NetworkGraphProps) {
    const cyRef = useRef<cytoscape.Core | null>(null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    // Calculate max exposure for edge coloring
    const maxExposure = Math.max(...exposures.map(e => e.exposure_amount), 1);

    const elements: cytoscape.ElementDefinition[] = [
        ...members.map((m) => {
            const baseSize = 40;
            const reserveRatio = m.emergency_reserve / (m.monthly_expenses || 1);
            const bonus = Math.min(30, reserveRatio * 8);
            const riskScore = m.risk_score || 0;
            
            return {
                data: {
                    id: m.id.toString(),
                    label: m.name.split(" ")[0],
                    size: baseSize + bonus,
                    color: getNodeColor(riskScore),
                    borderColor: getNodeBorderColor(riskScore),
                    fullName: m.name,
                    reserve: m.emergency_reserve,
                    income: m.monthly_income,
                },
            };
        }),
        ...exposures.map((e) => {
            const edgeWidth = 2 + (e.exposure_amount / maxExposure) * 6;
            return {
                data: {
                    id: `edge_${e.id}`,
                    source: e.borrower_id.toString(),
                    target: e.lender_id.toString(),
                    amount: e.exposure_amount,
                    width: edgeWidth,
                    hoverWidth: edgeWidth + 2,
                    color: getEdgeColor(e.exposure_amount, maxExposure),
                },
            };
        }),
    ];

    const layout = {
        name: "cose",
        idealEdgeLength: 200,
        nodeOverlap: 50,
        fit: true,
        padding: 60,
        randomize: false,
        nodeRepulsion: 1200000,
        edgeElasticity: 100,
        gravity: 50,
        numIter: 1500,
        animate: true,
        animationDuration: 1000,
        animationEasing: "ease-out",
    };

    useEffect(() => {
        if (cyRef.current) {
            // Add hover effects
            cyRef.current.on("mouseover", "node", (evt) => {
                const node = evt.target;
                const nodeId = node.id();
                setHoveredNode(nodeId);
                
                // Highlight connected nodes and edges
                const connectedEdges = node.connectedEdges();
                const connectedNodes = connectedEdges.connectedNodes();
                
                cyRef.current?.elements().addClass("dimmed");
                node.removeClass("dimmed").addClass("highlighted");
                connectedNodes.removeClass("dimmed").addClass("highlighted");
                connectedEdges.removeClass("dimmed");
            });

            cyRef.current.on("mouseout", "node", () => {
                setHoveredNode(null);
                cyRef.current?.elements().removeClass("dimmed highlighted");
            });

            cyRef.current.on("tap", "node", (evt) => {
                if (onNodeClick) {
                    onNodeClick(parseInt(evt.target.data().id));
                }
            });
        }

        return () => {
            if (cyRef.current) {
                cyRef.current.destroy();
                cyRef.current = null;
            }
        };
    }, [onNodeClick]);

    return (
        <div className="relative w-full rounded-xl overflow-hidden" style={{ height }}>
            <div className="absolute top-4 left-4 z-10 bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border-2 border-slate-700">
                <div className="flex items-center gap-4 text-xs font-bold">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#10b981] border-2 border-[#047857]"></div>
                        <span className="text-gray-200">Low Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#fbbf24] border-2 border-[#b45309]"></div>
                        <span className="text-gray-200">Medium Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#ef4444] border-2 border-[#991b1b]"></div>
                        <span className="text-gray-200">High Risk</span>
                    </div>
                </div>
            </div>
            
            {hoveredNode && cyRef.current && (
                <div className="absolute top-4 right-4 z-10 bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-lg p-4 border-2 border-slate-700 min-w-[200px]">
                    <div className="space-y-2">
                        <h3 className="font-extrabold text-gray-100 text-base">
                            {cyRef.current.$id(hoveredNode).data("fullName")}
                        </h3>
                        <div className="text-xs font-bold text-gray-300 space-y-1">
                            <div className="flex justify-between">
                                <span>Reserve:</span>
                                <span className="text-gray-100">
                                    ${cyRef.current.$id(hoveredNode).data("reserve")?.toFixed(0)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Income:</span>
                                <span className="text-gray-100">
                                    ${cyRef.current.$id(hoveredNode).data("income")?.toFixed(0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <CytoscapeComponent
                elements={elements}
                style={{ 
                    width: "100%", 
                    height: "100%", 
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)"
                }}
                stylesheet={stylesheet}
                layout={layout}
                cy={(cy) => {
                    if (cyRef.current !== cy) {
                        cyRef.current = cy;
                        // Zoom in after layout completes
                        cy.on('layoutstop', () => {
                            const currentZoom = cy.zoom();
                            cy.zoom(currentZoom * 1.4);
                            cy.center();
                        });
                    }
                }}
            />
        </div>
    );
}
