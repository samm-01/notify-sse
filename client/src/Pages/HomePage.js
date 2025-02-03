import React, { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const userId = "123"; // Replace with dynamic userId from auth context or state

function NotificationSystem() {
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [newNotification, setNewNotification] = useState(false);

    // Fetch notifications on component mount
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch(`http://localhost:5050/get-notifications/${userId}`);
                const data = await response.json();

                if (response.ok) {
                    console.log("Fetched Notifications:", data);
                    setNotifications(data); // Set the fetched notifications
                } else {
                    console.error("Error fetching notifications:", data);
                }
            } catch (error) {
                console.error("Network error:", error);
            }
        };

        fetchNotifications();

        // Connect to the SSE endpoint with userId
        const eventSource = new EventSource(`http://localhost:5050/notifications/${userId}`);

        eventSource.onmessage = (event) => {
            const newNotif = JSON.parse(event.data);
            setNotifications((prev) => [newNotif, ...prev]); // Add the new notification to the top of the list
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

    const navigate = useNavigate();

    const goToNotificationsPage = () => {
        navigate("/all-notifications");
    };

    const handleButtonClick = (notifId, action) => {
        // Ensure notifId exists
        if (!notifId) return;

        fetch("http://localhost:5050/notification-response", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ notificationId: notifId, action }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Response recorded:", data);
            })
            .catch((error) => console.error("Error recording response:", error));
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <header className="w-full max-w-3xl flex items-center justify-between bg-white shadow-md p-4 rounded-lg">
                <h1 className="text-lg font-semibold text-gray-800">Notification System</h1>
                <div className="relative" onClick={handleBellClick}>
                    <FaBell className="text-2xl cursor-pointer text-gray-600" />
                    {newNotification && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>}
                </div>
            </header>

            {/* View All Notifications Button */}
            <button
                className="m-4 bg-gray-600 hover:bg-slate-800 text-white px-4 py-2 rounded-md"
                onClick={goToNotificationsPage}
            >
                View All Notifications
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
                <div className="absolute top-16 right-6 w-96 bg-white border border-gray-200 shadow-lg rounded-lg z-10">
                    <h4 className="text-lg font-medium text-gray-700 px-4 py-2 border-b border-gray-100">
                        Notifications
                    </h4>
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
                                            {/* Correct timestamp usage */}
                                            <p className="text-xs text-gray-400">
                                                {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                                            </p>
                                            {/* Accept/Decline Buttons */}
                                            {notif.notificationType === "interactive" && notif.id && (
                                                <div className="mt-2">
                                                    <button
                                                        onClick={() => handleButtonClick(notif.id, "accept")}
                                                        className="bg-green-800 hover:bg-green-600 text-white px-4 py-2 rounded-md mr-2"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleButtonClick(notif.id, "decline")}
                                                        className="bg-red-800 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
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
