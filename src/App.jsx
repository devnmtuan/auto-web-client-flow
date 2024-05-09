import React,{useCallback, useEffect,useState ,useMemo}from 'react';
import ReactFlow,{Background,applyNodeChanges,Controls,MiniMap,
  applyEdgeChanges,addEdge} from 'reactflow';
import 'reactflow/dist/style.css';
import { Handle, Position } from 'reactflow';
import autoprefixer from 'autoprefixer';
import './index.css';

const initialNodes = [
  { id: '1', type: 'customNode',position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];
const initialEdges = [
  { id: 'edge-1', source: 'node-1', target: 'node-2', sourceHandle: 'a' },
  { id: 'edge-2', source: 'node-1', target: 'node-3', sourceHandle: 'b' },
];

 
export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  
  const [processList,setProcessList] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  useEffect(()=> {
    getAllProcessUser();
    console.log(processList);
  },[])
  useEffect(() => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.type === 'customNode') {
            return { ...node, data: { ...node.data, processList: processList } };
          }
          return node;
        })
      );
      console.log(nodes);
    }, [processList]);

  const getAllProcessUser = () => {
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
        console.log(data);
        setProcessList(data)
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

  function CustomNode({ data }) {
 
    return (
      <div style={{borderWidth: 1}} className='py-2 px-2 bg-white rounded border-black' >
          <select>
            {data?.processList?.map((process, index) => (
              <option key={index} value={process.id}>
                {process.name}
              </option>
            ))}
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

      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={onNodeClick} nodeTypes={nodeTypes}>
      <Controls />
      <MiniMap />
      <Background/>
      </ReactFlow>
      
    </div>
  );
}

