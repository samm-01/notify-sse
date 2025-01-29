import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { formatDistanceToNow } from 'date-fns'; // Import relative time function


function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8080/api/notifications')
            .then((res) => res.json())
            .then((data) => setNotifications(data.notifications || []))
            .catch((error) => console.error('Error fetching notifications:', error));

        // Connect to the Socket.IO server
        const socket = io('http://localhost:8080');

        // Listen for the 'newNotification' event
        socket.on('newNotification', (newNotification) => {
            console.log('New notification received:', newNotification);
            setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
        });

        // Cleanup on component unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
            <header className="w-full max-w-3xl bg-white shadow-md p-4 rounded-lg">
                <h1 className="text-xl font-semibold text-gray-800">All Notifications</h1>
            </header>

            <div className="w-full max-w-3xl bg-white mt-4 shadow-md rounded-lg overflow-hidden">
                {notifications.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {notifications.map((notification, index) => (
                            <li key={index} className="px-4 py-4 hover:bg-gray-50 cursor-pointer transition">
                                <div className="flex items-center justify-between gap-4">
                                    {/* Left Section - Profile Image & Notification Content */}
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={notification.profileImage || 'https://via.placeholder.com/40'}
                                            alt="Profile"
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div className="flex flex-col">
                                            <div className="font-medium text-gray-800">{notification.username}</div>
                                            <p className="text-gray-600">{notification.message}</p>
                                        </div>
                                    </div>

                                    {/* Right Section - Timestamp & Document Link */}
                                    <div className="flex flex-col items-end gap-1">
                                        {/* <p className="text-xs text-gray-400">{new Date(notification.timestamp).toLocaleString()}</p> */}
                                        {/* Format relative time */}
                                        <p className="text-xs text-gray-400">
                                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                        </p>
                                        {notification.document && (
                                            <a
                                                href={`http://localhost:8080${notification.document}`}
                                                target="_blank"
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                Download
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 py-4">No notifications available.</p>
                )}
            </div>
        </div>
    );
}

export default NotificationsPage;
