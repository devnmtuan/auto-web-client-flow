import React,{useCallback, useEffect,useState }from 'react';
import ReactFlow,{Background,useEdgesState,Controls,MiniMap,
  useNodesState,addEdge} from 'reactflow';
import 'reactflow/dist/style.css';
 
const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
 
export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [processList,setProcessList] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  useEffect(()=> {
    getAllProcessUser();
  },[])
  const getAllProcessUser = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const authId = queryParams.get('authId');
    const options = {
      method: "POST", // Change to 'GET' if needed
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: JSON.stringify({ data: { authId: authId, pageIndex: pageIndex } }),
      }), // Convert data to JSON string
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
  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* <Text>{processList}</Text> */}
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}>
      <Controls />
      <MiniMap />
      <Background/>
      </ReactFlow>
    </div>
  );
}