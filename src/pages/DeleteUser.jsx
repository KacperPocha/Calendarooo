import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const DeleteUser = () => {
  const [users, setusers] = useState([]);
  const [userID, setuserID] = useState("");
  const navigate = useNavigate();

  const lista = async () => {
    try {
      const response = await axios.get("http://localhost:5000/userslist");
      if (response) {
        console.log(response.data);
        setusers(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    lista();
  }, []);

  const deleteUser = async () => {
    if (userID) {
      try {
        await axios.delete(`http://localhost:5000/users/${userID}`);
        setusers(users.filter((user) => user.id !== userID));
        setuserID("");
        alert("Użytkownik został usunięty");
      } catch (error) {
        console.error(error);
      }
    } else {
      alert("Proszę zaznaczyć użytkownika do usunięcia");
    }
  };

  return (
    <div className="flex">
      <div>
        <ul className="w-max mt-4">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex border-4 pr-4 pl-4 mb-2 hover:bg-gray-400 cursor-pointer "
              onClick={() => setuserID(user.id)}
              style={{
                backgroundColor: user.id === userID ? '#d3d3d3' : 'transparent' 
              }}
            >
              <p className="mr-4 ">Id: {user.id}</p>
              <p>Nazwa: {user.username}</p>
            </li>
          ))}
        </ul>
      </div>
      <button
        className="ml-24 p-4 border-4 h-16 mt-4 hover:bg-gray-400"
        onClick={deleteUser}
      >
        Usuń użytkownika
      </button>
      <button
        className="ml-12 p-4 border-4 h-16 mt-4 hover:bg-gray-400"
        onClick={() => navigate('/')}
      >
        Wróć
      </button>
    </div>
  );
};
