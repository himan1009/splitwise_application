// import { useState } from "react";
// import api from "../api/api";

// export default function AddExpense({ group, onAdd }) {
//   const [description, setDescription] = useState("");
//   const [amount, setAmount] = useState("");
//   const [paidBy, setPaidBy] = useState(group.members[0]._id);
//   const [selected, setSelected] = useState(
//     group.members.map((m) => m._id)
//   );
//   const [error, setError] = useState("");

//   const toggleUser = (id) => {
//     setSelected((prev) =>
//       prev.includes(id)
//         ? prev.filter((x) => x !== id)
//         : [...prev, id]
//     );
//   };

//   const handleAddExpense = async () => {
//     if (!description || !amount || selected.length === 0) {
//       setError("Please fill all fields");
//       return;
//     }

//     try {
//       await api.post("/expenses", {
//         groupId: group._id,
//         description,
//         amount: Number(amount),
//         paidBy,
//         splitAmong: selected
//       });

//       setDescription("");
//       setAmount("");
//       setSelected(group.members.map((m) => m._id));
//       setError("");
//       onAdd();
//     } catch (err) {
//       setError("Failed to add expense");
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow p-6 space-y-4">
//       <h3 className="text-lg font-semibold">Add Expense</h3>

//       {/* DESCRIPTION + AMOUNT */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <input
//           className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
//           placeholder="Description (e.g. Lunch)"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//         />

//         <input
//           type="number"
//           className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
//           placeholder="Amount"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//         />
//       </div>

//       {/* PAID BY */}
//       <div>
//         <label className="block text-sm font-medium text-gray-600 mb-1">
//           Paid by
//         </label>
//         <select
//           value={paidBy}
//           onChange={(e) => setPaidBy(e.target.value)}
//           className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
//         >
//           {group.members.map((m) => (
//             <option key={m._id} value={m._id}>
//               {m.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* SPLIT AMONG */}
//       <div>
//         <p className="text-sm font-medium text-gray-600 mb-2">
//           Split among
//         </p>
//         <div className="flex flex-wrap gap-3">
//           {group.members.map((m) => (
//             <label
//               key={m._id}
//               className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full cursor-pointer"
//             >
//               <input
//                 type="checkbox"
//                 checked={selected.includes(m._id)}
//                 onChange={() => toggleUser(m._id)}
//                 className="accent-blue-600"
//               />
//               <span className="text-sm">{m.name}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       {/* ERROR */}
//       {error && (
//         <p className="text-sm text-red-600">
//           {error}
//         </p>
//       )}

//       {/* ACTION */}
//       <button
//         onClick={handleAddExpense}
//         className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
//       >
//         Add Expense
//       </button>
//     </div>
//   );
// }




// import { useState } from "react";
// import api from "../api/api";

// export default function AddExpense({ group, onAdd }) {
//   const user = JSON.parse(localStorage.getItem("user"));

//   const [description, setDescription] = useState("");
//   const [amount, setAmount] = useState("");
//   const [paidBy, setPaidBy] = useState(user.id);
//   const [splitType, setSplitType] = useState("equal");
//   const [selected, setSelected] = useState(
//     group.members.map((m) => m._id)
//   );
//   const [values, setValues] = useState({});

//   const toggle = (id) => {
//     setSelected((prev) =>
//       prev.includes(id)
//         ? prev.filter((x) => x !== id)
//         : [...prev, id]
//     );
//   };

//   const submit = async () => {
//     let splits = [];

//     if (splitType === "equal") {
//       const per = amount / selected.length;
//       splits = selected.map((id) => ({
//         user: id,
//         amount: per
//       }));
//     }

//     if (splitType === "amount") {
//       splits = group.members.map((m) => ({
//         user: m._id,
//         amount: Number(values[m._id] || 0)
//       }));
//     }

//     if (splitType === "percent") {
//       splits = group.members.map((m) => ({
//         user: m._id,
//         amount: (Number(values[m._id] || 0) * amount) / 100
//       }));
//     }

//     await api.post("/expenses", {
//       groupId: group._id,
//       description,
//       amount: Number(amount),
//       paidBy,
//       splits
//     });

//     setDescription("");
//     setAmount("");
//     onAdd();
//   };

//   return (
//     <div className="bg-white rounded-xl shadow p-6 space-y-4">
//       <h3 className="font-semibold">Add Expense</h3>

//       <input
//         className="w-full border px-4 py-2 rounded-lg"
//         placeholder="Description"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//       />

//       <input
//         type="number"
//         className="w-full border px-4 py-2 rounded-lg"
//         placeholder="Amount"
//         value={amount}
//         onChange={(e) => setAmount(e.target.value)}
//       />

//       <select
//         className="w-full border px-4 py-2 rounded-lg"
//         value={paidBy}
//         onChange={(e) => setPaidBy(e.target.value)}
//       >
//         {group.members.map((m) => (
//           <option key={m._id} value={m._id}>
//             Paid by {m.name}
//           </option>
//         ))}
//       </select>

//       {/* SPLIT TYPE */}
//       <div className="flex gap-3">
//         {["equal", "amount", "percent"].map((t) => (
//           <button
//             key={t}
//             onClick={() => setSplitType(t)}
//             className={`px-4 py-2 rounded-lg ${
//               splitType === t
//                 ? "bg-blue-600 text-white"
//                 : "bg-gray-100"
//             }`}
//           >
//             {t.toUpperCase()}
//           </button>
//         ))}
//       </div>

//       {/* EQUAL SPLIT – TICK USERS */}
//       {splitType === "equal" && (
//         <div className="space-y-2">
//           {group.members.map((m) => (
//             <label
//               key={m._id}
//               className="flex items-center gap-2"
//             >
//               <input
//                 type="checkbox"
//                 checked={selected.includes(m._id)}
//                 onChange={() => toggle(m._id)}
//               />
//               {m.name}
//             </label>
//           ))}
//         </div>
//       )}

//       {/* AMOUNT / PERCENT */}
//       {splitType !== "equal" && (
//         <div className="grid grid-cols-2 gap-3">
//           {group.members.map((m) => (
//             <input
//               key={m._id}
//               placeholder={m.name}
//               className="border px-3 py-2 rounded-lg"
//               onChange={(e) =>
//                 setValues({ ...values, [m._id]: e.target.value })
//               }
//             />
//           ))}
//         </div>
//       )}

//       <button
//         onClick={submit}
//         className="w-full bg-blue-600 text-white py-2 rounded-lg"
//       >
//         Add Expense
//       </button>
//     </div>
//   );
// }



import { useState } from "react";
import api from "../api/api";

export default function AddExpense({ group, onAdd }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(user.id);
  const [type, setType] = useState("equal");
  const [selected, setSelected] = useState(group.members.map((m) => m._id));
  const [values, setValues] = useState({});

  const toggle = (id) =>
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );

  const submit = async () => {
    let splits = [];

    if (type === "equal") {
      const per = amount / selected.length;
      splits = selected.map((id) => ({ user: id, amount: per }));
    }

    if (type === "amount") {
      splits = group.members.map((m) => ({
        user: m._id,
        amount: Number(values[m._id] || 0)
      }));
    }

    if (type === "percent") {
      splits = group.members.map((m) => ({
        user: m._id,
        amount: (values[m._id] * amount) / 100
      }));
    }

    await api.post("/expenses", {
      groupId: group._id,
      description,
      amount: Number(amount),
      paidBy,
      splits
    });

    setDescription("");
    setAmount("");
    onAdd();
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <h3 className="font-semibold">Add Expense</h3>

      <input
        className="w-full border px-4 py-2 rounded-lg"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="number"
        className="w-full border px-4 py-2 rounded-lg"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <select
        className="w-full border px-4 py-2 rounded-lg"
        value={paidBy}
        onChange={(e) => setPaidBy(e.target.value)}
      >
        {group.members.map((m) => (
          <option key={m._id} value={m._id}>
            Paid by {m.name}
          </option>
        ))}
      </select>

      <div className="flex gap-3">
        {["equal", "amount", "percent"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-2 rounded-lg ${
              type === t ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {type === "equal" && (
        <div className="space-y-2">
          {group.members.map((m) => (
            <label key={m._id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.includes(m._id)}
                onChange={() => toggle(m._id)}
              />
              {m.name}
            </label>
          ))}
        </div>
      )}

      {type !== "equal" && (
        <div className="grid grid-cols-2 gap-3">
          {group.members.map((m) => (
            <input
              key={m._id}
              placeholder={m.name}
              className="border px-3 py-2 rounded-lg"
              onChange={(e) =>
                setValues({ ...values, [m._id]: e.target.value })
              }
            />
          ))}
        </div>
      )}

      <button
        onClick={submit}
        className="w-full bg-blue-600 text-white py-2 rounded-lg"
      >
        Add Expense
      </button>
    </div>
  );
}
