import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [debts, setDebts] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    loadGroups();
    loadDebts();
  }, []);

  const loadGroups = async () => {
    try {
      const res = await api.get("/groups");
      setGroups(res.data);
    } catch (err) {
      console.error("Failed to load groups", err);
    }
  };

  const loadDebts = async () => {
    try {
      const res = await api.get("/debts");
      setDebts(res.data);
    } catch (err) {
      console.error("Failed to load debts", err);
    }
  };

  /* ================= PERSONAL NET CALC ================= */
const calculatePersonalNet = () => {
  const map = {};
  const myId = user._id || user.id;

  debts.forEach((d) => {
    const otherUser =
      d.from._id === myId ? d.to : d.from;

    const otherId = otherUser._id;

    if (!map[otherId]) {
      map[otherId] = {
        _id: otherId,
        name: otherUser.name,
        amount: 0
      };
    }

    // 🔥 CORRECT LOGIC
    if (d.from._id === myId) {
      // I TOOK money → I owe
      map[otherId].amount -= Number(d.amount);
    } else {
      // THEY TOOK money → they owe me
      map[otherId].amount += Number(d.amount);
    }
  });

  return Object.values(map);
};

  const personalSummary = calculatePersonalNet();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

      {/* ================= PERSONAL DEBT SECTION ================= */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Personal Debts
          </h2>

          <button
            onClick={() => navigate("/add-debt")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            + Add Debt
          </button>
        </div>

        {personalSummary.length === 0 ? (
          <p className="text-gray-500">
            No personal debts yet.
          </p>
        ) : (
          <div className="space-y-3">
            {personalSummary.map((p, index) => (
              <div
                key={index}
                onClick={() => navigate(`/debt/${p._id}`)}
                className="flex justify-between cursor-pointer hover:bg-gray-50 border rounded-lg px-4 py-3"
              >
                <span className="font-medium">{p.name}</span>

                {p.amount > 0 ? (
                  <span className="text-green-600 font-semibold">
                    {p.name} owes you ₹{p.amount.toFixed(2)}
                  </span>
                ) : p.amount < 0 ? (
                  <span className="text-red-600 font-semibold">
                    You owe {p.name} ₹{Math.abs(p.amount).toFixed(2)}
                  </span>
                ) : (
                  <span className="text-gray-500">
                    Settled up
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= GROUP SECTION ================= */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Your Groups
          </h2>

          <button
            onClick={() => navigate("/create-group")}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Create Group
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            <p className="text-lg">No groups yet 😕</p>
            <p className="text-sm mt-1">
              Create a group to start splitting expenses 💸
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((g) => (
              <div
                key={g._id}
                onClick={() => navigate(`/group/${g._id}`)}
                className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-xl transition"
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  {g.name}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {g.members.length} members
                </p>

                <div className="mt-4 text-blue-600 font-medium text-sm">
                  View details →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}