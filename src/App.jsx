import React,{useCallback, useEffect,useState ,useMemo,useRef}from 'react';
import ReactFlow,{Background,applyNodeChanges,Controls,MiniMap,
  applyEdgeChanges,addEdge, getBezierPath, getMarkerEnd,EdgeLabelRenderer,BaseEdge,useReactFlow,ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { Handle, Position } from 'reactflow';
import autoprefixer, { data } from 'autoprefixer';
import './index.css';
import InfiniteScroll from 'react-infinite-scroll-component';


 
function CreateFlow() {
  const initialNodes = [
    { id: 'node-1', type: 'customNode', position: { x: 100, y: 100 }, data: { value: "origin" } },
  ];
  
  const initialEdges = [
    // { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: 'a',animated: true},
    // { id: 'edge-2', source: 'node-1', target: 'node-3', sourceHandle: 'b',animated: true},
  ];
  
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  
  const [processList,setProcessList] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [triggerUpdateLabel, setTriggerUpdateLabel] = useState(false);
  const [isView,setIsView]  = useState(false);
  const reactFlow = useReactFlow();

  useEffect(()=> {
    getProcessUser([],0);
  },[])
  useEffect(() =>  {
       if(nodes.length >1){
        reactFlow.fitView({ padding: 0.2, includeHiddenNodes: true });
       }
  }, [nodes, edges, reactFlow]);

  useEffect(()=> {
    setEdges((currentEdges) =>
      currentEdges.map((edge) =>
       edge?.data?.edge == undefined ? { ...edge, data: { edge: edge} } : edge
      )
    );
  },[edges.length])

  useEffect(() => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.type === 'customNode') {
            return { ...node, data: { ...node.data, processList: processList,pageIndex: pageIndex}};
          }
          return node;
        })
      );
      console.log("processList",processList);
    }, [processList]);

  const onConnect = useCallback((connection) => 
        setEdges((eds) => addEdge({ ...connection, type: 'customEdge' }, eds)),
      [setEdges]
    );
  const updateEdgeLabel =  async (edgeId, newLabel) => {
    console.log("newLabel",newLabel)
       await setEdges((currentEdges) => 
        currentEdges.map((edge) => {
         return edge.id === edgeId ? {...edge,data: {...edge.data,label: newLabel}} : edge
        }
        )
      );
      console.log("edges",edges)
    };
    const onNodesChange = useCallback(
      (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
      [setNodes]
    );
    const onEdgesChange = useCallback(
      (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
      [setEdges]
    );
  

  const getProcessUser = (processList,pageIndex) => {
    const queryParams = new URLSearchParams(window.location.search);
    const userId = queryParams.get('userId');
    const options = {
      method: "POST", // Change to 'GET' if needed
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: { userId: userId, pageIndex: pageIndex } }), 
    };
    const PROCESS_LIST_API = `https://auto-web-server-mb8an.ondigitalocean.app/process/list`;
    fetch(PROCESS_LIST_API, options)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // Handle successful response
        console.log("zooo1",processList)
        setProcessList([...processList, ...(data.processes)]);
        setPageIndex(pageIndex + 1);
      })
      .catch((error) => {

        // Handle errors
        console.error("Error get all process of user:", error.message);
        // You can display an error message or take other actions here
      });
  };
  const createFlow = (treeData) => {
    const queryParams = new URLSearchParams(window.location.search);
    const userId = queryParams.get('userId');
    const name = queryParams.get('name');
    const options = {
      method: "POST", // Change to 'GET' if needed
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: {
        name: name,
        treeData: treeData,
        userId: userId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }}), 
    };
    const CREATE_FLOW_API = `https://auto-web-server-mb8an.ondigitalocean.app/flow/create`;
    fetch(CREATE_FLOW_API, options)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        // Handle errors
        console.error("Error create flow: ", error.message);
        // You can display an error message or take other actions here
      });
  };
  // const onEdgeUpdate = useCallback(
  //   (oldEdge, newConnection) => setEdges((els) => updateEdge(oldEdge, newConnection, els)),
  //   []
  // );

  const addNode = () => {
    const newNodeId = `node-${nodes.length + 1}`;
    const newNode = {
      id: newNodeId,
      type: 'customNode', // or any other type you want to add
      position: { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight },
      data: { label: `Node ${nodes.length + 1}`,processList: processList,pageIndex: pageIndex  },
    };
    setNodes((nds) => [...nds, newNode]);
    
  };
  const CustomEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
    arrowHeadType,
    markerEndId,
  }) => {

    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
    const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

    const onEdgeClick = (evt) => {
      evt.stopPropagation();
      setSelectedEdge(data?.edge);
      setIsEditModalVisible(true);
    };
  
    return (
      <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            backgroundColor: "white",
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button className="edgebutton" onClick={onEdgeClick}>
           {data?.label || "Status"} 
          </button>
        </div>
      </EdgeLabelRenderer>
        </>
       
    );
  };
  const EdgeEditForm = () => {
    const [newLabel, setNewLabel] = useState('Success');

    const handleSubmit = (e) => {
      console.log("selectedEdge",selectedEdge.id,newLabel)
      updateEdgeLabel(selectedEdge?.id, newLabel);
      setIsEditModalVisible(false);
    };
  
    if (!isEditModalVisible) return null;
    return (
      <div className='border-black rounded-md' style={{ borderWidth:1, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', zIndex: 100 }}>
        <div>
          <label>
           Choose Status:
          </label>
          <select onChange={(e)=> setNewLabel(e.target.value)}>
              <option value="Success">Success</option>
              <option value="Fail">Fail</option>
            </select>
<div className='flex justify-start'>
<button onClick={handleSubmit} className='bg-green-400 py-2 px-2 rounded text-white mt-2 mr-2' type="submit">Update</button>
          <button onClick={()=> setIsEditModalVisible(false)} className='bg-red-500 py-2 px-2 rounded text-white mt-2' type="submit">Close</button>
</div>
        </div>
      </div>
    );
  };

  function CustomNode({ data,id,isConnectable }) {

    useEffect(() => {
      if (data?.processList?.length > 0 && data?.process === undefined) {
        const defaultProcessId = data?.processList[0]?._id
        setNodes((nds) =>
          nds.map(node => node.id === id ? {...node, data: {...node.data, process: data?.processList.find(process=> process._id == defaultProcessId)}} : node)
        );
      }
    }, [data?.processList,id]);

    const handleChangeSelect = (e) => {
      const selectedId = e.target.value
      console.log("selectedId",selectedId)
      if(e.target.value === 'Load more...'){
        getProcessUser(data?.processList,data.pageIndex);
      }else{
        setNodes((nds) =>
          nds.map(node => node.id === id ? {...node, data: {...node.data, process: data?.processList.find(process=> process._id == selectedId)}} : node
      ))
      }
    };
    return (
      <div style={{borderWidth: 1}} className='py-2 px-2 bg-white rounded border-black' >
      {id !== 'node-1' && (
        <>
          <Handle
            style={{ borderWidth: 1, top: '-7px' }}
            className='rounded-full border-black bg-white py-1.5 px-1.5'
            type="target"
            position={Position.Top}
            isConnectable={isConnectable}
          >
            <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1" style={{ pointerEvents: "none", position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </Handle>
          
        </>
      )}
      <Handle
            style={{ borderWidth: 1, bottom: '-7px' }}
            className='rounded-full border-black bg-white py-1.5 px-1.5'
            type="source"
            position={Position.Bottom}
            id="b"
            isConnectable={isConnectable}
          >
            <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1" style={{ pointerEvents: "none", position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </Handle>
     
        <select onChange={handleChangeSelect} className='bg-white max-w-20' >
        {data?.processList?.map((process, index) => (
          <>
          <option key={process._id} value={process._id}>
           {process.name}
          </option>
           {index === data?.processList.length - 1 && <option>Load more...</option>}
          </>
        ))}
        
      </select>
      </div>
    );
  }
  const edgeTypes = useMemo(() => ({ customEdge: CustomEdge }), []);
  const nodeTypes = useMemo(() => ({ customNode: CustomNode }), [])

  const saveFlow = () => {
    function buildTreeWithEdges(nodes, edges) {
      const nodeMap = new Map();
      nodes.forEach(node => {
        const {data: {process, ...restOfData}, ...restOfNode} = node;
        nodeMap.set(node.id, {...restOfNode,data: {process: process,nodeQty: nodes.length}, children: [], edges: []});
      });
    
      edges.forEach(edge => {
        const parentNode = nodeMap.get(edge.source);
        const childNode = nodeMap.get(edge.target);
        if (parentNode && childNode) {
          // Thêm nút con vào nút cha
          parentNode.children.push(childNode);
          // Thêm thông tin cạnh vào nút cha
          parentNode.edges.push({id: edge.id, source: edge.source, target: edge.target, label: edge.data?.label});
        }
      });
    
      // Tìm nút gốc
      const rootNodes = Array.from(nodeMap.values()).filter(node => 
        !edges.find(edge => edge.target === node.id)
      );
    
      return rootNodes;
    }
    // Sử dụng hàm mới để xây dựng và lưu trữ tree với thông tin cạnh
    const treeDataWithEdges = buildTreeWithEdges(nodes, edges);
    createFlow(treeDataWithEdges)
    setIsView(true);
    console.log(JSON.stringify(treeDataWithEdges, null, 2));
  }
  return (
  
    <div style={{ width: '100vw', height: '100vh' }}>
     {!isView ?  <div className='top-2 left-2' style={{ position: 'absolute', zIndex: 30}}>
      <button style={{borderWidth: 1}} className='bg-white mr-2 py-2 px-3 border-green-700 rounded text-green-700' onClick={addNode} >Add Node</button> 
      <button style={{borderWidth: 1}} className='bg-white py-2 px-3 rounded text-purple-700 border-purple-700 ' onClick={saveFlow} >Save Flow</button> 
      </div>
      : <div className='top-2 left-2' style={{ position: 'absolute', zIndex: 30}}>
      <button id="close-flow" style={{borderWidth: 1,color: "red",borderColor: "red"}} className='bg-white py-2 px-3 rounded'>Close</button> 
      </div>
     }
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView>
      <Controls />
    
      <Background/>
      </ReactFlow>
      <EdgeEditForm />
    </div>
    
  );
}
function ViewFlow() {

  const initialNodes = [
    { id: 'node-1', type: 'customNode', position: { x: 100, y: 100 }, data: { value: "origin" } },
  ];
  
  const initialEdges = [
    // { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: 'a',animated: true},
    // { id: 'edge-2', source: 'node-1', target: 'node-3', sourceHandle: 'b',animated: true},
  ];
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [flow,setFlow] = useState(null);
  
  const reactFlow = useReactFlow();

  useEffect(()=> {
    getFlowById();
  },[])

  useEffect(() =>  {
     reactFlow.fitView({ padding: 0.2, includeHiddenNodes: true });
}, [nodes, edges, reactFlow]);


  const onConnect = useCallback((connection) => 
        setEdges((eds) => addEdge({ ...connection, type: 'customEdge' }, eds)),
      [setEdges]
    );
 
    const onNodesChange = useCallback(
      (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
      [setNodes]
    );
    const onEdgesChange = useCallback(
      (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
      [setEdges]
    );
  

    function extractNodesAndEdges(treeData) {
      let nodes = [];
      let edges = [];
    
      // Recursive function to traverse the tree and extract nodes and edges
      function traverse(node) {
        // Add the current node to the nodes array
        nodes.push({
          id: node.id,
          type: node.type,
          position: node.position,
          width: node.width,
          height: node.height,
          selected: node.selected,
          positionAbsolute: node.positionAbsolute,
          dragging: node.dragging,
          data: node.data
        });
    
        // If the node has edges, add them to the edges array
        if (node.edges) {
          node.edges.forEach(edge => {
            edges.push({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              label: edge.label,
            });
          });
        }
    
        // If the node has children, traverse each child and extract their nodes and edges
        if (node.children) {
          node.children.forEach(child => traverse(child));
        }
      }
    
      // Start traversing from the root node(s)
      treeData.forEach(rootNode => traverse(rootNode));
      console.log('nodes',nodes)
      setNodes(nodes);
      setEdges(edges);
      return { nodes, edges };
    }
  const getFlowById = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const id = queryParams.get('id');
    const options = {
      method: "POST", // Change to 'GET' if needed
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: { id: id } }), 
    };
    const PROCESS_LIST_API = `https://auto-web-server-mb8an.ondigitalocean.app/flow/id`;
    fetch(PROCESS_LIST_API, options)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // Handle successful response)
       extractNodesAndEdges(data.treeData);
      //  setFlow(data.treeData[0])
      //  console.log(data.treeData[0])
      })
      .catch((error) => {

        // Handle errors
        console.error("Error get flow by id:", error.message);
        // You can display an error message or take other actions here
      });
  };
  
  // const onEdgeUpdate = useCallback(
  //   (oldEdge, newConnection) => setEdges((els) => updateEdge(oldEdge, newConnection, els)),
  //   []
  // );


  const CustomEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
    arrowHeadType,
    markerEndId,
  }) => {

    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
    const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

    const onEdgeClick = (evt) => {
      evt.stopPropagation();
      setSelectedEdge(data?.edge);
      setIsEditModalVisible(true);
    };
  
    return (
      <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            backgroundColor: "white",
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button className="edgebutton" onClick={onEdgeClick}>
           {data?.label || "Status"} 
          </button>
        </div>
      </EdgeLabelRenderer>
        </>
       
    );
  };
 

  function CustomNode({ data,id,isConnectable}) {

    return (
      <div style={{borderWidth: 1}} className='py-2 px-2 bg-white rounded border-black' >
      {id !== 'node-1' && (
        <>
          <Handle
            style={{ borderWidth: 1, top: '-7px' }}
            className='rounded-full border-black bg-white py-1.5 px-1.5'
            type="target"
            position={Position.Top}
            isConnectable={isConnectable}
          >
            <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1" style={{ pointerEvents: "none", position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </Handle>
          
        </>
      )}
      <Handle
            style={{ borderWidth: 1, bottom: '-7px' }}
            className='rounded-full border-black bg-white py-1.5 px-1.5'
            type="source"
            position={Position.Bottom}
            id="b"
            isConnectable={isConnectable}
          >
            <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1" style={{ pointerEvents: "none", position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </Handle>
   
        <select className='bg-white max-w-20' >
          <option key={id} value={data?.process?._id}>
           {data?.process?.name}
          </option>
      </select>
      </div>
    );
  }
  const edgeTypes = useMemo(() => ({ customEdge: CustomEdge }), []);
  const nodeTypes = useMemo(() => ({ customNode: CustomNode }), [])


  return (
  
    <div style={{ width: '100vw', height: '100vh' }}>
      <div className='top-2 left-2' style={{ position: 'absolute', zIndex: 30}}>
      <button id="close-flow" style={{borderWidth: 1,color: "red",borderColor: "red"}} className='bg-white py-2 px-3 rounded'>Close</button> 
      </div>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView>
      <Controls />
    
      <Background/>
      </ReactFlow>

    </div>
    
  );
}
export default function App(){
  const queryParams = new URLSearchParams(window.location.search);
  const page = queryParams.get('page');
return (  <ReactFlowProvider >
          {page == "create"  &&  <CreateFlow/>} 
          {page == "view"  &&  <ViewFlow/>} 
</ReactFlowProvider>
)
}
