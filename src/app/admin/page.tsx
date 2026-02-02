"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Trash2, Ban, CheckCircle } from "lucide-react";

interface UserData {
    id: string;
    email: string;
    role: string;
    status?: "active" | "blocked";
    createdAt?: unknown;
}

export default function AdminDashboard() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersList: UserData[] = [];
            querySnapshot.forEach((doc) => {
                usersList.push({ id: doc.id, ...doc.data() } as UserData);
            });
            setUsers(usersList);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (userId: string) => {
        if (confirm("Are you sure you want to delete this user?")) {
            try {
                await deleteDoc(doc(db, "users", userId));
                setUsers(users.filter((u) => u.id !== userId));
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        }
    };

    const toggleBlockStatus = async (userId: string, currentStatus: string = 'active') => {
        const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
        try {
            await updateDoc(doc(db, "users", userId), { status: newStatus });
            setUsers(users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
        } catch (error) {
            console.error("Error updating user status:", error);
        }
    };

    if (loading) return <div>Loading users...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {/* Stats Card */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold text-gray-700">Total Users</h2>
                <p className="text-4xl font-bold text-blue-600 mt-2">{users.length}</p>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {user.status || 'active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => toggleBlockStatus(user.id, user.status)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        title={user.status === 'blocked' ? "Unblock" : "Block"}
                                    >
                                        {user.status === 'blocked' ? <CheckCircle size={18} /> : <Ban size={18} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
