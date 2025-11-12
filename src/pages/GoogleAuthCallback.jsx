import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

export const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const userID = searchParams.get('userID');
    const username = searchParams.get('username');

    if (token && userID && username) {
      localStorage.setItem('token', token);
      localStorage.setItem('userID', userID);
      localStorage.setItem('username', username);

      socket.emit('user-logged-in', {
        userID,
        username,
      });
      navigate('/calendar');
    } else {
      navigate('/login?error=auth_failed');
    }
  }, [searchParams, navigate]);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <p>Trwa logowanie...</p>
    </div>
  );
};