import React from "react";

export const Menu = ({ setIsPopUpOpen, onLogoutClick, user, setMode }) => {
    return (
        <div className="bg-blue-500 w-screen mb-8">
            <div className="grid grid-cols-12">
                <a className="justify-self-center p-3" href="/calendar">Kalendarz</a>
                <a className="justify-self-center p-3" href="/charts">Wykresy</a>
                <a className="justify-self-center p-3" href="">Raporty</a>
                <div className="flex col-span-4 col-start-10 justify-end mr-6 content-center p-3">
                    <button className="mr-4" onClick={() => {setIsPopUpOpen(true) ; setMode("main")}}>
                        ⚙️
                    </button>
                    <button className="text-xl" onClick={onLogoutClick}>
                        🚪
                    </button>
                    <p className="text-md cursor-default ml-4">
                        Witaj, {user?.username}
                    </p>
                </div>
            </div>

        </div>
    );
};
