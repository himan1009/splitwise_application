// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/api";
// import AddExpense from "./AddExpense";

// /* ===== BALANCE CALC ===== */
// function calculateNetBalances(expenses, members) {
//   const balance = {};

//   members.forEach((m) => {
//     balance[String(m._id)] = 0;
//   });

//   expenses.forEach((expense) => {
//     const payerId = String(expense.paidBy._id);
//     balance[payerId] += expense.amount;

//     expense.splits.forEach((s) => {
//       balance[String(s.user._id)] -= s.amount;
//     });
//   });

//   return balance;
// }

// /* ===== USER-SPECIFIC SUMMARY ===== */
// function getUserSummary(balances, members, myId) {
//   const me = balances[myId] || 0;
//   const lines = [];

//   if (me === 0) return lines;

//   if (me > 0) {
//     members.forEach((m) => {
//       const uid = String(m._id);
//       if (uid === myId) return;

//       const bal = balances[uid] || 0;
//       if (bal < 0) {
//         lines.push({
//           text: `${m.name} owes you ₹${Math.abs(bal)}`,
//           type: "get"
//         });
//       }
//     });
//   }

//   if (me < 0) {
//     members.forEach((m) => {
//       const uid = String(m._id);
//       if (uid === myId) return;

//       const bal = balances[uid] || 0;
//       if (bal > 0) {
//         lines.push({
//           text: `You owe ${m.name} ₹${bal}`,
//           type: "owe"
//         });
//       }
//     });
//   }

//   return lines;
// }

// export default function GroupDetails() {
//   const { groupId } = useParams();
//   const navigate = useNavigate();

//   const [group, setGroup] = useState(null);
//   const [expenses, setExpenses] = useState([]);
//   const [email, setEmail] = useState("");
//   const [msg, setMsg] = useState("");

//   const loggedInUser = JSON.parse(localStorage.getItem("user"));
//   const myId = String(loggedInUser.id);

//   useEffect(() => {
//     loadAll();
//   }, []);

//   const loadAll = async () => {
//     const groupsRes = await api.get("/groups");
//     const g = groupsRes.data.find((x) => String(x._id) === groupId);
//     setGroup(g);

//     const expRes = await api.get(`/expenses/${groupId}`);
//     setExpenses(expRes.data);
//   };

//   const addMember = async () => {
//     try {
//       await api.post(`/groups/${groupId}/add-member`, { email });
//       setMsg("Member added successfully");
//       setEmail("");
//       loadAll();
//     } catch (err) {
//       setMsg(err.response?.data?.message || "Error adding member");
//     }
//   };

//   if (!group) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <p className="text-gray-500">Loading group...</p>
//       </div>
//     );
//   }

//   const balances = calculateNetBalances(expenses, group.members);
//   const summary = getUserSummary(balances, group.members, myId);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-5xl mx-auto p-6 space-y-6">
//         {/* HEADER */}
//         <div className="bg-white rounded-xl shadow px-6 py-4 flex items-center gap-4">
//           <button
//             onClick={() => navigate("/dashboard")}
//             className="text-blue-600 hover:underline"
//           >
//             ← Back
//           </button>
//           <h2 className="text-2xl font-bold text-gray-800">
//             {group.name}
//           </h2>
//         </div>

//         {/* MEMBERS */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold text-gray-700 mb-3">
//             Group Members
//           </h3>
//           <div className="flex flex-wrap gap-2">
//             {group.members.map((m) => (
//               <span
//                 key={m._id}
//                 className="px-4 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium"
//               >
//                 {m.name}
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* ADD MEMBER */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold text-gray-700 mb-3">
//             Add Member
//           </h3>
//           <div className="flex flex-col sm:flex-row gap-3">
//             <input
//               className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Registered user email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//             <button
//               onClick={addMember}
//               className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
//             >
//               Add
//             </button>
//           </div>
//           {msg && (
//             <p className="text-sm mt-2 text-gray-500">{msg}</p>
//           )}
//         </div>

//         {/* ADD EXPENSE */}
//         <AddExpense group={group} onAdd={loadAll} />

//         {/* SUMMARY */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold text-gray-700 mb-3">
//             Your Summary
//           </h3>

//           {summary.length === 0 ? (
//             <p className="text-green-600 font-semibold">
//               🎉 You are all settled
//             </p>
//           ) : (
//             <div className="space-y-1">
//               {summary.map((s, i) => (
//                 <p
//                   key={i}
//                   className={`font-semibold ${
//                     s.type === "owe"
//                       ? "text-red-600"
//                       : "text-green-600"
//                   }`}
//                 >
//                   {s.text}
//                 </p>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* EXPENSE HISTORY */}
//         <div className="space-y-4">
//           <h3 className="font-semibold text-gray-700">
//             Expense History
//           </h3>

//           {expenses.map((e) => (
//             <div
//               key={e._id}
//               className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500"
//             >
//               <div className="flex justify-between items-center">
//                 <h4 className="font-semibold text-gray-800">
//                   {e.description}
//                 </h4>
//                 <span className="text-lg font-bold text-gray-800">
//                   ₹{e.amount}
//                 </span>
//               </div>

//               <p className="text-sm text-gray-500 mt-1">
//                 Paid by <strong>{e.paidBy.name}</strong>
//               </p>

//               <div className="mt-3">
//                 <p className="text-sm font-medium text-gray-600 mb-1">
//                   Split among
//                 </p>
//                 <ul className="list-disc ml-5 text-sm text-gray-600">
//                   {e.splits.map((s, idx) => (
//                     <li key={idx}>
//                       {s.user.name} – ₹{s.amount}
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               <p className="text-xs text-gray-400 mt-3">
//                 {new Date(e.createdAt).toLocaleString()}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }




// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/api";
// import AddExpense from "./AddExpense";

// /* ===== BALANCE CALC ===== */
// function calculateNetBalances(expenses, members) {
//   const balance = {};
//   members.forEach((m) => (balance[String(m._id)] = 0));

//   expenses.forEach((expense) => {
//     const payerId = String(expense.paidBy._id);
//     balance[payerId] += expense.amount;

//     expense.splits.forEach((s) => {
//       balance[String(s.user._id)] -= s.amount;
//     });
//   });

//   return balance;
// }

// /* ===== USER-SPECIFIC SUMMARY ===== */
// function getUserSummary(balances, members, myId) {
//   const me = balances[myId] || 0;
//   const lines = [];

//   if (me > 0) {
//     members.forEach((m) => {
//       const bal = balances[m._id];
//       if (bal < 0)
//         lines.push({
//           text: `${m.name} owes you ₹${Math.abs(bal)}`,
//           type: "get"
//         });
//     });
//   }

//   if (me < 0) {
//     members.forEach((m) => {
//       const bal = balances[m._id];
//       if (bal > 0)
//         lines.push({
//           text: `You owe ${m.name} ₹${bal}`,
//           type: "owe"
//         });
//     });
//   }

//   return lines;
// }

// export default function GroupDetails() {
//   const { groupId } = useParams();
//   const navigate = useNavigate();

//   const [group, setGroup] = useState(null);
//   const [expenses, setExpenses] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [showUsers, setShowUsers] = useState(false);

//   const loggedInUser = JSON.parse(localStorage.getItem("user"));
//   const myId = String(loggedInUser.id);

//   useEffect(() => {
//     loadAll();
//   }, []);

//   const loadAll = async () => {
//     const groupsRes = await api.get("/groups");
//     setGroup(groupsRes.data.find((g) => g._id === groupId));

//     const expRes = await api.get(`/expenses/${groupId}`);
//     setExpenses(expRes.data);

//     const usersRes = await api.get("/auth/users"); // all registered users
//     setAllUsers(usersRes.data);
//   };

//   const addMember = async (userId) => {
//     await api.post(`/groups/${groupId}/add-member`, { userId });
//     setShowUsers(false);
//     loadAll();
//   };

//   if (!group) return null;

//   const balances = calculateNetBalances(expenses, group.members);
//   const summary = getUserSummary(balances, group.members, myId);

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-6xl mx-auto space-y-6">

//         {/* HEADER */}
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate("/dashboard")}
//             className="text-blue-600 hover:underline"
//           >
//             ← Back
//           </button>
//           <h2 className="text-2xl font-bold">{group.name}</h2>
//         </div>

//         {/* MEMBERS */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-4">Members</h3>
//           <div className="flex gap-4 flex-wrap">
//             {group.members.map((m) => (
//               <div
//                 key={m._id}
//                 className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full"
//               >
//                 <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
//                   {m.name[0].toUpperCase()}
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium">{m.name}</p>
//                   <p className="text-xs text-gray-500">{m.email}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* ADD MEMBER */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-4">Add Member</h3>

//           <input
//             type="text"
//             placeholder="Search users by name or email"
//             className="w-full border px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             onChange={(e) => setSearch(e.target.value.toLowerCase())}
//           />

//           <div className="max-h-60 overflow-y-auto space-y-2">
//             {allUsers
//               .filter(
//                 (u) =>
//                   !group.members.some((m) => m._id === u._id) &&
//                   (u.name.toLowerCase().includes(search) ||
//                     u.email.toLowerCase().includes(search))
//               )
//               .map((u) => (
//                 <div
//                   key={u._id}
//                   className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-gray-50"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
//                       {u.name[0].toUpperCase()}
//                     </div>
//                     <div>
//                       <p className="font-medium">{u.name}</p>
//                       <p className="text-sm text-gray-500">{u.email}</p>
//                     </div>
//                   </div>

//                   <button
//                     onClick={() => addMember(u._id)}
//                     className="bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition"
//                   >
//                     Add
//                   </button>
//                 </div>
//               ))}

//             {allUsers.filter(
//               (u) => !group.members.some((m) => m._id === u._id)
//             ).length === 0 && (
//                 <p className="text-sm text-gray-500 text-center">
//                   All users are already in this group
//                 </p>
//               )}
//           </div>
//         </div>


//         {/* ADD EXPENSE */}
//         <AddExpense group={group} onAdd={loadAll} />

//         {/* SUMMARY */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-3">Your Summary</h3>
//           {summary.length === 0 ? (
//             <p className="text-green-600 font-semibold">
//               🎉 You are all settled
//             </p>
//           ) : (
//             summary.map((s, i) => (
//               <p
//                 key={i}
//                 className={`font-semibold ${s.type === "owe" ? "text-red-600" : "text-green-600"
//                   }`}
//               >
//                 {s.text}
//               </p>
//             ))
//           )}
//         </div>

//         {/* EXPENSE HISTORY */}
//         <div className="space-y-4">
//           <h3 className="font-semibold">Expense History</h3>

//           {expenses.map((e) => (
//             <div
//               key={e._id}
//               className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500"
//             >
//               <div className="flex justify-between">
//                 <h4 className="font-semibold">{e.description}</h4>
//                 <span className="font-bold">₹{e.amount}</span>
//               </div>

//               <p className="text-sm text-gray-500">
//                 Paid by <strong>{e.paidBy.name}</strong>
//               </p>

//               <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
//                 {e.splits.map((s, i) => (
//                   <div key={i}>
//                     {s.user.name}: ₹{s.amount}
//                   </div>
//                 ))}
//               </div>

//               <p className="text-xs text-gray-400 mt-3">
//                 {new Date(e.createdAt).toLocaleString()}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }




// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/api";
// import AddExpense from "./AddExpense";
// import Footer from "../components/Footer";

// /* ===== BALANCE CALC ===== */
// function calculateBalances(expenses, members) {
//   const bal = {};
//   members.forEach((m) => (bal[m._id] = 0));

//   expenses.forEach((e) => {
//     bal[e.paidBy._id] += e.amount;
//     e.splits.forEach((s) => {
//       bal[s.user._id] -= s.amount;
//     });
//   });

//   return bal;
// }

// /* ===== USER SUMMARY ===== */
// function getSummary(balances, members, myId) {
//   const res = [];

//   if (balances[myId] > 0) {
//     members.forEach((m) => {
//       if (balances[m._id] < 0) {
//         res.push({
//           text: `${m.name} owes you ₹${Math.abs(balances[m._id])}`,
//           type: "get"
//         });
//       }
//     });
//   }

//   if (balances[myId] < 0) {
//     members.forEach((m) => {
//       if (balances[m._id] > 0) {
//         res.push({
//           text: `You owe ${m.name} ₹${balances[m._id]}`,
//           type: "owe"
//         });
//       }
//     });
//   }

//   return res;
// }

// export default function GroupDetails() {
//   const { groupId } = useParams();
//   const navigate = useNavigate();

//   const user = JSON.parse(localStorage.getItem("user"));

//   const [group, setGroup] = useState(null);
//   const [expenses, setExpenses] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     loadAll();
//   }, []);

//   const loadAll = async () => {
//     const g = (await api.get("/groups")).data.find(
//       (x) => x._id === groupId
//     );
//     setGroup(g);

//     setExpenses((await api.get(`/expenses/${groupId}`)).data);
//     setAllUsers((await api.get("/auth/users")).data);
//   };

//   const addMember = async (id) => {
//     await api.post(`/groups/${groupId}/add-member`, { userId: id });
//     loadAll();
//   };

//   const removeMember = async (id) => {
//     if (!window.confirm("Remove this member from group?")) return;
//     await api.post(`/groups/${groupId}/remove-member`, { userId: id });
//     loadAll();
//   };

//   const deleteGroup = async () => {
//     if (!window.confirm("Delete group permanently?")) return;
//     await api.delete(`/groups/${groupId}`);
//     navigate("/dashboard");
//   };

//   if (!group) return null;

//   const balances = calculateBalances(expenses, group.members);
//   const summary = getSummary(balances, group.members, user.id);

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       <div className="flex-1 max-w-6xl mx-auto p-6 space-y-6">

//         {/* HEADER */}
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate("/dashboard")}
//             className="text-blue-600 hover:underline"
//           >
//             ← Back
//           </button>
//           <h2 className="text-2xl font-bold">{group.name}</h2>
//         </div>

//         {/* MEMBERS */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-4">Members</h3>
//           <div className="space-y-2">
//             {group.members.map((m) => (
//               <div
//                 key={m._id}
//                 className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg"
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
//                     {m.name[0].toUpperCase()}
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium">{m.name}</p>
//                     <p className="text-xs text-gray-500">{m.email}</p>
//                   </div>
//                 </div>

//                 {m._id !== user.id && (
//                   <button
//                     onClick={() => removeMember(m._id)}
//                     className="text-red-600 hover:underline text-sm"
//                   >
//                     Remove
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* ADD MEMBER */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-3">Add Member</h3>

//           <input
//             placeholder="Search users"
//             className="w-full border px-4 py-2 rounded-lg mb-3"
//             onChange={(e) => setSearch(e.target.value.toLowerCase())}
//           />

//           <div className="max-h-60 overflow-y-auto space-y-2">
//             {allUsers
//               .filter(
//                 (u) =>
//                   !group.members.some((m) => m._id === u._id) &&
//                   (u.name.toLowerCase().includes(search) ||
//                     u.email.toLowerCase().includes(search))
//               )
//               .map((u) => (
//                 <div
//                   key={u._id}
//                   className="flex items-center justify-between border rounded-lg px-4 py-2"
//                 >
//                   <div>
//                     <p className="font-medium">{u.name}</p>
//                     <p className="text-xs text-gray-500">{u.email}</p>
//                   </div>
//                   <button
//                     onClick={() => addMember(u._id)}
//                     className="bg-green-600 text-white px-4 py-1 rounded-lg"
//                   >
//                     Add
//                   </button>
//                 </div>
//               ))}
//           </div>
//         </div>

//         {/* ADD EXPENSE */}
//         <AddExpense group={group} onAdd={loadAll} />

//         {/* SUMMARY */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-3">Your Summary</h3>
//           {summary.length === 0 ? (
//             <p className="text-green-600 font-semibold">
//               🎉 You are all settled
//             </p>
//           ) : (
//             summary.map((s, i) => (
//               <p
//                 key={i}
//                 className={`font-semibold ${
//                   s.type === "owe" ? "text-red-600" : "text-green-600"
//                 }`}
//               >
//                 {s.text}
//               </p>
//             ))
//           )}
//         </div>

//         {/* EXPENSE HISTORY */}
//         <div className="space-y-4">
//           <h3 className="font-semibold">Expense History</h3>

//           {expenses.map((e) => (
//             <div
//               key={e._id}
//               className="bg-white rounded-xl shadow p-6 space-y-2"
//             >
//               <div className="flex justify-between">
//                 <h4 className="font-semibold">{e.description}</h4>
//                 <span className="font-bold">₹{e.amount}</span>
//               </div>

//               <p className="text-sm text-gray-500">
//                 Paid by <strong>{e.paidBy.name}</strong>
//               </p>

//               <div className="space-y-1 text-sm">
//                 {e.splits.map((s, i) => (
//                   <p key={i}>
//                     {s.user.name} → ₹{s.amount}
//                   </p>
//                 ))}
//               </div>

//               <p className="text-xs text-gray-400">
//                 {new Date(e.createdAt).toLocaleString()}
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* DANGER ZONE */}
//         <div className="bg-white rounded-xl shadow p-6 border border-red-200">
//           <h3 className="text-red-600 font-semibold mb-2">
//             Danger Zone
//           </h3>
//           <button
//             onClick={deleteGroup}
//             className="bg-red-600 text-white px-5 py-2 rounded-lg"
//           >
//             Delete Group
//           </button>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// }



// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/api";
// import AddExpense from "./AddExpense";

// /* ===== BALANCE CALC ===== */
// function calculateNetBalances(expenses, members) {
//   const balance = {};

//   members.forEach((m) => {
//     balance[String(m._id)] = 0;
//   });

//   expenses.forEach((expense) => {
//     const payerId = String(expense.paidBy._id);
//     balance[payerId] += expense.amount;

//     expense.splits.forEach((s) => {
//       balance[String(s.user._id)] -= s.amount;
//     });
//   });

//   return balance;
// }

// /* ===== USER-SPECIFIC SUMMARY ===== */
// function getUserSummary(balances, members, myId) {
//   const me = balances[myId] || 0;
//   const lines = [];

//   if (me === 0) return lines;

//   if (me > 0) {
//     members.forEach((m) => {
//       const uid = String(m._id);
//       if (uid === myId) return;

//       const bal = balances[uid] || 0;
//       if (bal < 0) {
//         lines.push({
//           text: `${m.name} owes you ₹${Math.abs(bal)}`,
//           type: "get"
//         });
//       }
//     });
//   }

//   if (me < 0) {
//     members.forEach((m) => {
//       const uid = String(m._id);
//       if (uid === myId) return;

//       const bal = balances[uid] || 0;
//       if (bal > 0) {
//         lines.push({
//           text: `You owe ${m.name} ₹${bal}`,
//           type: "owe"
//         });
//       }
//     });
//   }

//   return lines;
// }

// export default function GroupDetails() {
//   const { groupId } = useParams();
//   const navigate = useNavigate();

//   const [group, setGroup] = useState(null);
//   const [expenses, setExpenses] = useState([]);
//   const [email, setEmail] = useState("");
//   const [msg, setMsg] = useState("");

//   const loggedInUser = JSON.parse(localStorage.getItem("user"));
//   const myId = String(loggedInUser.id);

//   useEffect(() => {
//     loadAll();
//   }, []);

//   const loadAll = async () => {
//     const groupsRes = await api.get("/groups");
//     const g = groupsRes.data.find((x) => String(x._id) === groupId);
//     setGroup(g);

//     const expRes = await api.get(`/expenses/${groupId}`);
//     setExpenses(expRes.data);
//   };

//   const addMember = async () => {
//     try {
//       await api.post(`/groups/${groupId}/add-member`, { email });
//       setMsg("Member added successfully");
//       setEmail("");
//       loadAll();
//     } catch (err) {
//       setMsg(err.response?.data?.message || "Error adding member");
//     }
//   };

//   if (!group) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <p className="text-gray-500">Loading group...</p>
//       </div>
//     );
//   }

//   const balances = calculateNetBalances(expenses, group.members);
//   const summary = getUserSummary(balances, group.members, myId);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-5xl mx-auto p-6 space-y-6">
//         {/* HEADER */}
//         <div className="bg-white rounded-xl shadow px-6 py-4 flex items-center gap-4">
//           <button
//             onClick={() => navigate("/dashboard")}
//             className="text-blue-600 hover:underline"
//           >
//             ← Back
//           </button>
//           <h2 className="text-2xl font-bold text-gray-800">
//             {group.name}
//           </h2>
//         </div>

//         {/* MEMBERS */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold text-gray-700 mb-3">
//             Group Members
//           </h3>
//           <div className="flex flex-wrap gap-2">
//             {group.members.map((m) => (
//               <span
//                 key={m._id}
//                 className="px-4 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium"
//               >
//                 {m.name}
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* ADD MEMBER */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold text-gray-700 mb-3">
//             Add Member
//           </h3>
//           <div className="flex flex-col sm:flex-row gap-3">
//             <input
//               className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Registered user email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//             <button
//               onClick={addMember}
//               className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
//             >
//               Add
//             </button>
//           </div>
//           {msg && (
//             <p className="text-sm mt-2 text-gray-500">{msg}</p>
//           )}
//         </div>

//         {/* ADD EXPENSE */}
//         <AddExpense group={group} onAdd={loadAll} />

//         {/* SUMMARY */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold text-gray-700 mb-3">
//             Your Summary
//           </h3>

//           {summary.length === 0 ? (
//             <p className="text-green-600 font-semibold">
//               🎉 You are all settled
//             </p>
//           ) : (
//             <div className="space-y-1">
//               {summary.map((s, i) => (
//                 <p
//                   key={i}
//                   className={`font-semibold ${
//                     s.type === "owe"
//                       ? "text-red-600"
//                       : "text-green-600"
//                   }`}
//                 >
//                   {s.text}
//                 </p>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* EXPENSE HISTORY */}
//         <div className="space-y-4">
//           <h3 className="font-semibold text-gray-700">
//             Expense History
//           </h3>

//           {expenses.map((e) => (
//             <div
//               key={e._id}
//               className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500"
//             >
//               <div className="flex justify-between items-center">
//                 <h4 className="font-semibold text-gray-800">
//                   {e.description}
//                 </h4>
//                 <span className="text-lg font-bold text-gray-800">
//                   ₹{e.amount}
//                 </span>
//               </div>

//               <p className="text-sm text-gray-500 mt-1">
//                 Paid by <strong>{e.paidBy.name}</strong>
//               </p>

//               <div className="mt-3">
//                 <p className="text-sm font-medium text-gray-600 mb-1">
//                   Split among
//                 </p>
//                 <ul className="list-disc ml-5 text-sm text-gray-600">
//                   {e.splits.map((s, idx) => (
//                     <li key={idx}>
//                       {s.user.name} – ₹{s.amount}
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               <p className="text-xs text-gray-400 mt-3">
//                 {new Date(e.createdAt).toLocaleString()}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }




// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/api";
// import AddExpense from "./AddExpense";

// /* ===== BALANCE CALC ===== */
// function calculateNetBalances(expenses, members) {
//   const balance = {};
//   members.forEach((m) => (balance[String(m._id)] = 0));

//   expenses.forEach((expense) => {
//     const payerId = String(expense.paidBy._id);
//     balance[payerId] += expense.amount;

//     expense.splits.forEach((s) => {
//       balance[String(s.user._id)] -= s.amount;
//     });
//   });

//   return balance;
// }

// /* ===== USER-SPECIFIC SUMMARY ===== */
// function getUserSummary(balances, members, myId) {
//   const me = balances[myId] || 0;
//   const lines = [];

//   if (me > 0) {
//     members.forEach((m) => {
//       const bal = balances[m._id];
//       if (bal < 0)
//         lines.push({
//           text: `${m.name} owes you ₹${Math.abs(bal)}`,
//           type: "get"
//         });
//     });
//   }

//   if (me < 0) {
//     members.forEach((m) => {
//       const bal = balances[m._id];
//       if (bal > 0)
//         lines.push({
//           text: `You owe ${m.name} ₹${bal}`,
//           type: "owe"
//         });
//     });
//   }

//   return lines;
// }

// export default function GroupDetails() {
//   const { groupId } = useParams();
//   const navigate = useNavigate();

//   const [group, setGroup] = useState(null);
//   const [expenses, setExpenses] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [showUsers, setShowUsers] = useState(false);

//   const loggedInUser = JSON.parse(localStorage.getItem("user"));
//   const myId = String(loggedInUser.id);

//   useEffect(() => {
//     loadAll();
//   }, []);

//   const loadAll = async () => {
//     const groupsRes = await api.get("/groups");
//     setGroup(groupsRes.data.find((g) => g._id === groupId));

//     const expRes = await api.get(`/expenses/${groupId}`);
//     setExpenses(expRes.data);

//     const usersRes = await api.get("/auth/users"); // all registered users
//     setAllUsers(usersRes.data);
//   };

//   const addMember = async (userId) => {
//     await api.post(`/groups/${groupId}/add-member`, { userId });
//     setShowUsers(false);
//     loadAll();
//   };

//   if (!group) return null;

//   const balances = calculateNetBalances(expenses, group.members);
//   const summary = getUserSummary(balances, group.members, myId);

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-6xl mx-auto space-y-6">

//         {/* HEADER */}
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate("/dashboard")}
//             className="text-blue-600 hover:underline"
//           >
//             ← Back
//           </button>
//           <h2 className="text-2xl font-bold">{group.name}</h2>
//         </div>

//         {/* MEMBERS */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-4">Members</h3>
//           <div className="flex gap-4 flex-wrap">
//             {group.members.map((m) => (
//               <div
//                 key={m._id}
//                 className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full"
//               >
//                 <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
//                   {m.name[0].toUpperCase()}
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium">{m.name}</p>
//                   <p className="text-xs text-gray-500">{m.email}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* ADD MEMBER */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-4">Add Member</h3>

//           <input
//             type="text"
//             placeholder="Search users by name or email"
//             className="w-full border px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             onChange={(e) => setSearch(e.target.value.toLowerCase())}
//           />

//           <div className="max-h-60 overflow-y-auto space-y-2">
//             {allUsers
//               .filter(
//                 (u) =>
//                   !group.members.some((m) => m._id === u._id) &&
//                   (u.name.toLowerCase().includes(search) ||
//                     u.email.toLowerCase().includes(search))
//               )
//               .map((u) => (
//                 <div
//                   key={u._id}
//                   className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-gray-50"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
//                       {u.name[0].toUpperCase()}
//                     </div>
//                     <div>
//                       <p className="font-medium">{u.name}</p>
//                       <p className="text-sm text-gray-500">{u.email}</p>
//                     </div>
//                   </div>

//                   <button
//                     onClick={() => addMember(u._id)}
//                     className="bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition"
//                   >
//                     Add
//                   </button>
//                 </div>
//               ))}

//             {allUsers.filter(
//               (u) => !group.members.some((m) => m._id === u._id)
//             ).length === 0 && (
//                 <p className="text-sm text-gray-500 text-center">
//                   All users are already in this group
//                 </p>
//               )}
//           </div>
//         </div>


//         {/* ADD EXPENSE */}
//         <AddExpense group={group} onAdd={loadAll} />

//         {/* SUMMARY */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-3">Your Summary</h3>
//           {summary.length === 0 ? (
//             <p className="text-green-600 font-semibold">
//               🎉 You are all settled
//             </p>
//           ) : (
//             summary.map((s, i) => (
//               <p
//                 key={i}
//                 className={`font-semibold ${s.type === "owe" ? "text-red-600" : "text-green-600"
//                   }`}
//               >
//                 {s.text}
//               </p>
//             ))
//           )}
//         </div>

//         {/* EXPENSE HISTORY */}
//         <div className="space-y-4">
//           <h3 className="font-semibold">Expense History</h3>

//           {expenses.map((e) => (
//             <div
//               key={e._id}
//               className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500"
//             >
//               <div className="flex justify-between">
//                 <h4 className="font-semibold">{e.description}</h4>
//                 <span className="font-bold">₹{e.amount}</span>
//               </div>

//               <p className="text-sm text-gray-500">
//                 Paid by <strong>{e.paidBy.name}</strong>
//               </p>

//               <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
//                 {e.splits.map((s, i) => (
//                   <div key={i}>
//                     {s.user.name}: ₹{s.amount}
//                   </div>
//                 ))}
//               </div>

//               <p className="text-xs text-gray-400 mt-3">
//                 {new Date(e.createdAt).toLocaleString()}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }




// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/api";
// import AddExpense from "./AddExpense";

// /* ===== BALANCE CALC ===== */
// function calculateBalances(expenses, members) {
//   const bal = {};
//   members.forEach((m) => (bal[m._id] = 0));

//   expenses.forEach((e) => {
//     bal[e.paidBy._id] += e.amount;
//     e.splits.forEach((s) => {
//       bal[s.user._id] -= s.amount;
//     });
//   });

//   return bal;
// }

// /* ===== USER SUMMARY ===== */
// function getSummary(balances, members, myId) {
//   const res = [];

//   if (balances[myId] > 0) {
//     members.forEach((m) => {
//       if (balances[m._id] < 0) {
//         res.push({
//           text: `${m.name} owes you ₹${Math.abs(balances[m._id])}`,
//           type: "get"
//         });
//       }
//     });
//   }

//   if (balances[myId] < 0) {
//     members.forEach((m) => {
//       if (balances[m._id] > 0) {
//         res.push({
//           text: `You owe ${m.name} ₹${balances[m._id]}`,
//           type: "owe"
//         });
//       }
//     });
//   }

//   return res;
// }

// export default function GroupDetails() {
//   const { groupId } = useParams();
//   const navigate = useNavigate();

//   const user = JSON.parse(localStorage.getItem("user"));

//   const [group, setGroup] = useState(null);
//   const [expenses, setExpenses] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     loadAll();
//   }, []);

//   const loadAll = async () => {
//     const g = (await api.get("/groups")).data.find(
//       (x) => x._id === groupId
//     );
//     setGroup(g);

//     setExpenses((await api.get(`/expenses/${groupId}`)).data);
//     setAllUsers((await api.get("/auth/users")).data);
//   };

//   const addMember = async (id) => {
//     await api.post(`/groups/${groupId}/add-member`, { userId: id });
//     loadAll();
//   };

//   const removeMember = async (id) => {
//     if (!window.confirm("Remove this member from group?")) return;
//     await api.post(`/groups/${groupId}/remove-member`, { userId: id });
//     loadAll();
//   };

//   const deleteGroup = async () => {
//     if (!window.confirm("Delete group permanently?")) return;
//     await api.delete(`/groups/${groupId}`);
//     navigate("/dashboard");
//   };

//   if (!group) return null;

//   const balances = calculateBalances(expenses, group.members);
//   const summary = getSummary(balances, group.members, user.id);

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       <div className="flex-1 max-w-6xl mx-auto p-6 space-y-6">

//         {/* HEADER */}
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate("/dashboard")}
//             className="text-blue-600 hover:underline"
//           >
//             ← Back
//           </button>
//           <h2 className="text-2xl font-bold">{group.name}</h2>
//         </div>

//         {/* MEMBERS */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-4">Members</h3>
//           <div className="space-y-2">
//             {group.members.map((m) => (
//               <div
//                 key={m._id}
//                 className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg"
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
//                     {m.name[0].toUpperCase()}
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium">{m.name}</p>
//                     <p className="text-xs text-gray-500">{m.email}</p>
//                   </div>
//                 </div>

//                 {m._id !== user.id && (
//                   <button
//                     onClick={() => removeMember(m._id)}
//                     className="text-red-600 hover:underline text-sm"
//                   >
//                     Remove
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* ADD MEMBER */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-3">Add Member</h3>

//           <input
//             placeholder="Search users"
//             className="w-full border px-4 py-2 rounded-lg mb-3"
//             onChange={(e) => setSearch(e.target.value.toLowerCase())}
//           />

//           <div className="max-h-60 overflow-y-auto space-y-2">
//             {allUsers
//               .filter(
//                 (u) =>
//                   !group.members.some((m) => m._id === u._id) &&
//                   (u.name.toLowerCase().includes(search) ||
//                     u.email.toLowerCase().includes(search))
//               )
//               .map((u) => (
//                 <div
//                   key={u._id}
//                   className="flex items-center justify-between border rounded-lg px-4 py-2"
//                 >
//                   <div>
//                     <p className="font-medium">{u.name}</p>
//                     <p className="text-xs text-gray-500">{u.email}</p>
//                   </div>
//                   <button
//                     onClick={() => addMember(u._id)}
//                     className="bg-green-600 text-white px-4 py-1 rounded-lg"
//                   >
//                     Add
//                   </button>
//                 </div>
//               ))}
//           </div>
//         </div>

//         {/* ADD EXPENSE */}
//         <AddExpense group={group} onAdd={loadAll} />

//         {/* SUMMARY */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-3">Your Summary</h3>
//           {summary.length === 0 ? (
//             <p className="text-green-600 font-semibold">
//               🎉 You are all settled
//             </p>
//           ) : (
//             summary.map((s, i) => (
//               <p
//                 key={i}
//                 className={`font-semibold ${
//                   s.type === "owe" ? "text-red-600" : "text-green-600"
//                 }`}
//               >
//                 {s.text}
//               </p>
//             ))
//           )}
//         </div>

//         {/* EXPENSE HISTORY */}
//         <div className="space-y-4">
//           <h3 className="font-semibold">Expense History</h3>

//           {expenses.map((e) => (
//             <div
//               key={e._id}
//               className="bg-white rounded-xl shadow p-6 space-y-2"
//             >
//               <div className="flex justify-between">
//                 <h4 className="font-semibold">{e.description}</h4>
//                 <span className="font-bold">₹{e.amount}</span>
//               </div>

//               <p className="text-sm text-gray-500">
//                 Paid by <strong>{e.paidBy.name}</strong>
//               </p>

//               <div className="space-y-1 text-sm">
//                 {e.splits.map((s, i) => (
//                   <p key={i}>
//                     {s.user.name} → ₹{s.amount}
//                   </p>
//                 ))}
//               </div>

//               <p className="text-xs text-gray-400">
//                 {new Date(e.createdAt).toLocaleString()}
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* DANGER ZONE */}
//         <div className="bg-white rounded-xl shadow p-6 border border-red-200">
//           <h3 className="text-red-600 font-semibold mb-2">
//             Danger Zone
//           </h3>
//           <button
//             onClick={deleteGroup}
//             className="bg-red-600 text-white px-5 py-2 rounded-lg"
//           >
//             Delete Group
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }





// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/api";
// import AddExpense from "./AddExpense";

// /* ===== BALANCE CALC ===== */
// function calculateBalances(expenses, members) {
//   const bal = {};
//   members.forEach((m) => (bal[m._id] = 0));

//   expenses.forEach((e) => {
//     bal[e.paidBy._id] += e.amount;
//     e.splits.forEach((s) => {
//       bal[s.user._id] -= s.amount;
//     });
//   });

//   return bal;
// }

// /* ===== USER SUMMARY ===== */
// function getSummary(balances, members, myId) {
//   const res = [];

//   if (balances[myId] > 0) {
//     members.forEach((m) => {
//       if (balances[m._id] < 0) {
//         res.push({
//           text: `${m.name} owes you ₹${Math.abs(balances[m._id])}`,
//           type: "get"
//         });
//       }
//     });
//   }

//   if (balances[myId] < 0) {
//     members.forEach((m) => {
//       if (balances[m._id] > 0) {
//         res.push({
//           text: `You owe ${m.name} ₹${balances[m._id]}`,
//           type: "owe"
//         });
//       }
//     });
//   }

//   return res;
// }

// export default function GroupDetails() {
//   const { groupId } = useParams();
//   const navigate = useNavigate();

//   const user = JSON.parse(localStorage.getItem("user"));

//   const [group, setGroup] = useState(null);
//   const [expenses, setExpenses] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [search, setSearch] = useState("");
//   const [selectedUsers, setSelectedUsers] = useState([]);

//   useEffect(() => {
//     loadAll();
//   }, []);

//   const loadAll = async () => {
//     const g = (await api.get("/groups")).data.find(
//       (x) => x._id === groupId
//     );
//     setGroup(g);

//     setExpenses((await api.get(`/expenses/${groupId}`)).data);
//     setAllUsers((await api.get("/auth/users")).data);
//   };

//   const toggleUser = (id) => {
//     setSelectedUsers((prev) =>
//       prev.includes(id)
//         ? prev.filter((x) => x !== id)
//         : [...prev, id]
//     );
//   };

//   const addSelectedMembers = async () => {
//     for (const id of selectedUsers) {
//       await api.post(`/groups/${groupId}/add-member`, { userId: id });
//     }
//     setSelectedUsers([]);
//     setSearch("");
//     loadAll();
//   };

//   const deleteGroup = async () => {
//     if (!window.confirm("Delete group permanently?")) return;
//     await api.delete(`/groups/${groupId}`);
//     navigate("/dashboard");
//   };

//   if (!group) return null;

//   const balances = calculateBalances(expenses, group.members);
//   const summary = getSummary(balances, group.members, user.id);

//   const availableUsers = allUsers.filter(
//     (u) => !group.members.some((m) => m._id === u._id)
//   );

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-6xl mx-auto p-6 space-y-6">

//         {/* HEADER */}
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate("/dashboard")}
//             className="text-blue-600 hover:underline"
//           >
//             ← Back
//           </button>
//           <h2 className="text-2xl font-bold">{group.name}</h2>
//         </div>

//         {/* MEMBERS (READ ONLY) */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-4">Members</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             {group.members.map((m) => (
//               <div
//                 key={m._id}
//                 className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg"
//               >
//                 <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
//                   {m.name[0].toUpperCase()}
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium">{m.name}</p>
//                   <p className="text-xs text-gray-500">{m.email}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* ADD MEMBER – DROPDOWN WITH CHECKBOX */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-3">Add Members</h3>

//           <input
//             placeholder="Search by name or email"
//             className="w-full border px-4 py-2 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
//             onChange={(e) => setSearch(e.target.value.toLowerCase())}
//           />

//           <div className="max-h-64 overflow-y-auto border rounded-lg">
//             {availableUsers
//               .filter(
//                 (u) =>
//                   u.name.toLowerCase().includes(search) ||
//                   u.email.toLowerCase().includes(search)
//               )
//               .map((u) => (
//                 <label
//                   key={u._id}
//                   className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
//                 >
//                   <div>
//                     <p className="font-medium">{u.name}</p>
//                     <p className="text-xs text-gray-500">{u.email}</p>
//                   </div>

//                   <input
//                     type="checkbox"
//                     checked={selectedUsers.includes(u._id)}
//                     onChange={() => toggleUser(u._id)}
//                     className="w-4 h-4"
//                   />
//                 </label>
//               ))}

//             {availableUsers.length === 0 && (
//               <p className="text-sm text-gray-500 p-4 text-center">
//                 All users are already in this group
//               </p>
//             )}
//           </div>

//           {selectedUsers.length > 0 && (
//             <button
//               onClick={addSelectedMembers}
//               className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
//             >
//               Add Selected Members
//             </button>
//           )}
//         </div>

//         {/* ADD EXPENSE */}
//         <AddExpense group={group} onAdd={loadAll} />

//         {/* SUMMARY */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-3">Your Summary</h3>
//           {summary.length === 0 ? (
//             <p className="text-green-600 font-semibold">
//               🎉 You are all settled
//             </p>
//           ) : (
//             summary.map((s, i) => (
//               <p
//                 key={i}
//                 className={`font-semibold ${
//                   s.type === "owe" ? "text-red-600" : "text-green-600"
//                 }`}
//               >
//                 {s.text}
//               </p>
//             ))
//           )}
//         </div>

//         {/* EXPENSE HISTORY */}
//         <div className="space-y-4">
//           <h3 className="font-semibold">Expense History</h3>

//           {expenses.map((e) => (
//             <div
//               key={e._id}
//               className="bg-white rounded-xl shadow p-6 space-y-2"
//             >
//               <div className="flex justify-between">
//                 <h4 className="font-semibold">{e.description}</h4>
//                 <span className="font-bold">₹{e.amount}</span>
//               </div>

//               <p className="text-sm text-gray-500">
//                 Paid by <strong>{e.paidBy.name}</strong>
//               </p>

//               <div className="space-y-1 text-sm">
//                 {e.splits.map((s, i) => (
//                   <p key={i}>
//                     {s.user.name} → ₹{s.amount}
//                   </p>
//                 ))}
//               </div>

//               <p className="text-xs text-gray-400">
//                 {new Date(e.createdAt).toLocaleString()}
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* DANGER ZONE */}
//         <div className="bg-white rounded-xl shadow p-6 border border-red-200">
//           <h3 className="text-red-600 font-semibold mb-2">
//             Danger Zone
//           </h3>
//           <button
//             onClick={deleteGroup}
//             className="bg-red-600 text-white px-5 py-2 rounded-lg"
//           >
//             Delete Group
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }






// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/api";
// import AddExpense from "./AddExpense";

// /* ===== BALANCE CALC ===== */
// function calculateBalances(expenses, members) {
//   const bal = {};
//   members.forEach((m) => (bal[m._id] = 0));

//   expenses.forEach((e) => {
//     bal[e.paidBy._id] += e.amount;
//     e.splits.forEach((s) => {
//       bal[s.user._id] -= s.amount;
//     });
//   });

//   return bal;
// }

// /* ===== USER SUMMARY ===== */
// function getSummary(balances, members, myId) {
//   const res = [];

//   if (balances[myId] > 0) {
//     members.forEach((m) => {
//       if (balances[m._id] < 0) {
//         res.push({
//           text: `${m.name} owes you ₹${Math.abs(balances[m._id])}`,
//           type: "get"
//         });
//       }
//     });
//   }

//   if (balances[myId] < 0) {
//     members.forEach((m) => {
//       if (balances[m._id] > 0) {
//         res.push({
//           text: `You owe ${m.name} ₹${balances[m._id]}`,
//           type: "owe"
//         });
//       }
//     });
//   }

//   return res;
// }

// export default function GroupDetails() {
//   const { groupId } = useParams();
//   const navigate = useNavigate();

//   const user = JSON.parse(localStorage.getItem("user"));

//   const [group, setGroup] = useState(null);
//   const [expenses, setExpenses] = useState([]);

//   useEffect(() => {
//     loadAll();
//   }, []);

//   const loadAll = async () => {
//     const g = (await api.get("/groups")).data.find(
//       (x) => x._id === groupId
//     );
//     setGroup(g);

//     setExpenses((await api.get(`/expenses/${groupId}`)).data);
//   };

//   const deleteGroup = async () => {
//     if (!window.confirm("Delete this group permanently?")) return;
//     await api.delete(`/groups/${groupId}`);
//     navigate("/dashboard");
//   };

//   if (!group) return null;

//   const isAdmin = group.createdBy === user.id;

//   const balances = calculateBalances(expenses, group.members);
//   const summary = getSummary(balances, group.members, user.id);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-6xl mx-auto p-6 space-y-6">

//         {/* HEADER */}
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate("/dashboard")}
//             className="text-blue-600 hover:underline"
//           >
//             ← Back
//           </button>
//           <h2 className="text-2xl font-bold">{group.name}</h2>
//         </div>

//         {/* MEMBERS */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-4">Members</h3>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             {group.members.map((m) => (
//               <div
//                 key={m._id}
//                 className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg"
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
//                     {m.name[0].toUpperCase()}
//                   </div>

//                   <div>
//                     <p className="text-sm font-medium">{m.name}</p>
//                     <p className="text-xs text-gray-500">{m.email}</p>
//                   </div>
//                 </div>

//                 {group.createdBy === m._id && (
//                   <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full">
//                     Admin
//                   </span>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* ADD EXPENSE */}
//         <AddExpense group={group} onAdd={loadAll} />

//         {/* SUMMARY */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-3">Your Summary</h3>
//           {summary.length === 0 ? (
//             <p className="text-green-600 font-semibold">
//               🎉 You are all settled
//             </p>
//           ) : (
//             summary.map((s, i) => (
//               <p
//                 key={i}
//                 className={`font-semibold ${
//                   s.type === "owe" ? "text-red-600" : "text-green-600"
//                 }`}
//               >
//                 {s.text}
//               </p>
//             ))
//           )}
//         </div>

//         {/* EXPENSE HISTORY */}
//         <div className="space-y-4">
//           <h3 className="font-semibold">Expense History</h3>

//           {expenses.map((e) => (
//             <div
//               key={e._id}
//               className="bg-white rounded-xl shadow p-6 space-y-2"
//             >
//               <div className="flex justify-between">
//                 <h4 className="font-semibold">{e.description}</h4>
//                 <span className="font-bold">₹{e.amount}</span>
//               </div>

//               <p className="text-sm text-gray-500">
//                 Paid by <strong>{e.paidBy.name}</strong>
//               </p>

//               <div className="space-y-1 text-sm">
//                 {e.splits.map((s, i) => (
//                   <p key={i}>
//                     {s.user.name} → ₹{s.amount}
//                   </p>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* DANGER ZONE – ADMIN ONLY */}
//         {isAdmin && (
//           <div className="bg-white rounded-xl shadow p-6 border border-red-200">
//             <h3 className="text-red-600 font-semibold mb-2">
//               Admin Controls
//             </h3>
//             <button
//               onClick={deleteGroup}
//               className="bg-red-600 text-white px-5 py-2 rounded-lg"
//             >
//               Delete Group
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }





// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/api";
// import AddExpense from "./AddExpense";

// /* ================= BALANCE ================= */
// function calculateBalances(expenses, members) {
//   const bal = {};
//   members.forEach((m) => (bal[m._id] = 0));

//   expenses.forEach((e) => {
//     bal[e.paidBy._id] += e.amount;
//     e.splits.forEach((s) => {
//       bal[s.user._id] -= s.amount;
//     });
//   });

//   return bal;
// }

// /* ================= SUMMARY ================= */
// function getSummary(balances, members, myId) {
//   const res = [];

//   if (balances[myId] > 0) {
//     members.forEach((m) => {
//       if (balances[m._id] < 0) {
//         res.push({
//           text: `${m.name} owes you ₹${Math.abs(balances[m._id])}`,
//           type: "get"
//         });
//       }
//     });
//   }

//   if (balances[myId] < 0) {
//     members.forEach((m) => {
//       if (balances[m._id] > 0) {
//         res.push({
//           text: `You owe ${m.name} ₹${balances[m._id]}`,
//           type: "owe"
//         });
//       }
//     });
//   }

//   return res;
// }

// export default function GroupDetails() {
//   const { groupId } = useParams();
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem("user"));

//   const [group, setGroup] = useState(null);
//   const [expenses, setExpenses] = useState([]);

//   useEffect(() => {
//     loadAll();
//   }, []);

//   const loadAll = async () => {
//     const groupsRes = await api.get("/groups");
//     const g = groupsRes.data.find((x) => x._id === groupId);
//     setGroup(g);

//     const expRes = await api.get(`/expenses/${groupId}`);
//     setExpenses(expRes.data);
//   };

//   const deleteGroup = async () => {
//     if (!window.confirm("Delete this group permanently?")) return;
//     await api.delete(`/groups/${groupId}`);
//     navigate("/dashboard");
//   };

//   if (!group) return null;

//   // ✅ THIS NOW WORKS
//   const isAdmin = group.createdBy?._id === user.id;

//   const balances = calculateBalances(expenses, group.members);
//   const summary = getSummary(balances, group.members, user.id);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-6xl mx-auto p-6 space-y-6">

//         {/* HEADER */}
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate("/dashboard")}
//             className="text-blue-600 hover:underline"
//           >
//             ← Back
//           </button>
//           <h2 className="text-2xl font-bold">{group.name}</h2>
//         </div>

//         {/* MEMBERS */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-4">Members</h3>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             {group.members.map((m) => (
//               <div
//                 key={m._id}
//                 className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg"
//               >
//                 <div>
//                   <p className="font-medium">{m.name}</p>
//                   <p className="text-xs text-gray-500">{m.email}</p>
//                 </div>

//                 {group.createdBy._id === m._id && (
//                   <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full">
//                     Admin
//                   </span>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* ADD EXPENSE */}
//         <AddExpense group={group} onAdd={loadAll} />

//         {/* SUMMARY */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-3">Your Summary</h3>
//           {summary.length === 0 ? (
//             <p className="text-green-600 font-semibold">
//               🎉 You are all settled
//             </p>
//           ) : (
//             summary.map((s, i) => (
//               <p
//                 key={i}
//                 className={`font-semibold ${s.type === "owe" ? "text-red-600" : "text-green-600"
//                   }`}
//               >
//                 {s.text}
//               </p>
//             ))
//           )}
//         </div>

//         {/* EXPENSE HISTORY */}
//         {/* EXPENSE HISTORY */}
//         <div className="space-y-4">
//           <h3 className="font-semibold">Expense History</h3>

//           {expenses.length === 0 ? (
//             <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
//               <p className="text-lg">No expenses yet 💸</p>
//               <p className="text-sm mt-1">
//                 Add an expense to start tracking splits
//               </p>
//             </div>
//           ) : (
//             expenses.map((e) => (
//               <div
//                 key={e._id}
//                 className="bg-white rounded-xl shadow p-6 space-y-2"
//               >
//                 <div className="flex justify-between">
//                   <h4 className="font-semibold">{e.description}</h4>
//                   <span className="font-bold">₹{e.amount}</span>
//                 </div>

//                 <p className="text-sm text-gray-500">
//                   Paid by <strong>{e.paidBy.name}</strong>
//                 </p>

//                 <div className="space-y-1 text-sm">
//                   {e.splits.map((s, i) => (
//                     <p key={i}>
//                       {s.user.name} → ₹{s.amount}
//                     </p>
//                   ))}
//                 </div>

//                 <p className="text-xs text-gray-400">
//                   {new Date(e.createdAt).toLocaleString()}
//                 </p>
//               </div>
//             ))
//           )}
//         </div>


//         {/* 🔥 ADMIN ONLY */}
//         {isAdmin && (
//           <div className="bg-white rounded-xl shadow p-6 border border-red-300">
//             <h3 className="text-red-600 font-semibold mb-2">
//               Admin Controls
//             </h3>
//             <button
//               onClick={deleteGroup}
//               className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
//             >
//               Delete Group
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/api";
// import AddExpense from "./AddExpense";

// /* ================= BALANCE ================= */
// function calculateBalances(expenses, members) {
//   const bal = {};
//   members.forEach((m) => (bal[m._id] = 0));

//   expenses.forEach((e) => {
//     bal[e.paidBy._id] += e.amount;
//     e.splits.forEach((s) => {
//       bal[s.user._id] -= s.amount;
//     });
//   });

//   return bal;
// }

// /* ================= SUMMARY ================= */
// function getSummary(balances, members, myId) {
//   const res = [];

//   if (balances[myId] > 0) {
//     members.forEach((m) => {
//       if (balances[m._id] < 0) {
//         res.push({
//           text: `${m.name} owes you ₹${Math.abs(balances[m._id])}`,
//           type: "get"
//         });
//       }
//     });
//   }

//   if (balances[myId] < 0) {
//     members.forEach((m) => {
//       if (balances[m._id] > 0) {
//         res.push({
//           text: `You owe ${m.name} ₹${balances[m._id]}`,
//           type: "owe"
//         });
//       }
//     });
//   }

//   return res;
// }

// export default function GroupDetails() {
//   const { groupId } = useParams();
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem("user"));

//   const [group, setGroup] = useState(null);
//   const [expenses, setExpenses] = useState([]);

//   // 🔽 ADD MEMBERS STATE
//   const [allUsers, setAllUsers] = useState([]);
//   const [selectedUsers, setSelectedUsers] = useState([]);

//   useEffect(() => {
//     loadAll();
//   }, []);

//   const loadAll = async () => {
//     const groupsRes = await api.get("/groups");
//     const g = groupsRes.data.find((x) => x._id === groupId);
//     setGroup(g);

//     const expRes = await api.get(`/expenses/${groupId}`);
//     setExpenses(expRes.data);

//     // 🔽 load users for add members
//     const usersRes = await api.get("/auth/users");
//     setAllUsers(usersRes.data);
//   };

//   const deleteGroup = async () => {
//     if (!window.confirm("Delete this group permanently?")) return;
//     await api.delete(`/groups/${groupId}`);
//     navigate("/dashboard");
//   };

//   // 🔽 ADD MEMBERS LOGIC
//   const toggleUser = (id) => {
//     setSelectedUsers((prev) =>
//       prev.includes(id)
//         ? prev.filter((x) => x !== id)
//         : [...prev, id]
//     );
//   };

//   const addMembers = async () => {
//     if (selectedUsers.length === 0) return;
//     await api.post(`/groups/${groupId}/add-members`, {
//       userIds: selectedUsers
//     });
//     setSelectedUsers([]);
//     loadAll();
//   };

//   if (!group) return null;

//   const isAdmin = group.createdBy?._id === user.id;
//   const balances = calculateBalances(expenses, group.members);
//   const summary = getSummary(balances, group.members, user.id);


//   const memberIds = group.members.map((m) =>
//     typeof m === "string" ? m : m._id
//   );

//   const nonMembers = allUsers.filter(
//     (u) => !memberIds.includes(u._id)
//   );


//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-6xl mx-auto p-6 space-y-6">

//         {/* HEADER */}
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate("/dashboard")}
//             className="text-blue-600 hover:underline"
//           >
//             ← Back
//           </button>
//           <h2 className="text-2xl font-bold">{group.name}</h2>
//         </div>

//         {/* MEMBERS */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-4">Members</h3>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             {group.members.map((m) => (
//               <div
//                 key={m._id}
//                 className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg"
//               >
//                 <div>
//                   <p className="font-medium">{m.name}</p>
//                   <p className="text-xs text-gray-500">{m.email}</p>
//                 </div>

//                 {group.createdBy._id === m._id && (
//                   <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full">
//                     Admin
//                   </span>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* ✅ ADD MEMBERS SECTION */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-3">Add Members</h3>

//           {nonMembers.length === 0 ? (
//             <p className="text-sm text-gray-500">
//               All users are already in this group
//             </p>
//           ) : (
//             <>
//               <div className="max-h-56 overflow-y-auto border rounded-lg p-3 space-y-2">
//                 {nonMembers.map((u) => (
//                   <label
//                     key={u._id}
//                     className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
//                   >
//                     <input
//                       type="checkbox"
//                       checked={selectedUsers.includes(u._id)}
//                       onChange={() => toggleUser(u._id)}
//                     />
//                     <div>
//                       <p className="text-sm font-medium">{u.name}</p>
//                       <p className="text-xs text-gray-500">{u.email}</p>
//                     </div>
//                   </label>
//                 ))}
//               </div>

//               <button
//                 onClick={addMembers}
//                 className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
//               >
//                 Add Selected Members
//               </button>
//             </>
//           )}
//         </div>

//         {/* ADD EXPENSE */}
//         <AddExpense group={group} onAdd={loadAll} />

//         {/* SUMMARY */}
//         <div className="bg-white rounded-xl shadow p-6">
//           <h3 className="font-semibold mb-3">Your Summary</h3>
//           {summary.length === 0 ? (
//             <p className="text-green-600 font-semibold">
//               🎉 You are all settled
//             </p>
//           ) : (
//             summary.map((s, i) => (
//               <p
//                 key={i}
//                 className={`font-semibold ${s.type === "owe" ? "text-red-600" : "text-green-600"
//                   }`}
//               >
//                 {s.text}
//               </p>
//             ))
//           )}
//         </div>

//         {/* EXPENSE HISTORY */}
//         <div className="space-y-4">
//           <h3 className="font-semibold">Expense History</h3>

//           {expenses.length === 0 ? (
//             <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
//               <p className="text-lg">No expenses yet 💸</p>
//             </div>
//           ) : (
//             expenses.map((e) => (
//               <div
//                 key={e._id}
//                 className="bg-white rounded-xl shadow p-6 space-y-2"
//               >
//                 <div className="flex justify-between">
//                   <h4 className="font-semibold">{e.description}</h4>
//                   <span className="font-bold">₹{e.amount}</span>
//                 </div>

//                 <p className="text-sm text-gray-500">
//                   Paid by <strong>{e.paidBy.name}</strong>
//                 </p>

//                 <div className="space-y-1 text-sm">
//                   {e.splits.map((s, i) => (
//                     <p key={i}>
//                       {s.user.name} → ₹{s.amount}
//                     </p>
//                   ))}
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         {/* ADMIN ONLY */}
//         {isAdmin && (
//           <div className="bg-white rounded-xl shadow p-6 border border-red-300">
//             <h3 className="text-red-600 font-semibold mb-2">
//               Admin Controls
//             </h3>
//             <button
//               onClick={deleteGroup}
//               className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
//             >
//               Delete Group
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import AddExpense from "./AddExpense";

/* ================= BALANCE ================= */
function calculateBalances(expenses, members) {
  const bal = {};
  members.forEach((m) => (bal[m._id] = 0));

  expenses.forEach((e) => {
    bal[e.paidBy._id] += e.amount;
    e.splits.forEach((s) => {
      bal[s.user._id] -= s.amount;
    });
  });

  return bal;
}


function filterExpensesForUser(expenses, myId) {
  return expenses.filter((exp) => {
    // Case 1: I paid
    if (exp.paidBy._id === myId) return true;

    // Case 2: I am in splits
    return exp.splits.some(
      (s) => s.user._id === myId
    );
  });
}


/* ================= SUMMARY ================= */
function getSummary(expenses, members, myId) {
  const summaryMap = {};

  // Initialize balances for other members
  members.forEach((m) => {
    if (m._id !== myId) summaryMap[m._id] = 0;
  });

  expenses.forEach((exp) => {
    const payerId = exp.paidBy._id;

    exp.splits.forEach((split) => {
      const uid = split.user._id;
      const amt = Number(split.amount);

      // I paid → others owe me
      if (payerId === myId && uid !== myId) {
        summaryMap[uid] += amt;
      }

      // Someone else paid → I owe them
      if (payerId !== myId && uid === myId) {
        summaryMap[payerId] -= amt;
      }
    });
  });

  const summary = [];

  members.forEach((m) => {
    if (m._id === myId) return;

    const val = summaryMap[m._id];

    if (val > 0.01) {
      summary.push({
        text: `${m.name} owes you ₹${val.toFixed(2)}`,
        type: "get"
      });
    }

    if (val < -0.01) {
      summary.push({
        text: `You owe ${m.name} ₹${Math.abs(val).toFixed(2)}`,
        type: "owe"
      });
    }
  });

  return summary;
}




export default function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);

  // ✅ ADD MEMBERS STATE
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const groupsRes = await api.get("/groups");
    const g = groupsRes.data.find((x) => x._id === groupId);
    setGroup(g);

    const expRes = await api.get(`/expenses/${groupId}`);
    setExpenses(expRes.data);

    // ✅ CORRECT BACKEND API
    const usersRes = await api.get(
      `/groups/${groupId}/available-users`
    );
    setAvailableUsers(usersRes.data);
  };

  const toggleUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // ✅ BACKEND-SAFE ADD (ONE BY ONE)
  const addMembers = async () => {
    for (const id of selectedUsers) {
      await api.post(`/groups/${groupId}/add-member`, {
        userId: id
      });
    }
    setSelectedUsers([]);
    loadAll();
  };

  const deleteGroup = async () => {
    if (!window.confirm("Delete this group permanently?")) return;
    await api.delete(`/groups/${groupId}`);
    navigate("/dashboard");
  };

  if (!group) return null;

  const isAdmin = group.createdBy?._id === user.id;
  const balances = calculateBalances(expenses, group.members); // optional, for future
  const visibleExpenses = filterExpensesForUser(expenses, user.id);
  const summary = getSummary(visibleExpenses, group.members, user.id);



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* HEADER */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-blue-600 hover:underline"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold">{group.name}</h2>
        </div>

        {/* MEMBERS */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold mb-4">Members</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.members.map((m) => (
              <div
                key={m._id}
                className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg"
              >
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.email}</p>
                </div>

                {group.createdBy._id === m._id && (
                  <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full">
                    Admin
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ✅ ADD MEMBERS */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold mb-3">Add Members</h3>

          {availableUsers.length === 0 ? (
            <p className="text-sm text-gray-500">
              No more users available to add
            </p>
          ) : (
            <>
              <div className="max-h-56 overflow-y-auto border rounded-lg p-3 space-y-2">
                {availableUsers.map((u) => (
                  <label
                    key={u._id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(u._id)}
                      onChange={() => toggleUser(u._id)}
                    />
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </label>
                ))}
              </div>

              <button
                onClick={addMembers}
                disabled={selectedUsers.length === 0}
                className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg"
              >
                Add Selected Members
              </button>
            </>
          )}
        </div>

        {/* ADD EXPENSE */}
        <AddExpense group={group} onAdd={loadAll} />

        {/* SUMMARY */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold mb-3">Your Summary</h3>
          {summary.length === 0 ? (
            <p className="text-green-600 font-semibold">
              🎉 You are all settled
            </p>
          ) : (
            summary.map((s, i) => (
              <p
                key={i}
                className={`font-semibold ${s.type === "owe"
                  ? "text-red-600"
                  : "text-green-600"
                  }`}
              >
                {s.text}
              </p>
            ))
          )}
        </div>

        {/* EXPENSE HISTORY */}
        <div className="space-y-4">
          <h3 className="font-semibold">Expense History</h3>

          {visibleExpenses.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
              <p className="text-lg">No expenses for you 💸</p>
              <p className="text-sm mt-1">
                You were not involved in any expense yet
              </p>
            </div>
          ) : (
            visibleExpenses.map((e) => (
              <div
                key={e._id}
                className="bg-white rounded-xl shadow p-6 space-y-2"
              >
                {/* TOP */}
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">{e.description}</h4>
                  <span className="font-bold">
                    ₹{Number(e.amount).toFixed(2)}
                  </span>
                </div>

                {/* PAID BY */}
                <p className="text-sm text-gray-500">
                  Paid by <strong>{e.paidBy.name}</strong>
                </p>

                {/* SPLITS */}
                <div className="space-y-1 text-sm">
                  {e.splits.map((s, i) => (
                    <p key={i}>
                      {s.user.name} → ₹{Number(s.amount).toFixed(2)}
                    </p>
                  ))}
                </div>

                {/* TIME */}
                <p className="text-xs text-gray-400 pt-2">
                  {new Date(e.createdAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })}
                </p>
              </div>
            ))
          )}
        </div>



        {/* ADMIN ONLY */}
        {isAdmin && (
          <div className="bg-white rounded-xl shadow p-6 border border-red-300">
            <h3 className="text-red-600 font-semibold mb-2">
              Admin Controls
            </h3>
            <button
              onClick={deleteGroup}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
            >
              Delete Group
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
