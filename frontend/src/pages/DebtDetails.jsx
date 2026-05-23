// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/api";

// export default function DebtDetails() {
//     const { userId } = useParams();
//     const navigate = useNavigate();
//     const currentUser = JSON.parse(localStorage.getItem("user"));

//     const [history, setHistory] = useState([]);
//     const [otherUser, setOtherUser] = useState(null);

//     useEffect(() => {
//         loadHistory();
//     }, []);

//     const loadHistory = async () => {
//         const res = await api.get(`/debts/with/${userId}`);
//         setHistory(res.data);

//         if (res.data.length > 0) {
//             const first = res.data[0];
//             const other =
//                 first.from._id === currentUser.id
//                     ? first.to
//                     : first.from;

//             setOtherUser(other);
//         }
//     };

//     // ✅ Calculate Net
//     const calculateNet = () => {
//         let total = 0;

//         history.forEach((d) => {
//             if (d.from._id === currentUser.id) {
//                 total += d.amount; // I gave
//             } else {
//                 total -= d.amount; // I took
//             }
//         });

//         return total;
//     };

//     const net = calculateNet();

//     return (
//         <div className="max-w-3xl mx-auto p-6 space-y-6">

//             <button
//                 onClick={() => navigate("/dashboard")}
//                 className="text-blue-600 hover:underline"
//             >
//                 ← Back
//             </button>

//             {otherUser && (
//                 <div className="bg-white rounded-xl shadow p-6">
//                     <h2 className="text-xl font-bold mb-2">
//                         {otherUser.name}
//                     </h2>

//                     <p className={`font-semibold ${net > 0 ? "text-green-600" : "text-red-600"
//                         }`}>
//                         {net > 0
//                             ? `${otherUser.name} owes you ₹${net.toFixed(2)}`
//                             : net < 0
//                                 ? `You owe ${otherUser.name} ₹${Math.abs(net).toFixed(2)}`
//                                 : "All settled"}
//                     </p>
//                 </div>
//             )}

//             <div className="space-y-4">
//                 <h3 className="font-semibold">Transaction History</h3>

//                 {history.length === 0 ? (
//                     <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
//                         No transactions yet
//                     </div>
//                 ) : (
//                     history.map((d) => (
//                         <div
//                             key={d._id}
//                             className="bg-white rounded-xl shadow p-5 space-y-2"
//                         >
//                             <div className="flex justify-between">
//                                 <p className="font-semibold">
//                                     {d.description}
//                                 </p>
//                                 <p className="font-bold">
//                                     ₹{Number(d.amount).toFixed(2)}
//                                 </p>

//                             </div>

//                             <p className="text-sm text-gray-500">
//                                 {d.from._id === currentUser.id
//                                     ? `You gave money`
//                                     : `You received money`}
//                             </p>

//                             <p className="text-xs text-gray-400">
//                                 {new Date(d.createdAt).toLocaleString("en-IN", {
//                                     dateStyle: "medium",
//                                     timeStyle: "short"
//                                 })}
//                             </p>

//                         </div>
//                     ))
//                 )}
//             </div>
//         </div>
//     );
// }



import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function DebtDetails() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const [history, setHistory] = useState([]);
    const [otherUser, setOtherUser] = useState(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const res = await api.get(`/debts/with/${userId}`);
        setHistory(res.data);

        if (res.data.length > 0) {
            const myId = currentUser._id || currentUser.id;
            const first = res.data[0];

            const other =
                first.from._id === myId
                    ? first.to
                    : first.from;

            setOtherUser(other);
        }
    };

    const calculateNet = () => {
        let total = 0;
        const myId = currentUser._id || currentUser.id;

        history.forEach((d) => {
            if (d.from._id === myId) {
                // I took money → I owe
                total -= d.amount;
            } else {
                // They took money → they owe me
                total += d.amount;
            }
        });

        return total;
    };

    const net = calculateNet();

    const handleDelete = async (id) => {
        console.log("Delete clicked:", id);

        try {
            const res = await api.delete(`/debts/${id}`);
            console.log("Delete response:", res.data);
            loadHistory();
        } catch (err) {
            console.error("Delete error:", err.response?.status);
            console.error("Delete error data:", err.response?.data);
        }
    };

    const handleDeleteAll = async () => {
        try {
            const res = await api.delete(`/debts/all-with/${userId}`);
            console.log("Delete all response:", res.data);
            loadHistory();
        } catch (err) {
            console.error("Delete all error:", err.response?.status);
            console.error("Delete all error data:", err.response?.data);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">

            <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="text-blue-600 hover:underline"
            >
                ← Back
            </button>

            {otherUser && (
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold mb-2">
                        {otherUser.name}
                    </h2>

                    <p className={`font-semibold ${net > 0 ? "text-green-600" : "text-red-600"}`}>
                        {net > 0
                            ? `${otherUser.name} owes you ₹${net.toFixed(2)}`
                            : net < 0
                                ? `You owe ${otherUser.name} ₹${Math.abs(net).toFixed(2)}`
                                : "All settled"}
                    </p>

                    <button
                        type="button"
                        onClick={handleDeleteAll}
                        className="mt-3 text-sm text-red-600 hover:underline"
                    >
                        Delete All Records
                    </button>
                </div>
            )}

            <div className="space-y-4">
                <h3 className="font-semibold">Transaction History</h3>

                {history.length === 0 ? (
                    <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
                        No transactions yet
                    </div>
                ) : (
                    history.map((d) => (
                        <div
                            key={d._id}
                            className="bg-white rounded-xl shadow p-5 space-y-2"
                        >
                            <div className="flex justify-between">
                                <p className="font-semibold">{d.description}</p>
                                <p className="font-bold">₹{Number(d.amount).toFixed(2)}</p>
                            </div>

                            <p className="text-sm text-gray-500">
                                {(d.from._id === (currentUser._id || currentUser.id))
                                    ? `You received money`
                                    : `You gave money`}
                            </p>

                            <p className="text-xs text-gray-400">
                                {new Date(d.createdAt).toLocaleString("en-IN", {
                                    dateStyle: "medium",
                                    timeStyle: "short"
                                })}
                            </p>

                            <button
                                type="button"
                                onClick={() => handleDelete(d._id)}
                                className="text-xs text-red-600 hover:underline"
                            >
                                Delete
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}