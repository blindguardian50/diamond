import * as d3 from "d3";

interface PathTreeGeneratorOptions {
    radius?: number;
    angle?: number;
    data: any;
    margin?: {
        top: number,
        right: number,
        bottom: number,
        left: number
    };
    circleRadius?: number;
    circleStroke?: number;
}

export default class PathTreeGenerator {
    private radius = 0;
    private angle = 0;
    private data: any;
    private maxClicks = 0;
    private margin = {top: 0, right: 0, bottom: 0, left: 0};
    private circleRadius = 0;
    private circleStroke = 0;
    private root: d3.HierarchyNode<any>;
    private clusterLayout: d3.HierarchyPointNode<unknown>;
    private boundary: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    // private PathTreeComponentRef:
    private enteredNodes: d3.Selection<SVGGElement, d3.HierarchyNode<any>, SVGGElement, unknown>;
    constructor(options: PathTreeGeneratorOptions) {
        const {radius = 450, angle = 360, data, circleRadius = 7, circleStroke = 1,
            margin = {top: 20, left: 30, bottom: 20, right: 100}} = options;
        this.radius = radius;
        this.angle = angle;
        this.data = data;
        this.margin = margin;
        this.circleRadius = circleRadius;
        this.circleStroke = circleStroke;
        this.maxClicks = Math.max(...data.children.map(child => child.clicks));
        this.createHierarchy();
    }

    private retrieveBoundaries() {
        let minX = 0;
        let minY = 0;
        let maxX = 0;
        let maxY = 0;

        this.clusterLayout.descendants().forEach(layoutNode => { // switch from vertical to horizontal
            minX = minX < layoutNode.y ? minX : layoutNode.y;
            maxX = maxX > layoutNode.y ? maxX : layoutNode.y;
            minY = minY < layoutNode.x ? minY : layoutNode.x;
            maxY = maxY > layoutNode.x ? maxY : layoutNode.x;
        });
        return {minX, minY, maxX, maxY};
    }

    private createHierarchy() {
        // Create the cluster layout:
        const cluster = d3.cluster().size([this.angle, this.radius]);

        // Give the data to this cluster layout:
        this.root = d3.hierarchy(this.data);
        this.clusterLayout = cluster(this.root);
    }

    public addSvgToDOM() {
        // append the svg object to the body of the page
        const {maxX, minX, maxY, minY} = this.retrieveBoundaries();
        const width = maxX - minX + this.margin.left + this.margin.right + 2 * this.circleRadius + 2 * this.circleStroke;
        const height = maxY - minY + this.margin.top + this.margin.bottom + 2 * this.circleRadius + 2 * this.circleStroke;
        this.boundary = d3.select("#pathtreesvg")
            .append("svg")
            .attr("viewBox", `${0} ${0} ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMinYMin')
            .attr("id", "mysvg")
            .append("g")
            .attr("transform", `translate(${this.margin.left} ${this.margin.top})`);
    }

    public addLinksToDOM(test, index, tree) {
        const {minY} = this.retrieveBoundaries();

        this.boundary.selectAll('path')
            .data( this.root.descendants().slice(1) )
            .enter()
            .append('path')
            .attr("d", (d) => {
                return "M" + this.finalPositionX((<any>d).y) + "," + this.finalPositionY((<any>d).x, minY)
                    + "C" + (this.finalPositionX((<any>d).parent.y) + 50) + "," + (this.finalPositionY((<any>d).x, minY))
                    + " " + (this.finalPositionX((<any>d).parent.y) + 150) + "," + (this.finalPositionY((<any>d).parent.x, minY))
                    + " " + (this.finalPositionX((<any>d).parent.y) + "," + this.finalPositionY((<any>d).parent.x, minY));
            })
            .style("fill", 'none')
            .attr("stroke", (d) => {
                return this.getColor(d, test, index, tree);
            })
            .attr("stroke-width", (d) => {
                return this.getWidth(d);
            });
    }

    public addNodesToDOM() {
        const {minY} = this.retrieveBoundaries();

        const node = this.boundary.selectAll('g')
            .data(this.root.descendants());
        this.enteredNodes = node.enter().append('g')
            .attr("transform", (d) => {
                // console.log(d)
                return "translate(" + this.finalPositionX((<any>d).y) + "," + this.finalPositionY((<any>d).x, minY) + ")"
            });
    }

    public addCirclesToDOM(test, index, tree) {
        this.enteredNodes.append('circle')
            .attr("r", this.circleRadius)
            .style("fill", (d) => {
                return this.getColor(d, test, index, tree);
            })
            .attr("stroke", "black")
            .style("stroke-width", this.circleStroke);

        // Add labels for the nodes
        this.enteredNodes.append('text')
            .attr("dy", "-10")
            .attr("x", "12")
            .style("font-size", "10px")
            .attr("text-anchor", "middle")
            .text((d) => { return d.data.name + " (" + (<any>d).data.clicks + ")" });


    }

    private getColor(node, test, index, tree) {
        let currentId = test.tasks[index].id; //correct answer
        if (node.data.id === currentId) return "green";
        while (currentId !== "root") {
            for (let k = 0; k < tree.length; k++) {
                if (tree[k].id === currentId) {
                    currentId = tree[k].parent;
                    if (currentId === node.data.id) {
                        return "green";
                    }
                    if (currentId === "root") {
                        return "lightgray";
                    }
                }
            }
        }
        return "green";

    }

    private getWidth(node) {
        const maxLog = this.maxClicks;
        const valLog = node.data.clicks;
        const maxStrokeWidth = 15;
        return (valLog / maxLog * maxStrokeWidth).toString();
    }

    private finalPositionX(positionX: number) { return positionX + this.circleRadius + this.circleStroke; }
    private finalPositionY(positionY: number, minY: number) { return positionY + this.circleRadius + this.circleStroke - minY; }
}
