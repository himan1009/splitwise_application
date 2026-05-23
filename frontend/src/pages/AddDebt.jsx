// import { useEffect, useState } from "react";
// import api from "../api/api";
// import { useNavigate } from "react-router-dom";

// export default function AddDebt() {
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState("");
//   const [amount, setAmount] = useState("");
//   const [description, setDescription] = useState("");
//   const [type, setType] = useState("they_owe_me"); // default

//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem("user"));

//   useEffect(() => {
//     loadUsers();
//   }, []);

//   const loadUsers = async () => {
//     try {
//       const res = await api.get("/groups/users"); // reuse existing endpoint
//       const filtered = res.data.filter(u => u._id !== user.id);
//       setUsers(filtered);
//     } catch (err) {
//       console.error("Failed to load users", err);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!selectedUser || !amount) {
//       alert("Please select user and enter amount");
//       return;
//     }

//     const payload = {
//       amount: Number(amount),
//       description
//     };

//     if (type === "they_owe_me") {
//       // Ram took money from me
//       payload.from = selectedUser;
//       payload.to = user.id;
//     } else {
//       // I took money from Ram
//       payload.from = user.id;
//       payload.to = selectedUser;
//     }

//     try {
//       await api.post("/debts", payload);
//       navigate("/dashboard");
//     } catch (err) {
//       console.error("Failed to add debt", err);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 px-6 py-10">
//       <div className="max-w-xl mx-auto bg-white shadow rounded-xl p-6 space-y-6">

//         <h2 className="text-2xl font-bold text-gray-800">
//           Add Personal Debt
//         </h2>

//         {/* Select User */}
//         <div>
//           <label className="block text-sm font-medium mb-2">
//             Select Person
//           </label>
//           <select
//             className="w-full border rounded-lg px-4 py-2"
//             value={selectedUser}
//             onChange={(e) => setSelectedUser(e.target.value)}
//           >
//             <option value="">-- Select --</option>
//             {users.map((u) => (
//               <option key={u._id} value={u._id}>
//                 {u.name} ({u.email})
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Type */}
//         <div>
//           <label className="block text-sm font-medium mb-2">
//             Type
//           </label>
//           <select
//             className="w-full border rounded-lg px-4 py-2"
//             value={type}
//             onChange={(e) => setType(e.target.value)}
//           >
//             <option value="they_owe_me">
//               They took money from me
//             </option>
//             <option value="i_owe_them">
//               I took money from them
//             </option>
//           </select>
//         </div>

//         {/* Amount */}
//         <div>
//           <label className="block text-sm font-medium mb-2">
//             Amount
//           </label>
//           <input
//             type="number"
//             className="w-full border rounded-lg px-4 py-2"
//             placeholder="Enter amount"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//           />
//         </div>

//         {/* Description */}
//         <div>
//           <label className="block text-sm font-medium mb-2">
//             Description
//           </label>
//           <input
//             type="text"
//             className="w-full border rounded-lg px-4 py-2"
//             placeholder="Why this money?"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//           />
//         </div>

//         {/* Buttons */}
//         <div className="flex gap-4">
//           <button
//             onClick={handleSubmit}
//             className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
//           >
//             Save
//           </button>

//           <button
//             onClick={() => navigate("/dashboard")}
//             className="flex-1 bg-gray-300 py-2 rounded-lg"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function AddDebt() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("they_owe_me"); // default

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
    try {
      const res = await api.get("/groups/users"); // reuse existing endpoint
      const filtered = res.data.filter(u => u._id !== user.id);
      setUsers(filtered);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

    const handleSubmit = async () => {
        if (!selectedUser || !amount) {
            alert("Please select user and enter amount");
            return;
        }

        const payload = {
  amount: Number(amount),
  description
};

const myId = user._id || user.id;

if (type === "they_owe_me") {
  // Ram took money from me
  payload.from = selectedUser; // Ram took
  payload.to = myId;           // I gave
} else {
  // I took money from Ram
  payload.from = myId;         // I took
  payload.to = selectedUser;   // Ram gave
}

        try {
            await api.post("/debts", payload);
            navigate("/dashboard");
        } catch (err) {
            console.error("Failed to add debt", err.response?.data);
            alert(err.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-10">
            <div className="max-w-xl mx-auto bg-white shadow rounded-xl p-6 space-y-6">

                <h2 className="text-2xl font-bold text-gray-800">
                    Add Personal Debt
                </h2>

                {/* Select User */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Select Person
                    </label>
                    <select
                        className="w-full border rounded-lg px-4 py-2"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                    >
                        <option value="">-- Select --</option>
                        {users.map((u) => (
                            <option key={u._id} value={u._id}>
                                {u.name} ({u.email})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Type */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Type
                    </label>
                    <select
                        className="w-full border rounded-lg px-4 py-2"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="they_owe_me">
                            They took money from me
                        </option>
                        <option value="i_owe_them">
                            I took money from them
                        </option>
                    </select>
                </div>

                {/* Amount */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Amount
                    </label>
                    <input
                        type="number"
                        className="w-full border rounded-lg px-4 py-2"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Description
                    </label>
                    <input
                        type="text"
                        className="w-full border rounded-lg px-4 py-2"
                        placeholder="Why this money?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                    >
                        Save
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="flex-1 bg-gray-300 py-2 rounded-lg"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}