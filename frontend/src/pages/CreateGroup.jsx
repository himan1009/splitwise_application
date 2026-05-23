// import { useEffect, useState } from "react";
// import api from "../api/api";
// import { useNavigate } from "react-router-dom";

// export default function CreateGroup() {
//   const [name, setName] = useState("");
//   const [users, setUsers] = useState([]);
//   const [selected, setSelected] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     api.get("/groups/users").then(res => setUsers(res.data));
//   }, []);

//   const toggle = (id) => {
//     setSelected(prev =>
//       prev.includes(id)
//         ? prev.filter(x => x !== id)
//         : [...prev, id]
//     );
//   };

//   const createGroup = async () => {
//     await api.post("/groups", {
//       name,
//       memberIds: selected
//     });
//     navigate("/dashboard");
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Create Group</h2>

//       <input
//         placeholder="Group name"
//         value={name}
//         onChange={e => setName(e.target.value)}
//       />

//       <h4>Select Members</h4>
//       {users.map(u => (
//         <label key={u._id}>
//           <input
//             type="checkbox"
//             onChange={() => toggle(u._id)}
//           />
//           {u.name} ({u.email})
//         </label>
//       ))}

//       <br />
//       <button onClick={createGroup}>Create</button>
//     </div>
//   );
// }



// import { useEffect, useState } from "react";
// import api from "../api/api";
// import { useNavigate } from "react-router-dom";

// export default function CreateGroup() {
//   const [name, setName] = useState("");
//   const [users, setUsers] = useState([]);
//   const [selected, setSelected] = useState([]);
//   const [search, setSearch] = useState("");

//   const navigate = useNavigate();

//   useEffect(() => {
//     api.get("/auth/users").then((res) => setUsers(res.data));
//   }, []);

//   const toggle = (id) => {
//     setSelected((prev) =>
//       prev.includes(id)
//         ? prev.filter((x) => x !== id)
//         : [...prev, id]
//     );
//   };

//   const createGroup = async () => {
//     if (!name.trim()) return;

//     await api.post("/groups", {
//       name,
//       memberIds: selected
//     });

//     navigate("/dashboard");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//       <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6 space-y-6">

//         {/* HEADER */}
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">
//             Create a new group
//           </h2>
//           <p className="text-sm text-gray-500">
//             Add friends and start tracking expenses
//           </p>
//         </div>

//         {/* GROUP NAME */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Group name
//           </label>
//           <input
//             placeholder="Trip to Manali"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* SEARCH USERS */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Add members
//           </label>
//           <input
//             placeholder="Search users by name or email"
//             onChange={(e) => setSearch(e.target.value.toLowerCase())}
//             className="w-full border px-4 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />

//           <div className="max-h-60 overflow-y-auto space-y-2">
//             {users
//               .filter(
//                 (u) =>
//                   u.name.toLowerCase().includes(search) ||
//                   u.email.toLowerCase().includes(search)
//               )
//               .map((u) => (
//                 <label
//                   key={u._id}
//                   className="flex items-center justify-between border rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-50"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
//                       {u.name[0].toUpperCase()}
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium">{u.name}</p>
//                       <p className="text-xs text-gray-500">{u.email}</p>
//                     </div>
//                   </div>

//                   <input
//                     type="checkbox"
//                     checked={selected.includes(u._id)}
//                     onChange={() => toggle(u._id)}
//                     className="w-4 h-4 accent-blue-600"
//                   />
//                 </label>
//               ))}
//           </div>
//         </div>

//         {/* ACTIONS */}
//         <div className="flex justify-end gap-3 pt-4">
//           <button
//             onClick={() => navigate("/dashboard")}
//             className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
//           >
//             Cancel
//           </button>

//           <button
//             onClick={createGroup}
//             disabled={!name.trim()}
//             className={`px-6 py-2 rounded-lg text-white transition ${
//               name.trim()
//                 ? "bg-blue-600 hover:bg-blue-700"
//                 : "bg-gray-400 cursor-not-allowed"
//             }`}
//           >
//             Create Group
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }





// import { useEffect, useState } from "react";
// import api from "../api/api";
// import { useNavigate } from "react-router-dom";

// export default function CreateGroup() {
//   const [name, setName] = useState("");
//   const [users, setUsers] = useState([]);
//   const [selected, setSelected] = useState([]);

//   const navigate = useNavigate();

//   useEffect(() => {
//     loadUsers();
//   }, []);

//   const loadUsers = async () => {
//     try {
//       const res = await api.get("/groups/users");
//       setUsers(res.data);
//     } catch (err) {
//       console.error("Failed to load users", err);
//     }
//   };

//   const toggleUser = (id) => {
//     setSelected((prev) =>
//       prev.includes(id)
//         ? prev.filter((x) => x !== id)
//         : [...prev, id]
//     );
//   };

//   const createGroup = async () => {
//     if (!name) return alert("Enter group name");

//     await api.post("/groups", {
//       name,
//       memberIds: selected
//     });

//     navigate("/dashboard");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 px-6 py-8">
//       <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">
//         <h2 className="text-2xl font-bold mb-4">Create Group</h2>

//         {/* GROUP NAME */}
//         <input
//           className="w-full border rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
//           placeholder="Group name (Trip to Goa)"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />

//         {/* USERS */}
//         <h4 className="font-semibold mb-2">Select Members</h4>

//         {users.length === 0 ? (
//           <p className="text-sm text-gray-500">No users found</p>
//         ) : (
//           <div className="max-h-64 overflow-y-auto border rounded-lg p-3 space-y-2">
//             {users.map((u) => (
//               <label
//                 key={u._id}
//                 className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
//               >
//                 <input
//                   type="checkbox"
//                   checked={selected.includes(u._id)}
//                   onChange={() => toggleUser(u._id)}
//                 />
//                 <div>
//                   <p className="text-sm font-medium">{u.name}</p>
//                   <p className="text-xs text-gray-500">{u.email}</p>
//                 </div>
//               </label>
//             ))}
//           </div>
//         )}

//         {/* ACTION */}
//         <button
//           onClick={createGroup}
//           className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
//         >
//           Create Group
//         </button>
//       </div>
//     </div>
//   );
// }



import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function CreateGroup() {
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const res = await api.get("/groups/users");
    setUsers(res.data);
  };

  const toggleUser = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const createGroup = async () => {
    if (!name.trim()) return alert("Enter group name");

    await api.post("/groups", {
      name,
      memberIds: selected
    });

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Create Group</h2>

        {/* GROUP NAME */}
        <input
          className="w-full border rounded-lg px-4 py-2 mb-4"
          placeholder="Group name (Trip to Goa)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <h4 className="font-semibold mb-2">Select Members</h4>

        <div className="max-h-64 overflow-y-auto border rounded-lg p-3 space-y-2">
          {users.map((u) => {
            const isCreator = u._id === currentUser.id;

            return (
              <label
                key={u._id}
                className={`flex items-center gap-3 px-2 py-1 rounded ${
                  isCreator ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  disabled={isCreator}
                  checked={isCreator || selected.includes(u._id)}
                  onChange={() => toggleUser(u._id)}
                />

                <div>
                  <p className="text-sm font-medium">
                    {u.name}
                    {isCreator && (
                      <span className="ml-2 text-xs text-blue-600 font-semibold">
                        (You · Admin)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
              </label>
            );
          })}
        </div>

        <button
          onClick={createGroup}
          className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
        >
          Create Group
        </button>
      </div>
    </div>
  );
}
