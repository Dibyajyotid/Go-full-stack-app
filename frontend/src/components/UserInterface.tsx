"use client"

import axios from "axios";
import { useEffect, useState } from "react";
import React from "react";
import CardComponent from "./CardComponent";

interface User {
    id: number;
    name: string;
    email: string;
}

interface UserInterfaceProps {
    backendName: string; //go
}

const UserInterface: React.FC<UserInterfaceProps> = ({ backendName }) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const [users, setUsers] = useState<User[]>([]);
    const [newUser, setNewUser] = useState({ name: '', email: ''})
    const [updateUser, setUpdateUser] = useState({ id: '', name: '', email: ''})

    //defining styles based on the backend
    const backgroundColors: { [key: string]: string } = {
        go: 'bg-slate-500',
    }

    const buttonColors: { [key: string]: string } = {
        go: 'bg-cyan-700 hover:bg-blue-600',
    }

    const bgColor = backgroundColors[backendName as keyof typeof backgroundColors] || 'bg-gray-200'
    const btnColor = buttonColors[backendName as keyof typeof buttonColors] || 'bg-gray-500 hover:bg-gray-600'

    //Fetching all users
    useEffect(() => {
        const fetchData = async() => {
            try {
                const response = await axios.get(`${apiUrl}/api/${backendName}/users`)
                setUsers(response.data.reverse()) //using reverse because i want to show the latest users up top 
            } catch (error) {
                console.error('Error fetching data: ', error)
            }
        }

        fetchData()
    }, [backendName, apiUrl])

    //create a new User
    const createUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${apiUrl}/api/${backendName}/users`, newUser)
            setUsers([response.data, ...users])
            setNewUser({ name: '', email: ''})
        } catch (error) {
            console.error('Error creating user: ', error)
        }
    }

    //updating a user
    const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        try{
            await axios.put(`${apiUrl}/api/${backendName}/users/${updateUser.id}`, { name: updateUser.name, email: updateUser.email })
            setUpdateUser({ id: '', name: '', email: ''}) //to reset the form to blank
            setUsers(
                users.map((user) => {
                    if (user.id === parseInt(updateUser.id)) {
                        return { ...user, name: updateUser.name, email: updateUser.email }
                    }
                    return user
                })
            )
        } catch (error) {
            console.error('Error updating user: ', error)
        }
    }

    //deleting a user
    const deleteUser = async (userId: number) => {
        try {
            await axios.delete(`${apiUrl}/api/${backendName}/users/${userId}`)
            setUsers(users.filter((user) => user.id !== userId))
        } catch (error) {
            console.error('Error deleting user: ', error)
        }
    }

    return (
        <div className={`user-interface ${bgColor} ${backendName} w-full max-w-xxl p-4 my-4 rounded shadow justify-center`}>
            <div className="flex-auto inline-flex flex-wrap justify-between max-w-full">
                <img src={`/expo-${backendName}-app.svg`} alt={`${backendName} Logo`} className="w-20 h-20 mb-6 mx-auto" />
                {/* <h2 className="text-xl font-bold text-center text-white mb-6">{`User Details App in ${backendName.charAt(0).toUpperCase() + backendName.slice(1)}`}</h2> */}
            </div>

            {/*Create user update user */}
            <div className="flex w-full-xl justify-center items-center min-h-screen bg-gray-800 rounded-lg shadow-md mb-4">
                <div className="w-2/3 p-8 bg-slate-500 rounded-lg shadow-md">
                    {/* Your form elements */}
                    {/*creating user or adding user*/}
                    <form onSubmit={createUser} className="mb-6 p-4 bg-blue-100 rounded shadow max-w-xl justify-center">
                        <input 
                            placeholder="Name"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            className="mb-2 w-full p-2 border border-gray-300 rounded"
                        />
                        <input 
                            placeholder="Email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            className="mb-2 w-full p-2 border border-gray-300 rounded"
                        />
                        <button type="submit" className="w-full p-2 text-white bg-slate-700 rounded hover:bg-blue-600 shadow-2xl">
                            Add User
                        </button>
                    </form>

                    {/*update user*/}
                    <form onSubmit={handleUpdateUser} className="mb-6 p-4 bg-blue-100 rounded shadow max-w-xl">
                        <input 
                            placeholder="User Id"
                            value={updateUser.id}
                            onChange={(e) => setUpdateUser({ ...updateUser, id: e.target.value })}
                            className="mb-2 w-full p-2 border border-gray-300 rounded"
                        />
                        <input 
                            placeholder="New Name"
                            value={updateUser.name}
                            onChange={(e) => setUpdateUser({ ...updateUser, name: e.target.value })}
                            className="mb-2 w-full p-2 border border-gray-300 rounded"
                        />
                        <input 
                            placeholder="New Email"
                            value={updateUser.email}
                            onChange={(e) => setUpdateUser({ ...updateUser, email: e.target.value })}
                            className="mb-2 w-full p-2 border border-gray-300 rounded"
                        />
                        <button type="submit" className="w-full p-2 shadow-2xl text-white bg-slate-700 rounded hover:bg-green-600">
                            Update User
                        </button>
                    </form>
                </div>
            </div>

            {/*displaying users*/}
            <div className="w-full grid grid-cols-2 gap-4">
                {users.map((user) => (
                    <div key={user.id} className="grid grid-cols-1 justify-between bg-white p-5 rounded-lg shadow hover:text-white">
                        <CardComponent card={user} />
                        <button onClick={() => deleteUser(user.id)} className={`${btnColor} text-white py-2 px-2 rounded text-xl`}>
                            Delete User
                        </button>
                    </div>
                ))}
            </div> 

        </div>
    )
}

export default UserInterface