declare module "react-cytoscapejs" {
    import cytoscape from "cytoscape";
    import React from "react";
    interface CytoscapeComponentProps {
        elements: cytoscape.ElementDefinition[];
        style?: React.CSSProperties;
        stylesheet?: any[];
        layout?: any;
        cy?: (cy: cytoscape.Core) => void;
        [key: string]: any;
    }
    const CytoscapeComponent: React.FC<CytoscapeComponentProps>;
    export default CytoscapeComponent;
}
