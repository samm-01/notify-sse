import React, { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

function NotificationSystem() {
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [newNotification, setNewNotification] = useState(false);

    useEffect(() => {
        const eventSource = new EventSource("http://localhost:5001/notifications");

        eventSource.onmessage = (event) => {
            const newNotif = JSON.parse(event.data);
            setNotifications((prev) => [newNotif, ...prev]); // Add new notifications to the top
            setNewNotification(true);
        };

        eventSource.onerror = () => {
            console.error("SSE connection error");
            eventSource.close();
        };

        return () => eventSource.close();
    }, []);

    const handleBellClick = () => {
        setShowNotifications(!showNotifications);
        setNewNotification(false);
    };

    const goToNotificationsPage = () => {
        alert("Redirecting to Notifications Page...");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            {/* Header */}
            <header className="w-full max-w-3xl flex items-center justify-between bg-white shadow-md p-4 rounded-lg">
                <h1 className="text-lg font-semibold text-gray-800">Notification System</h1>
                <div className="relative" onClick={handleBellClick}>
                    <FaBell className="text-2xl cursor-pointer text-gray-600" />
                    {newNotification && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>}
                </div>
            </header>

            {/* View All Notifications Button */}
            <button className="m-4 bg-gray-600 hover:bg-slate-800 text-white px-4 py-2 rounded-md" onClick={goToNotificationsPage}>
                View All Notifications
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
                <div className="absolute top-16 right-6 w-96 bg-white border border-gray-200 shadow-lg rounded-lg z-10">
                    <h4 className="text-lg font-medium text-gray-700 px-4 py-2 border-b border-gray-100">Notifications</h4>
                    <ul className="divide-y divide-gray-100">
                        {notifications.length > 0 ? (
                            notifications.map((notif, index) => (
                                <li key={index} className="px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        {/* Profile Image */}
                                        <img src={notif.profileImage} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-800">{notif.username}</div>
                                            <div className="text-xs text-gray-500">{notif.source}</div>
                                            <p className="text-sm text-gray-700">{notif.message}</p>
                                            <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(), { addSuffix: true })}</p>
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
            )}
        </div>
    );
}

export default NotificationSystem;
