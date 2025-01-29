// AllNotificationsPage.js
import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";


function AllNotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate(); // 

    const goToHomePage = () => {
        navigate("/"); // 
    };


    useEffect(() => {
        // Fetch notifications from the backend API
        fetch("http://localhost:5001/notifications") // 
            .then((response) => response.json())
            .then((data) => setNotifications(data))
            .catch((error) => console.error("Error fetching notifications:", error));
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <header className="w-full max-w-3xl flex items-center justify-between bg-white shadow-md p-4 rounded-lg">
                <h1 className="text-lg font-semibold text-gray-800">All Notifications</h1>
                <button

                    className="m-4 bg-gray-600 hover:bg-slate-800 text-white px-4 py-2 rounded-md"
                    onClick={goToHomePage}
                >
                    Back to Home Page
                </button>
            </header>

            <div className="w-full max-w-3xl bg-white p-4 shadow-md rounded-lg mt-6">
                <ul className="divide-y divide-gray-100">
                    {notifications.length > 0 ? (
                        notifications.map((notif, index) => (
                            <li key={index} className="px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <img src={notif.profileImage} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-800">{notif.username}</div>
                                        <div className="text-xs text-gray-500">{notif.source}</div>
                                        <p className="text-sm text-gray-700">{notif.message}</p>
                                        <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}</p>
                                        {notif.document && (
                                            <a href={`http://localhost:8080${notif.document}`} download className="text-blue-600 underline text-sm mt-2">
                                                Download Document
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-3 text-center text-sm text-gray-500">No notifications</li>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default AllNotificationsPage;
