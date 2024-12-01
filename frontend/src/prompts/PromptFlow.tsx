import ReactFlow, { Background, NodeTypes, MarkerType } from 'reactflow';
import 'reactflow/dist/base.css';
import { PromptFlowNode } from "./PromptFlowNode";


export const nodeTypes = {
    "position-logger": PromptFlowNode,
} satisfies NodeTypes;

function PromptFlow(props: any) {
    const { prompts, editViewSwitch } = props;

    const firstNode = prompts.filter((p: any) => !p.parentId)
    const getNodes: any = (nodes: any, x: number, y: number) => {
        const nextNode = prompts.filter((p: any) => nodes.some((s: any) => p.parentId === s.promptId))
        let z = y;
        if (nextNode && nextNode.length > 0) {
            return [...nodes.map((n: any) => {
                const r = ({
                    id: n.id,
                    type: "position-logger",
                    position: { x: x, y: z },
                    data: n,
                })
                z = z + (n.name.length + n.description.length) / 3 + 500;
                return r;
            }), ...getNodes(nextNode, x + 800, y)]
        } else {
            return [...nodes.map((n: any) => {
                const r = ({
                    id: n.id,
                    type: "position-logger",
                    position: { x: x, y: z },
                    data: n,
                })
                z = z + (n.name.length + n.description.length) / 3 + 500;
                return r;
            })]
        }
    }

    const getEdges: any = (nodes: any) => {
        const nextNode = prompts.filter((p: any) => nodes.some((s: any) => p.parentId === s.promptId))

        if (nextNode.length > 0) {
            return [...nextNode.flatMap((n: any) => nodes.filter((nn: any) => n.parentId === nn.promptId).map((nn: any) => ({ id: n.id + nn.id, source: nn.id, target: n.id, animated: true , markerEnd: {type: MarkerType.ArrowClosed,       width: 20,
                height: 20,
                color: '#FF0072',}}))),
            ...getEdges(nextNode)]
        } else {
            return [...nextNode.flatMap((n: any) => nodes.filter((nn: any) => n.parentId === nn.promptId).map((nn: any) => ({ id: n.id + nn.id, source: nn.id, target: n.id, animated: true, markerEnd: {type: MarkerType.ArrowClosed,       width: 20,
                height: 20,
                color: '#FF0072'} })))]
        }
    }

    return (
        <ReactFlow nodes={getNodes(firstNode, 0, 0)} edges={getEdges(firstNode)} nodeTypes={nodeTypes} defaultViewport={{ x: 0, y: 0, zoom: 0 }} >
            <Background />
        </ReactFlow>
    );
}

export default PromptFlow;