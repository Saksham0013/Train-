import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function UserList() {
    const [users, setUsers] = useState([]);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchUsers = async () => {
            const res = await axios.get("http://localhost:5000/api/admin/users", { headers: { Authorization: `Bearer ${token}` } });
            setUsers(res.data);
        };
        fetchUsers();
    }, [token]);

    // const deleteUser = async (id) => {
    //     if (!window.confirm("Delete this user?")) return;
    //     await axios.delete(`http://localhost:5000/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    //     setUsers(users.filter((u) => u._id !== id));
    // };

    return (
        <div>
            <h2>Users</h2>
            <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        {/* <th>Actions</th> */}
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u._id}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            {/* <td><button onClick={() => deleteUser(u._id)}>Delete</button></td> */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
