import React,{useCallback, useEffect,useState ,useMemo,useRef}from 'react';
import ReactFlow,{Background,applyNodeChanges,Controls,MiniMap,
  applyEdgeChanges,addEdge} from 'reactflow';
import 'reactflow/dist/style.css';
import { Handle, Position } from 'reactflow';
import autoprefixer from 'autoprefixer';
import './index.css';
import InfiniteScroll from 'react-infinite-scroll-component';
const initialNodes = [
  { id: 'node-1', type: 'customNode', position: { x: 0, y: 0 }, data: { value: 123 } },
];

const initialEdges = [
  // { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: 'a',animated: true},
  // { id: 'edge-2', source: 'node-1', target: 'node-3', sourceHandle: 'b',animated: true},
];

 
export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  
  const [processList,setProcessList] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
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
  useEffect(()=> {
    getAllProcessUser([],0);
  },[])

  useEffect(() => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.type === 'customNode') {
            return { ...node, data: { ...node.data, processList: processList ,pageIndex: pageIndex }};
          }
          return node;
        })
      );
      console.log("processList",processList);
    }, [processList]);
  useEffect(() => {
      console.log("Updated processList:", processList);
      // Perform any action that depends on the updated processList here
    }, [processList]);
    
  const getAllProcessUser = (processList,pageIndex) => {
    const queryParams = new URLSearchParams(window.location.search);
    const authId = queryParams.get('authId');
    const options = {
      method: "POST", // Change to 'GET' if needed
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: { authId: authId, pageIndex: pageIndex } }), 
    };
    const PROCESS_LIST_API = `https://auto-web-server-7ko8h.ondigitalocean.app/process/list`;
    fetch(PROCESS_LIST_API, options)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // Handle successful response
        console.log("zooo1",processList)
        setProcessList([...processList, ...data]);
        setPageIndex(pageIndex + 1);
      })
      .catch((error) => {

        // Handle errors
        console.error("Error get all process of user:", error.message);
        // You can display an error message or take other actions here
      });
  };
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  function CustomNode({ data,id,isConnectable }) {
   
    const handleLoadMore = (e) => {
      console.log(e.target.value);
      if(e.target.value === 'Load more...'){
        getAllProcessUser(data?.processList,data.pageIndex);
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
     
        <select onClick={handleLoadMore} className='bg-white' >
        {data?.processList?.map((process, index) => (
          <option key={index} value={process.id}>
           {process.name.length > 10 ? process.name.substring(0, 10) + '...' : process.name}
          </option>
        ))}
         <option>Load more...</option>
      </select>
      </div>
    );
  }

  const nodeTypes = useMemo(() => ({ customNode: CustomNode }), [])
  const onNodeClick = (event, node) => {
    setSelectedNode({ node, position: { x: event.clientX, y: event.clientY } });
    setDropdownPosition({ x: event.clientX, y: event.clientY });
    setShowDropdown(true);
  };
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <button className='bg-green-400 top-2 left-2 py-2 px-2 rounded text-white' onClick={addNode} style={{ position: 'absolute', zIndex: 1000}}>Add Node</button> 
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={onNodeClick} nodeTypes={nodeTypes}>
      <Controls />
    
      <Background/>
      </ReactFlow>
      
    </div>
  );
}

